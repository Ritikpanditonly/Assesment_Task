const mongoose = require("mongoose");
const connectDatabase = async () => {
    if (!process.env.MONGODB_URI) {
        console.log("No MONGODB_URI set. Using local file storage.");
        return false;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 3000,
        });
        console.log("MongoDB connected successfully.");
        return true;
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        console.log("Using local file storage instead.");
        return false;
    }
};

module.exports = connectDatabase;
