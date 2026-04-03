const User = require("../models/User");

const isEligible = (lastDonated) => {
    if (!lastDonated) return true;
    const diff = (new Date() - new Date(lastDonated)) / (1000 * 60 * 60 * 24);
    return diff >= 90;
};

exports.getNearbyDonors = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) return res.status(400).json({ message: "lat and lng are required" });
        const donors = await User.find({
            role: "donor",
            isAvailable: true,
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: 5000,
                },
            },
        });
        res.json(donors);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.searchDonors = async (req, res) => {
    try {
        const { bloodGroup, lng, lat } = req.query;
        const donors = await User.find({
            role: "donor",
            bloodGroup,
            isAvailable: true,
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: 10000,
                },
            },
        });
        const filtered = donors.filter(d => isEligible(d.lastDonated));
        res.json(filtered);
    } catch (err) { res.status(500).json({ message: err.message }); }
};