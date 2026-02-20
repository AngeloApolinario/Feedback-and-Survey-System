const mongoose = require("mongoose");

const ResponseSchema = new mongoose.Schema({
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Survey",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  responses: [
    {
      questionIndex: Number,
      selectedOption: mongoose.Schema.Types.Mixed, 
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Response", ResponseSchema);
