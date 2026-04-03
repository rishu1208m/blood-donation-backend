const User = require("../models/User");

exports.getDonors = async (req, res) => {
    try {
        const donors = await User.find({
            role: "donor",
            isAvailable: true,
            _id: { $ne: req.user.id },
        }).select("name email bloodGroup isAvailable rating location");
        res.json(donors);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateLocation = async (req, res) => {
    try {
        const { lat, lng } = req.body;
        if (!lat || !lng) return res.status(400).json({ message: "lat and lng are required" });
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { location: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] } },
            { new: true }
        );
        res.json({ message: "Location updated", user });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateAvailability = async (req, res) => {
    try {
        const { isAvailable } = req.body;
        if (typeof isAvailable !== "boolean") return res.status(400).json({ message: "isAvailable must be true or false" });
        const user = await User.findByIdAndUpdate(req.user.id, { isAvailable }, { new: true });
        res.json({ message: "Availability updated", user });
    } catch (err) { res.status(500).json({ message: err.message }); }
};