const mongoose = require("mongoose");

const mentorSchema = new mongoose.Schema({
  name: String,
  company: String,
  email: {
    type: String,
    required: true
  },
  photo:String,
  bio: String
}, { timestamps: true });

module.exports = mongoose.model("Mentor", mentorSchema);
