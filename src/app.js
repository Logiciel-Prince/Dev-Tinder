// import express from 'express';
// import { createServer } from 'http';

const express = require("express");
const { createServer } = require("http");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const authRouter = require("./Routes/auth");
const profileRouter = require("./Routes/profile");
const requestRouter = require("./Routes/request");
const userRouter = require("./Routes/user");

let app = express();
let server = createServer(app);

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.get("/hello", (req, res) => {
    res.send("Hello, From Prince!");
});

app.use(express.json(), cookieParser()); // Middleware to parse JSON bodies and cookies

// Use authentication routes
app.use('/auth', authRouter);

// Use authentication routes
app.use('/profile', profileRouter);

// Use request routes
app.use('/request', requestRouter);

// use user routes
app.use('/user', userRouter);

connectDB().then(() => {
    console.log('Database connection established');
    server.listen(3000);
}).catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
});

