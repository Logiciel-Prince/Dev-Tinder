const express = require('express');
const { userAuth } = require('../middleware/auth'); // Assuming you have a userAuth middleware for authentication
const ConnectionRequestModel = require('../models/connectionRequest');

const requestRouter = express.Router();

requestRouter.post("/send/:status/:userId", userAuth, async (req, res) => {
    try {

        const loggedInUser = req.user; // Get the logged-in user from the request object
        const { status, userId } = req.params;

        const allowedTypes = ['interested', 'ignored'];
        if (!allowedTypes.includes(status)) {
            return res.status(400).json({ error: "Invalid status type. Allowed types are 'interested' or 'ignored'." });
        }

        const existingConnectionRequest = await ConnectionRequestModel.findOne({
            $or: [
                { sender: loggedInUser._id, receiver: userId },
                { sender: userId, receiver: loggedInUser._id }
            ]
        });

        if (existingConnectionRequest) {
            return res.status(400).json({ error: "Connection request already exists between these users." });
        };

        const connectionRequest = new ConnectionRequestModel({
            sender: loggedInUser._id, // Use the logged-in user's ID
            receiver: userId, // The user ID of the person receiving the request
            status, // The status of the request (e.g., 'pending', 'accepted', 'rejected')
            message: req?.body?.message || null // Optional message with the request
        });

        connectionRequest.save();

        // Here you would typically save the request to a database
        // For demonstration, we will just return the request data
        res.status(201).json({
            message: "Request sent successfully",
            connectionRequest
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to send request: " + error.message });
    }
});

requestRouter.post("/review/:status/:requestId", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user; // Get the logged-in user from the request object
        const { status, requestId } = req.params;

        const allowedTypes = ['accepted', 'rejected'];
        if (!allowedTypes.includes(status)) {
            return res.status(400).json({ error: "Invalid status type. Allowed types are 'interested' or 'ignored'." });
        }

        const connectionRequest = await ConnectionRequestModel.findOne({
            _id: requestId,
            receiver: loggedInUser._id, // Ensure the logged-in user is the receiver of the request
            status: 'interested'
        });

        if (!connectionRequest) {
            return res.status(404).json({ error: "Connection request not found" });
        }

        if (connectionRequest.receiver.toString() !== loggedInUser._id) {
            return res.status(403).json({ error: "You are not authorized to review this request" });
        }

        connectionRequest.status = status;
        await connectionRequest.save();

        res.status(200).json({ message: "Request reviewed successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to review request: " + error.message });
    }
});

module.exports = requestRouter;