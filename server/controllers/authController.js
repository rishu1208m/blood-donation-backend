const User = require("../models/User");
const Token = require("../models/Token");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const transporter = require("../config/mailer");

// ================= SIGNUP WITH OTP =================
exports.signup = async (req, res) => {
    try {
        const { name, email, password, bloodGroup } = req.body;

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP before creating user
        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

        const user = await User.create({
            name, email,
            password: hashedPassword,
            bloodGroup,
            otp,
            otpExpiry,
            isVerified: false,
        });

        // Send OTP email
        try {
            await transporter.sendMail({
                to: email,
                subject: "🩸 BloodConnect — Verify Your Email",
                html: `
                    <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff;border-radius:12px;border:1px solid #eee;">
                        <h2 style="color:#e74c3c;margin-bottom:8px;">Welcome to BloodConnect 🩸</h2>
                        <p style="color:#555;">Hi <strong>${name}</strong>, thanks for registering!</p>
                        <p style="color:#555;">Your email verification OTP is:</p>
                        <div style="font-size:2.5rem;font-weight:800;color:#e74c3c;letter-spacing:8px;text-align:center;margin:24px 0;padding:16px;background:#fff5f5;border-radius:8px;">
                            ${otp}
                        </div>
                        <p style="color:#999;font-size:0.85rem;">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
                    </div>
                `
            });
        } catch (mailErr) {
            console.error("❌ Email send failed:", mailErr.message);
            // Don't block registration if email fails
        }

        res.status(201).json({
            message: "Registration successful. Please verify your email with the OTP sent.",
            userId: user._id,
            emailSent: true,
        });
    } catch (err) {
        console.log("🔥 SIGNUP ERROR:", err);
        res.status(500).json({ message: err.message });
    }
};

// ================= VERIFY OTP (for email verification) =================
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (String(user.otp) !== String(otp) || Date.now() > user.otpExpiry) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        // Issue JWT after verification
        const accessToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );
        const refreshToken = uuidv4();
        await Token.create({
            userId: user._id,
            token: refreshToken,
            type: "refresh",
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        res.json({ message: "Email verified!", accessToken, refreshToken });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ================= RESEND OTP =================
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.isVerified) return res.status(400).json({ message: "Email already verified" });

        const otp = Math.floor(100000 + Math.random() * 900000);
        user.otp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000;
        await user.save();

        await transporter.sendMail({
            to: email,
            subject: "🩸 BloodConnect — New OTP",
            html: `<div style="font-family:sans-serif;padding:32px;"><h2 style="color:#e74c3c;">New OTP</h2><p>Your new OTP is:</p><div style="font-size:2.5rem;font-weight:800;color:#e74c3c;letter-spacing:8px;text-align:center;padding:16px;background:#fff5f5;border-radius:8px;">${otp}</div><p style="color:#999;">Expires in 10 minutes.</p></div>`
        });

        res.json({ message: "New OTP sent" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        if (user.lockUntil && user.lockUntil > Date.now())
            return res.status(403).json({ message: "Account locked. Try again later." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            user.loginAttempts += 1;
            if (user.loginAttempts >= 5) user.lockUntil = Date.now() + 15 * 60 * 1000;
            await user.save();
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Warn if not verified (but still allow login)
        if (!user.isVerified) {
            return res.status(403).json({ message: "Please verify your email before logging in.", needsVerification: true, email });
        }

        user.loginAttempts = 0;
        user.lockUntil = null;
        await user.save();

        const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const refreshToken = uuidv4();
        await Token.create({ userId: user._id, token: refreshToken, type: "refresh", expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });

        res.json({ accessToken, refreshToken });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ================= REFRESH TOKEN =================
exports.refreshToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: "Token is required" });
        const stored = await Token.findOne({ token, type: "refresh" });
        if (!stored) return res.status(401).json({ message: "Invalid token" });
        if (stored.expiresAt < new Date()) {
            await Token.deleteOne({ _id: stored._id });
            return res.status(401).json({ message: "Token expired. Please login again." });
        }
        await Token.deleteOne({ _id: stored._id });
        const user = await User.findById(stored.userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        const newAccessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const newRefreshToken = uuidv4();
        await Token.create({ userId: user._id, token: newRefreshToken, type: "refresh", expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ================= LOGOUT =================
exports.logout = async (req, res) => {
    try {
        const { token } = req.body;
        await Token.deleteOne({ token });
        res.json({ message: "Logged out successfully" });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ================= SEND OTP =================
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
        const otp = Math.floor(100000 + Math.random() * 900000);
        user.otp = otp;
        user.otpExpiry = Date.now() + 5 * 60 * 1000;
        await user.save();
        await transporter.sendMail({ to: email, subject: "Your OTP", text: `Your OTP is ${otp}. Expires in 5 minutes.` });
        res.json({ message: "OTP sent" });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
        const token = uuidv4();
        await Token.create({ userId: user._id, token, type: "reset", expiresAt: new Date(Date.now() + 15 * 60 * 1000) });
        const resetURL = `${process.env.CLIENT_URL}/reset/${token}`;
        await transporter.sendMail({ to: email, subject: "Reset Password", html: `<a href="${resetURL}">Reset your password</a> — expires in 15 minutes.` });
        res.json({ message: "Reset link sent" });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

// ================= VERIFY EMAIL TOKEN =================
exports.verifyEmail = async (req, res) => {
    try {
        const token = await Token.findOne({ token: req.params.token, type: "verify" });
        if (!token) return res.status(400).json({ message: "Invalid or expired link" });
        const user = await User.findById(token.userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        user.isVerified = true;
        await user.save();
        await Token.deleteOne({ _id: token._id });
        res.json({ message: "Email verified successfully" });
    } catch (err) { res.status(500).json({ message: err.message }); }
};