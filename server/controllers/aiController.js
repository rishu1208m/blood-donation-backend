
const ai = require("../services/aiService");
const User = require("../models/User");

const COMPATIBLE_DONORS = {
    "A+":  ["A+", "A-", "O+", "O-"],
    "A-":  ["A-", "O-"],
    "B+":  ["B+", "B-", "O+", "O-"],
    "B-":  ["B-", "O-"],
    "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    "AB-": ["A-", "B-", "AB-", "O-"],
    "O+":  ["O+", "O-"],
    "O-":  ["O-"],
};


function distanceKm(a, b) {
    if (!a || !b || a.length !== 2 || b.length !== 2) return null;
    const [lng1, lat1] = a;
    const [lng2, lat2] = b;
    const toRad = d => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const x = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return Math.round(2 * R * Math.asin(Math.sqrt(x)) * 10) / 10;
}


exports.chat = async (req, res) => {
    try {
        const { messages } = req.body;
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ message: "messages array is required" });
        }
        // Cap conversation length to keep tokens reasonable.
        const trimmed = messages.slice(-12);
        const reply = await ai.chat(trimmed);
        res.json({ reply });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

// ---------- 2. POST /api/ai/classify-urgency --------------------------------
exports.classifyUrgency = async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) return res.status(400).json({ message: "description is required" });
        const result = await ai.classifyUrgency(description);
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

// ---------- 3. POST /api/ai/smart-match -------------------------------------
exports.smartMatch = async (req, res) => {
    try {
        const { bloodGroup, urgency = "medium", lng, lat } = req.body;
        if (!bloodGroup) return res.status(400).json({ message: "bloodGroup is required" });

        const compatible = COMPATIBLE_DONORS[bloodGroup];
        if (!compatible) return res.status(400).json({ message: "Invalid blood group" });

        // Find candidate donors. Limit to 25 to keep AI prompt small.
        const candidates = await User
            .find({
                role: "donor",
                bloodGroup: { $in: compatible },
                isVerified: true,
            })
            .limit(25)
            .lean();

        if (candidates.length === 0) {
            return res.json({ ranked: [], donors: [], message: "No compatible donors found" });
        }

        // Compute distance if request includes coords.
        const requestLoc = (lng != null && lat != null) ? [Number(lng), Number(lat)] : null;
        const enriched = candidates.map(d => ({
            ...d,
            distanceKm: requestLoc && d.location?.coordinates
                ? distanceKm(requestLoc, d.location.coordinates)
                : null,
        }));

        const ranked = await ai.rankDonors({
            request: { bloodGroup, urgency, location: requestLoc },
            donors: enriched,
        });

        // Merge AI scores back onto donor objects so the frontend gets everything.
        const byId = new Map(enriched.map(d => [String(d._id), d]));
        const merged = ranked
            .map(r => {
                const d = byId.get(String(r.donorId));
                if (!d) return null;
                return {
                    _id: d._id,
                    name: d.name,
                    email: d.email,
                    bloodGroup: d.bloodGroup,
                    isAvailable: d.isAvailable,
                    lastDonated: d.lastDonated,
                    rating: d.rating,
                    distanceKm: d.distanceKm,
                    aiScore: r.score,
                    aiReason: r.reason,
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.aiScore - a.aiScore);

        res.json({ donors: merged });
    } catch (err) {
        console.error("smartMatch error:", err);
        res.status(err.status || 500).json({ message: err.message });
    }
};

// ---------- 4. POST /api/ai/eligibility-check -------------------------------
exports.eligibilityCheck = async (req, res) => {
    try {
        const { answers } = req.body;
        if (!answers || typeof answers !== "object") {
            return res.status(400).json({ message: "answers object is required" });
        }
        const result = await ai.screenEligibility(answers);
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};

// Quick health check — useful for the frontend to know whether to show AI features.
exports.status = (req, res) => {
    res.json({ aiEnabled: ai.isConfigured() });
};
