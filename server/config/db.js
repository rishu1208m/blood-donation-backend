const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // ✅ These options ensure stable connection on Render
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`✅ Database: ${conn.connection.name}`); // confirms 'blooddonation'
    } catch (err) {
        console.error("❌ MongoDB connection failed:", err.message);
        process.exit(1); // Stop server if DB fails
    }
};

module.exports = connectDB;