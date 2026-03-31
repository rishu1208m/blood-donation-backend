const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["donor", "receiver", "admin"],
        default: "donor"
    },

    // 🔐 Email verification
    isVerified: {
        type: Boolean,
        default: false
    },

    // 🔑 OTP system
    otp: String,
    otpExpiry: Date,

    // 🔐 Login security (ANTI BRUTE FORCE)
    loginAttempts: {
        type: Number,
        default: 0
    },

    lockUntil: Date,

    // 🩸 Blood info
    bloodGroup: {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    },

    // 📍 Location (GeoJSON)
    location: {
        type: {
            type: String,
            default: "Point"
        },
        coordinates: {
            type: [Number], // [lng, lat]
            default: [0, 0]
        }
    },

    // 🧍 Donor status
    isAvailable: {
        type: Boolean,
        default: true
    },

    lastDonated: Date,

    // ⭐ Rating
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    }

}, { timestamps: true });


// 🔥 Geo index for search
userSchema.index({ location: "2dsphere" });


// 🔐 Hide sensitive fields
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.otp;
    delete obj.otpExpiry;
    return obj;
};

module.exports = mongoose.model("User", userSchema);