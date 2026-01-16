const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mentor",
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    default: ""
  },
  replyToken: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ["pending", "answered"],
    default: "pending"
  }
}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);