const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String },
  questions: [
    {
      questionText: { type: String, required: true },
      options: [String],
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Survey", surveySchema);
