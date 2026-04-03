const User = require("../models/User");
const Token = require("../models/Token");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const transporter = require("../config/mailer");

exports.signup = async (req, res) => {
    try {
        const { name, email, password, bloodGroup } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: "User already exists" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword, bloodGroup });
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.status(201).json({ token, user });
    } catch (err) {
        console.log("🔥 SIGNUP ERROR:", err);
        res.status(500).json({ message: err.message });
    }
};

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
        user.loginAttempts = 0;
        user.lockUntil = null;
        await user.save();
        const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const refreshToken = uuidv4();
        await Token.create({ userId: user._id, token: refreshToken, type: "refresh", expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
        res.json({ accessToken, refreshToken });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

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

exports.logout = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: "Token is required" });
        await Token.deleteOne({ token });
        res.json({ message: "Logged out successfully" });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

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
        await transporter.sendMail({ to: email, subject: "Your OTP Code", text: `Your OTP is ${otp}. It expires in 5 minutes.` });
        res.json({ message: "OTP sent successfully" });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
        if (String(user.otp) !== String(otp) || Date.now() > user.otpExpiry)
            return res.status(400).json({ message: "Invalid or expired OTP" });
        user.otp = null;
        user.otpExpiry = null;
        await user.save();
        res.json({ message: "OTP verified successfully" });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
        const token = uuidv4();
        await Token.create({ userId: user._id, token, type: "reset", expiresAt: new Date(Date.now() + 15 * 60 * 1000) });
        const resetURL = `${process.env.CLIENT_URL}/reset/${token}`;
        await transporter.sendMail({ to: email, subject: "Reset Your Password", html: `<p>You requested a password reset.</p><a href="${resetURL}">Click here to reset your password</a><p>This link expires in 15 minutes.</p>` });
        res.json({ message: "Reset link sent to your email" });
    } catch (err) { res.status(500).json({ message: err.message }); }
};