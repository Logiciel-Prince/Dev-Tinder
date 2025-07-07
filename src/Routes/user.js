const express = require('express');
const { userAuth } = require('../middleware/auth'); // Assuming you have a userAuth middleware
const ConnectionRequestModel = require('../models/connectionRequest');
const UserModel = require('../models/user');

const userRouter = express.Router();

const USER_SAFE_DATA = '_id firstName lastName age gender photoUrl about skills';

userRouter.get("/requests", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const data = await ConnectionRequestModel.find({
            receiver: loggedInUser._id,
            status: 'interested'
        }).populate('sender', USER_SAFE_DATA) // Populate sender details;

        res.status(200).json({
            message: "Connection requests fetched successfully",
            requests: data
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch connection requests: " + error.message });
    }
});

userRouter.get("/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connections = await ConnectionRequestModel.find({
            $or: [
                { sender: loggedInUser._id, status: 'accepted' },
                { receiver: loggedInUser._id, status: 'accepted' }
            ]
        }).populate('sender', USER_SAFE_DATA)
            .populate('receiver', USER_SAFE_DATA);

        if (!connections || connections.length === 0) {
            return res.status(404).json({ message: "No connections found." });
        }

        const data = connections.map((row) => row.sender._id.toString() === loggedInUser._id.toString() ? row.receiver : row.sender);

        res.status(200).json({
            message: "Connections fetched successfully",
            data
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch connections: " + error.message });
    }
});

userRouter.get("/feed", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        // find all users except the logged-in user and their connections
        const connectionRequests = await ConnectionRequestModel.find({
            $or: [
                { sender: loggedInUser._id },
                { receiver: loggedInUser._id }
            ]
        }).select('sender receiver');

        const hideUsersFromFeed = new Set();
        connectionRequests.forEach((request) => {
            hideUsersFromFeed.add(request.sender.toString());
            hideUsersFromFeed.add(request.receiver.toString());
        });

        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const feed = await UserModel.find({
            $and: [
                { _id: { $ne: loggedInUser._id } },
                { _id: { $nin: Array.from(hideUsersFromFeed) } }
            ]
        }).select(USER_SAFE_DATA).skip(skip).limit(limit);

        res.status(200).json({
            message: "Feed fetched successfully",
            feed
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch feed: " + error.message });
    }
});

module.exports = userRouter;