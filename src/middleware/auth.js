const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");

const userAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const decoded = await jwt.verify(token, "PrinceKumar");
        
        const user = await UserModel.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        req.user = user; // Attach the user to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(401).json({ error: "Invalid token" });
    }
}

module.exports = {
    userAuth
};