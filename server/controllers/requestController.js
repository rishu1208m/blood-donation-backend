const Request = require("../models/Request");
const User = require("../models/User");
const mongoose = require("mongoose");

// Create request
exports.createRequest = async (req, res) => {
    try {
        const { donorId } = req.body;

        const request = await Request.create({
            donor: donorId,
            receiver: req.user.id
        });

        res.json({ message: "Request sent", request });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all requests
exports.getRequests = async (req, res) => {
    try {
        const requests = await Request.find()
            .populate("requestedBy", "name")
            .populate("acceptedBy", "name");

        res.json(requests);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Accept request
exports.acceptRequest = async (req, res) => {
    try {
        const mongoose = require("mongoose");

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ msg: "Invalid ID" });
        }

        const request = await Request.findById(req.params.id);

        if (!request) return res.status(404).json({ msg: "Not found" });

        // 🔐 Prevent duplicate accept
        if (request.status !== "pending") {
            return res.status(400).json({ msg: "Already handled" });
        }

        request.status = "accepted";
        request.acceptedBy = req.user.id;

        await request.save();

        res.json(request);

    } catch (err) {
        res.status(500).json(err);
    }
};

// Rate donor
exports.rateDonor = async (req, res) => {
    try {
        const { rating } = req.body;

        const request = await Request.findById(req.params.id);
        if (!request || !request.acceptedBy) {
            return res.status(400).json({ msg: "Invalid request" });
        }

        const donor = await User.findById(request.acceptedBy);

        donor.rating = donor.rating
            ? (donor.rating + rating) / 2
            : rating;

        await donor.save();

        res.json({ msg: "Rating submitted" });
    } catch (err) {
        res.status(500).json(err);
    }
};
exports.updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const request = await Request.findById(req.params.id);

        if (!request) return res.status(404).json({ message: "Not found" });

        // Only donor can accept/reject
        if (request.donor.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not allowed" });
        }

        request.status = status;
        await request.save();

        res.json({ message: "Updated", request });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getDonorRequests = async (req, res) => {
    try {
        const requests = await Request.find({ donor: req.user.id })
            .populate("receiver", "name email");

        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};