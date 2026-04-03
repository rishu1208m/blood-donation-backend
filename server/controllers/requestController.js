const Request = require("../models/Request");
const User = require("../models/User");
const mongoose = require("mongoose");

exports.createRequest = async (req, res) => {
    try {
        const { donorId } = req.body;
        if (!donorId) return res.status(400).json({ message: "Donor ID is required" });
        if (!mongoose.Types.ObjectId.isValid(donorId)) return res.status(400).json({ message: "Invalid donor ID" });
        const existing = await Request.findOne({ donor: donorId, receiver: req.user.id, status: "pending" });
        if (existing) return res.status(400).json({ message: "You already have a pending request with this donor" });
        const request = await Request.create({ donor: donorId, receiver: req.user.id });
        const io = req.app.get("io");
        if (io) io.emit(`request:${donorId}`, { message: "New blood request received" });
        res.status(201).json({ message: "Request sent", request });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getRequests = async (req, res) => {
    try {
        const requests = await Request.find()
            .populate("donor", "name email bloodGroup")
            .populate("receiver", "name email");
        res.json(requests);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMyRequests = async (req, res) => {
    try {
        const requests = await Request.find({ receiver: req.user.id })
            .populate("donor", "name email bloodGroup")
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getIncomingRequests = async (req, res) => {
    try {
        const requests = await Request.find({ donor: req.user.id })
            .populate("receiver", "name email bloodGroup")
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getDonorRequests = async (req, res) => {
    try {
        const requests = await Request.find({ donor: req.user.id })
            .populate("receiver", "name email")
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.acceptRequest = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid ID" });
        const request = await Request.findById(req.params.id);
        if (!request) return res.status(404).json({ message: "Request not found" });
        if (request.status !== "pending") return res.status(400).json({ message: "Request already handled" });
        request.status = "accepted";
        request.acceptedBy = req.user.id;
        await request.save();
        res.json({ message: "Request accepted", request });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!["accepted", "rejected"].includes(status)) return res.status(400).json({ message: "Invalid status" });
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid ID" });
        const request = await Request.findById(req.params.id);
        if (!request) return res.status(404).json({ message: "Request not found" });
        if (request.donor.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized" });
        if (request.status !== "pending") return res.status(400).json({ message: "Request already handled" });
        request.status = status;
        await request.save();
        const io = req.app.get("io");
        if (io) io.emit(`status:${request.receiver}`, { status, requestId: request._id });
        res.json({ message: `Request ${status}`, request });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.rateDonor = async (req, res) => {
    try {
        const { rating } = req.body;
        if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: "Rating must be between 1 and 5" });
        const request = await Request.findById(req.params.id);
        if (!request || !request.acceptedBy) return res.status(400).json({ message: "Invalid request" });
        const donor = await User.findById(request.acceptedBy);
        if (!donor) return res.status(404).json({ message: "Donor not found" });
        donor.rating = donor.rating ? parseFloat(((donor.rating + rating) / 2).toFixed(1)) : rating;
        await donor.save();
        res.json({ message: "Rating submitted" });
    } catch (err) { res.status(500).json({ message: err.message }); }
};