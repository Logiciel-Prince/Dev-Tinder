const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const authRouter = express.Router();

authRouter.post("/signup", async(req, res) => {

    const { firstName, lastName, email, password, age, gender } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({  // Changed variable name from User to newUser
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: passwordHash, // Await the hash operation
        age: age,
        gender: gender,
        createdAt: new Date(),
        updatedAt: new Date()
    });

    try {
        await newUser.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("Error saving user:", error);
        res.status(500).json({ error: "Failed to create user" });
    }
});

authRouter.post("/login", async (req, res) => {

    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        const isValidPassword = await user.comparePassword(password);

        if (user && isValidPassword) {
            const token = await user.getJWTToken();

            res.cookie("token", token);
            res.status(200).json({ message: "Login successful", user });
            return;
        }

        res.status(401).json({ error: "Invalid credentials" });
    }
    catch (error) {
        res.status(500).json({ error: "Login failed " + error.message });
    }
});

authRouter.post("/logout", async (req, res) => {
    try {
        res.clearCookie("token");
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ error: "Logout failed " + error.message });
    }
});

module.exports = authRouter;