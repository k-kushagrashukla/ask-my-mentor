const express = require("express");
const Question = require("../models/question");
const authMiddleware = require("../middleware/auth.middleware");
const transporter=require("../utils/mailer");
const Mentor=require("../models/mentor");

const router = express.Router();

// Ask a question
router.post("/ask", authMiddleware, async (req, res) => {
  try {
    const { mentorId, question } = req.body;

    if (!mentorId || !question) {
      return res.status(400).json({ message: "Mentor ID or question missing" });
    }

    const crypto = require("crypto");
    const replyToken = crypto.randomBytes(32).toString("hex");

    // 🔍 Find mentor in DB
    const mentor = await Mentor.findById(mentorId);

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

   // 💾 Save question
const newQuestion = await Question.create({
  user: req.userId,
  mentor: mentor._id,   // store relation
  mentorName: mentor.name,
  mentorCompany: mentor.company,
  question,
  replyToken
});



    const replyLink = `${process.env.FRONTEND_URL}/mentor-reply.html?token=${replyToken}`;

    // 📧 Send email
    // 📧 Send email (non-blocking on cloud)
try {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: mentor.email,
    subject: "New Student Question - AskMyMentor",
    html: `
      <h2>You've received a new student question</h2>
      <p><b>Mentor:</b> ${mentor.name}</p>
      <p><b>Company:</b> ${mentor.company}</p>
      <p><b>Question:</b></p>
      <p>${question}</p>
      <br>
      <a href="${replyLink}" target="_blank">
         👉 Click here to reply to this student
      </a>
    `
  });
} catch (err) {
  console.log("📧 Email skipped (cloud SMTP blocked):", err.message);
}


    res.status(201).json({
      message: "Question sent successfully",
      question: newQuestion
    });

  } catch (err) {
    console.error("ASK ERROR:", err);
    res.status(500).json({ message: "Failed to send question" });
  }
});



//Mentor reply(no auth)
router.post("/reply/:token",async(req,res)=>{
  try{
    const {token} = req.params;
    const {answer} = req.body;

    const question=await Question.findOne({replyToken:token});

    if(!question)
      return res.status(404).json({message:"Invalid or expired link"});

    question.answer=answer;
    question.status="answered";
    await question.save();

    res.json({message:"Reply sent successfully"});

  } catch(err){
    res.status(500).json({message:"Failed to send reply"});
  }
});

module.exports = router;

// Get my questions (student dashboard)
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const questions = await Question.find({ user: req.userId })
      .populate("mentor", "name company photo")
      .sort({ createdAt: -1 });

    res.json(questions);
  } catch (err) {
    console.error("MY QUESTIONS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch questions" });
  }
});

