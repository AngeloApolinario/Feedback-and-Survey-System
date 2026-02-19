const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Survey",
    required: true,
  },
  respondentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  answers: [
    {
      questionIndex: Number,
      selectedOption: String,
    },
  ],
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Response", responseSchema);
