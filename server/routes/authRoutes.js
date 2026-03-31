const express = require("express");
const router = express.Router();

const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// ✅ ONLY import what exists
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

// 🔐 Login rate limit
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5
});

// ================= ROUTES =================

// ✅ REGISTER = SIGNUP (use same function)
router.post(
    "/register",
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isStrongPassword({
        minLength: 6,
        minNumbers: 1,
        minUppercase: 1
    }),
    signup
);

// ✅ LOGIN
router.post("/login", loginLimiter, login);

// ✅ TOKEN
router.post("/refresh", refreshToken);
router.post("/logout", logout);

// ✅ EMAIL VERIFY
router.get("/verify/:token", verifyEmail);

// ✅ OTP
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

// ✅ PASSWORD RESET
router.post("/forgot-password", forgotPassword);

// ✅ ADMIN ROUTE
router.get("/admin", auth, role("admin"), (req, res) => {
    res.json({ msg: "Admin only access" });
});

module.exports = router;