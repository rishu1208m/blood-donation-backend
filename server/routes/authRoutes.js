const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const {
    signup, login, refreshToken, logout,
    verifyEmail, sendOTP, verifyOTP, resendOTP, forgotPassword
} = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: { message: "Too many attempts. Try after 15 minutes." } });
const otpLimiter = rateLimit({ windowMs: 5 * 60 * 1000, max: 3, message: { message: "Too many OTP requests. Wait 5 minutes." } });

router.post("/register",
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be 8+ characters"),
    body("bloodGroup").notEmpty().withMessage("Blood group is required")
        .isIn(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).withMessage("Invalid blood group"),
    validate, signup
);

router.post("/login", loginLimiter, login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/verify/:token", verifyEmail);
router.post("/send-otp", otpLimiter, sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", otpLimiter, resendOTP);   // ✅ new
router.post("/forgot-password", forgotPassword);
router.get("/admin", auth, role("admin"), (req, res) => res.json({ message: "Admin access granted" }));

module.exports = router;