const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    // 🩸 Blood info
    bloodGroup: {
        type: String,
        required: true
    },

    // 📍 Location (GeoJSON for nearby search)
    location: {
        type: {
            type: String,
            default: "Point"
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },

    // ⚡ Urgency level
    urgency: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    },

    // 👤 Who created request
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // 🧑‍🤝‍🧑 Donor assigned (optional initially)
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    // 🧑 Receiver (can be same as requestedBy or separate)
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    // ✅ Request status (combined logic)
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "fulfilled"],
        default: "pending"
    }

}, { timestamps: true });

// 📌 Enable location-based search
requestSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Request", requestSchema);