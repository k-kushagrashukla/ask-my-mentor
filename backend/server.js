require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const questionRoutes = require('./routes/question.routes');

const app = express();

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://ask-my-mentor.vercel.app"
];

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman / mobile apps
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Handle preflight requests safely (Express 5 compatible)
app.options("/*", cors());

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);

// DB + Server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => console.error(err));
