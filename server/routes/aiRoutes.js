const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const {
    chat,
    classifyUrgency,
    smartMatch,
    eligibilityCheck,
    status,
} = require("../controllers/aiController");

// AI calls cost tokens — rate limit per user / IP.
// 30 AI requests / 5 minutes is generous for normal use.
const aiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 30,
    message: { message: "Too many AI requests. Please slow down." },
});

router.get("/status", status);                              // public — UI capability check
router.post("/chat",              auth, aiLimiter, chat);
router.post("/classify-urgency",  auth, aiLimiter, classifyUrgency);
router.post("/smart-match",       auth, aiLimiter, smartMatch);
router.post("/eligibility-check", auth, aiLimiter, eligibilityCheck);

module.exports = router;
