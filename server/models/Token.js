const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    token: String,
    type: {
        type: String,
        enum: ["refresh", "verify", "reset"]
    },
    expiresAt: Date
}, { timestamps: true });

module.exports = mongoose.model("Token", tokenSchema);