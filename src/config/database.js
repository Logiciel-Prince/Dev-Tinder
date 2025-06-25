const mongoose = require('mongoose');

// Connect to MongoDB using Mongoose
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/Tinder');
    } catch (error) {
        process.exit(1);
    }
}

module.exports = connectDB;
