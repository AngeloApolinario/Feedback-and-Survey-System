const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  type: {
    type: String,
    enum: ["multiple-choice", "checkbox", "text"],
    default: "multiple-choice",
  },
  options: [String],
});

const surveySchema = new mongoose.Schema({
  title: String,
  description: String,
  questions: [questionSchema],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  totalResponses: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Survey", surveySchema);
