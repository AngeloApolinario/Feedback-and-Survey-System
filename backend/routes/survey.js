const router = require("express").Router();
const verify = require("./verifyToken");
//MODELS
const Survey = require("../models/Survey");
const Response = require("../models/Response");

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

router.post("/answer", verify, async (req, res) => {
  try {
    const newResponse = new Response({
      surveyId: req.body.surveyId,
      respondentId: req.user._id,
      answers: req.body.answers,
    });
    await newResponse.save();
    res.status(201).send("Response saved successfully");
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/dashboard", verify, async (req, res) => {
  try {
    const explore = await Survey.find({
      creator: { $ne: req.user._id },
    }).populate("creator", "username");

    const mySurveys = await Survey.find({ creator: req.user._id });

    res.json({ explore, mySurveys });
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/", async (req, res) => {
  try {
    const surveys = await Survey.find().sort({ createdAt: -1 });
    res.json(surveys);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", verify, async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
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
