const mongoose = require('mongoose');

let cachedConnection = null;

// Connect to MongoDB using Mongoose
const connectDB = async () => {
    if (cachedConnection && mongoose.connection.readyState === 1) {
        return cachedConnection;
    }

    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Tinder';
        const connection = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10
        });
        
        cachedConnection = connection;
        console.log('MongoDB connected successfully');
        return connection;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

module.exports = connectDB;
