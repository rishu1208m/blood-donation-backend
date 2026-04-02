const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");

// controllers
const {
    signup,
    login,
    refreshToken,
    logout,
    verifyEmail,
    sendOTP,
    verifyOTP,
    forgotPassword
} = require("../controllers/authController");

// middleware
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate"); // ✅ NEW

// ================= SECURITY =================
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: "Too many login attempts. Try again after 15 minutes." }
});

// ================= ROUTES =================

// ✅ REGISTER
router.post(
    "/register",
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    body("bloodGroup")
        .notEmpty().withMessage("Blood group is required")
        .isIn(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
        .withMessage("Invalid blood group"),
    validate, // ✅ NOW ACTUALLY CHECKS VALIDATION RESULT
    signup
);

// ✅ LOGIN
router.post("/login", loginLimiter, login);

// ✅ REFRESH TOKEN
router.post("/refresh", refreshToken);

// ✅ LOGOUT
router.post("/logout", logout);

// ✅ EMAIL VERIFY
router.get("/verify/:token", verifyEmail);

// ✅ OTP
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

// ✅ FORGOT PASSWORD
router.post("/forgot-password", forgotPassword);

// ✅ ADMIN TEST ROUTE
router.get("/admin", auth, role("admin"), (req, res) => {
    res.json({ message: "Admin access granted" });
});

module.exports = router;