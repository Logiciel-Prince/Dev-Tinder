const express = require('express');
const { userAuth } = require('../middleware/auth');
const bcrypt = require('bcrypt');

const profileRouter = express.Router();

profileRouter.get("/view", userAuth, async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

profileRouter.put("/update", userAuth, async (req, res) => {
    try {
        const allowedFields = ['firstName', 'lastName', 'email', 'age', 'gender', 'photoUrl', 'about', 'skills'];
        const updates = Object.keys(req.body).filter(key => allowedFields.includes(key));

        if (!updates.length) {
            return res.status(400).json({ error: "No valid fields to update." });
        }

        const loggedInUser = req.user;

        Object.keys(req.body).forEach((key) => {
            if (req.body[key] !== undefined) {
                loggedInUser[key] = req.body[key];
            }
        });

        await loggedInUser.save();

        res.status(200).json({
            message: ` ${loggedInUser.firstName} your profile updated successfully`,
            user: loggedInUser
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to update profile " + error.message });
    }
});

profileRouter.patch("/changePassword", userAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const loggedInUser = req.user;

        const isValidPassword = await loggedInUser.comparePassword(currentPassword);

        if (isValidPassword) {
            loggedInUser.password = await bcrypt.hash(newPassword, 10);
            await loggedInUser.save();
            res.status(200).json({ message: "Password changed successfully" });
        } else {
            res.status(401).json({ error: "Invalid current password" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to change password " + error.message });
    }
});

module.exports = profileRouter;