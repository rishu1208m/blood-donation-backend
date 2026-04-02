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

    // 🩸 Blood info — ✅ now required, no empty string accepted
    bloodGroup: {
        type: String,
        required: [true, "Blood group is required"],
        enum: {
            values: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
            message: "Invalid blood group"
        }
    },

    // 📍 Location (GeoJSON) — ✅ optional, sparse index prevents null island [0,0]
    location: {
        type: {
            type: String,
            enum: ["Point"]
        },
        coordinates: {
            type: [Number] // [lng, lat]
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

// ✅ sparse:true so users without location don't cause index errors
userSchema.index({ location: "2dsphere" }, { sparse: true });

// 🔐 Hide sensitive fields from API responses
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.otp;
    delete obj.otpExpiry;
    delete obj.loginAttempts;
    delete obj.lockUntil;
    return obj;
};

module.exports = mongoose.model("User", userSchema);