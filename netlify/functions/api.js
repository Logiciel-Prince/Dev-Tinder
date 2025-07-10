require('dotenv').config();
const express = require("express");
const serverless = require("serverless-http");
const connectDB = require("../../src/config/database");
const cookieParser = require("cookie-parser");
const authRouter = require("../../src/Routes/auth");
const profileRouter = require("../../src/Routes/profile");
const requestRouter = require("../../src/Routes/request");
const userRouter = require("../../src/Routes/user");
const cors = require("cors");

const app = express();

const corsObject = {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
};

app.use(cors(corsObject));
app.use(express.json());
app.use(cookieParser());

// Health check endpoint
app.get('/.netlify/functions/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/.netlify/functions/api/auth', authRouter);
app.use('/.netlify/functions/api/profile', profileRouter);
app.use('/.netlify/functions/api/request', requestRouter);
app.use('/.netlify/functions/api/user', userRouter);

// Connect to database
connectDB().catch((error) => {
    console.error('Database connection failed:', error);
});

module.exports.handler = serverless(app);