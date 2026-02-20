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
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String },

  isPublic: { type: Boolean, default: true },
  acceptingResponses: { type: Boolean, default: true },

  questions: [
    {
      questionText: String,
      type: { type: String, enum: ["multiple-choice", "checkbox", "text"] },
      options: [String],
    },
  ],
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Survey", surveySchema);
