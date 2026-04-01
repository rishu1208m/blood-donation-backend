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

// ================= SECURITY =================

// 🔐 Login rate limit
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5
});

// ================= ROUTES =================

// ✅ REGISTER (signup)
router.post(
    "/signup",
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 8 }),
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
    res.json({ msg: "Admin access granted" });
});

module.exports = router;