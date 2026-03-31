const User = require("../models/User");
const Token = require("../models/Token");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const transporter = require("../config/mailer");

// ================= SIGNUP =================
exports.signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ msg: "User exists" });

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashed,
            role
        });

        const verifyToken = uuidv4();

        await Token.create({
            userId: user._id,
            token: verifyToken,
            type: "verify"
        });

        res.json({ msg: "Signup successful. Verify email." });

    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// ================= VERIFY EMAIL =================
exports.verifyEmail = async (req, res) => {
    try {
        const token = await Token.findOne({
            token: req.params.token,
            type: "verify"
        });

        if (!token) return res.status(400).send("Invalid link");

        const user = await User.findById(token.userId);
        if (!user) return res.status(404).send("User not found");

        user.isVerified = true;
        await user.save();

        await Token.deleteOne({ _id: token._id });

        res.send("Email verified");

    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "User not found" });

        if (user.lockUntil && user.lockUntil > Date.now()) {
            return res.status(403).json({ msg: "Account locked. Try later." });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            user.loginAttempts += 1;

            if (user.loginAttempts >= 5) {
                user.lockUntil = Date.now() + 15 * 60 * 1000;
            }

            await user.save();
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        user.loginAttempts = 0;
        user.lockUntil = null;
        await user.save();

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

        res.json({ accessToken, refreshToken });

    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// ================= REFRESH TOKEN =================
exports.refreshToken = async (req, res) => {
    try {
        const { token } = req.body;

        const stored = await Token.findOne({ token, type: "refresh" });
        if (!stored) return res.status(401).json({ msg: "Invalid token" });

        if (stored.expiresAt < new Date()) {
            await Token.deleteOne({ _id: stored._id });
            return res.status(401).json({ msg: "Token expired" });
        }

        await Token.deleteOne({ _id: stored._id });

        const user = await User.findById(stored.userId);

        const newAccessToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        const newRefreshToken = uuidv4();

        await Token.create({
            userId: user._id,
            token: newRefreshToken,
            type: "refresh",
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });

    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// ================= LOGOUT =================
exports.logout = async (req, res) => {
    try {
        const { token } = req.body;

        await Token.deleteOne({ token });

        res.json({ msg: "Logged out" });

    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// ================= SEND OTP =================
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000);

        user.otp = otp;
        user.otpExpiry = Date.now() + 5 * 60 * 1000;

        await user.save();

        await transporter.sendMail({
            to: email,
            subject: "OTP",
            text: `Your OTP is ${otp}`
        });

        res.json({ msg: "OTP sent" });

    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// ================= VERIFY OTP =================
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "User not found" });

        if (user.otp != otp || Date.now() > user.otpExpiry) {
            return res.status(400).json({ msg: "Invalid OTP" });
        }

        user.otp = null;
        await user.save();

        res.json({ msg: "OTP verified" });

    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "User not found" });

        const token = uuidv4();

        await Token.create({
            userId: user._id,
            token,
            type: "reset",
            expiresAt: new Date(Date.now() + 15 * 60 * 1000)
        });

        await transporter.sendMail({
            to: email,
            subject: "Reset Password",
            html: `<a href="http://localhost:3000/reset/${token}">Reset Password</a>`
        });

        res.json({ msg: "Reset link sent" });

    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};