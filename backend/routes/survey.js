const router = require("express").Router();
const verify = require("./verifyToken");
const Survey = require("../models/Survey");
const Response = require("../models/Response");
const surveyController = require("../controller/surveyController");

router.post("/create", verify, async (req, res) => {
  try {
    const newSurvey = new Survey({
      creator: req.user._id,
      title: req.body.title,
      description: req.body.description,
      questions: req.body.questions,
    });
    const savedSurvey = await newSurvey.save();
    res.status(201).send(savedSurvey);
  } catch (err) {
    res.status(400).send({ message: "Error saving survey", error: err });
  }
});

router.get("/:id/analytics", verify, surveyController.getSurveyAnalytics);

router.post("/answer", verify, surveyController.submitAnswer);

router.get("/dashboard", verify, async (req, res) => {
  try {
    const userId = req.user._id;

    const exploreSurveys = await Survey.find({ creator: { $ne: userId } })
      .populate("creator", "username")
      .lean();
    const mySurveys = await Survey.find({ creator: userId }).lean();

    const userResponses = await Response.find({ user: userId }, "surveyId");
    const respondedSurveyIds = userResponses.map((r) => r.surveyId.toString());

    const exploreWithStatus = exploreSurveys.map((s) => ({
      ...s,
      hasResponded: respondedSurveyIds.includes(s._id.toString()),
    }));

    res.json({ explore: exploreWithStatus, mySurveys });
  } catch (err) {
    res.status(500).send(err);
  }
});

// --- UTILS ---
router.delete("/:id", verify, async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).send("Not found");
    if (survey.creator.toString() !== req.user._id)
      return res.status(401).send("Unauthorized");

    await Survey.findByIdAndDelete(req.params.id);
    await Response.deleteMany({ surveyId: req.params.id });
    res.send("Survey and its data deleted");
  } catch (err) {
    res.status(400).send(err);
  }
});

router.put("/:id", verify, async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (survey.creator.toString() !== req.user._id)
      return res.status(401).send("Unauthorized");
    const updated = await Survey.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.send(updated);
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
