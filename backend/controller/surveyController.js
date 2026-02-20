const Response = require("../models/Response");
const Survey = require("../models/Survey");

exports.getSurveyAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const survey = await Survey.findById(id).lean();
    if (!survey) return res.status(404).json({ error: "Survey not found" });

    const allResponses = await Response.find({ surveyId: id }).populate(
      "user",
      "username email",
    );

    const processedQuestions = (survey.questions || []).map((q, qIdx) => {
      const results = {
        questionText: q.questionText,
        type: q.type,
        totalResponsesForQ: 0,
        processedOptions: [],
        textResponses: [],
      };

      if (q.type !== "text") {
        const counts = {};
        (q.options || []).forEach((opt) => (counts[opt] = 0));

        allResponses.forEach((resObj) => {
          const answerObj = resObj.responses?.find(
            (r) => Number(r.questionIndex) === qIdx,
          );
          const userSelection = answerObj?.selectedOption;

          if (
            userSelection !== undefined &&
            userSelection !== null &&
            userSelection !== ""
          ) {
            results.totalResponsesForQ++;
            if (Array.isArray(userSelection)) {
              userSelection.forEach((opt) => {
                if (counts.hasOwnProperty(opt)) counts[opt]++;
              });
            } else {
              if (counts.hasOwnProperty(userSelection)) counts[userSelection]++;
            }
          }
        });

        results.processedOptions = (q.options || []).map((opt) => ({
          text: opt,
          count: counts[opt] || 0,
          percentage:
            results.totalResponsesForQ > 0
              ? parseFloat(
                  ((counts[opt] / results.totalResponsesForQ) * 100).toFixed(1),
                )
              : 0,
        }));
      } else {
        results.textResponses = allResponses
          .map(
            (r) =>
              r.responses?.find((res) => Number(res.questionIndex) === qIdx)
                ?.selectedOption,
          )
          .filter((val) => val);
        results.totalResponsesForQ = results.textResponses.length;
      }
      return results;
    });

    const individualResponses = allResponses.map((r) => ({
      username: r.user?.username || "Anonymous",
      email: r.user?.email || "N/A",
      submittedAt: r.createdAt,
      answers: (r.responses || []).map((ans) => ({
        question:
          survey.questions[ans.questionIndex]?.questionText ||
          "Deleted Question",
        answer: ans.selectedOption,
      })),
    }));

    res.json({
      title: survey.title,
      totalResponses: allResponses.length,
      questions: processedQuestions,
      individualResponses,
    });
  } catch (err) {
    console.error("Analytics Error:", err);
    res.status(500).json({ error: "Failed to load analytics" });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { surveyId, responses } = req.body;
    const userId = req.user._id;

    const existingResponse = await Response.findOne({ surveyId, user: userId });
    if (existingResponse) {
      return res
        .status(400)
        .json({ error: "You have already completed this survey." });
    }

    const newResponse = new Response({
      surveyId,
      user: userId,
      responses: responses.map((r) => ({
        questionIndex: Number(r.questionIndex),
        selectedOption: r.selectedOption,
      })),
    });
    await newResponse.save();

    await Survey.findByIdAndUpdate(surveyId, {
      $inc: { totalResponses: 1 },
    });

    res.status(201).json({ message: "Survey submitted successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save response." });
  }
};
