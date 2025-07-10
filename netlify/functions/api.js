require('dotenv').config();
const express = require("express");
const serverless = require("serverless-http");
const connectDB = require("../../src/config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Initialize express
const app = express();

// Middleware
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

// Dynamically import routes to improve bundling
const setupRoutes = async () => {
    const authRouter = require("../../src/Routes/auth");
    const profileRouter = require("../../src/Routes/profile");
    const requestRouter = require("../../src/Routes/request");
    const userRouter = require("../../src/Routes/user");

    app.use('/.netlify/functions/api/auth', authRouter);
    app.use('/.netlify/functions/api/profile', profileRouter);
    app.use('/.netlify/functions/api/request', requestRouter);
    app.use('/.netlify/functions/api/user', userRouter);
};

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Initialize routes and database
setupRoutes().then(() => {
    return connectDB();
}).catch((error) => {
    console.error('Initialization error:', error);
});

// Export the serverless function
module.exports.handler = serverless(app);