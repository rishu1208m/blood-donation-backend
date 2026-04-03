const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
    createRequest,
    getRequests,
    acceptRequest,
    rateDonor,
    getDonorRequests,
    updateRequestStatus,
    getMyRequests,         // ✅ Added
    getIncomingRequests,   // ✅ Added
} = require("../controllers/requestController");

// ✅ Frontend calls these exact URLs:
// POST   /api/requests/create       → createRequest
// GET    /api/requests/my           → getMyRequests
// GET    /api/requests/incoming     → getIncomingRequests
// GET    /api/requests/donor        → getDonorRequests
// PUT    /api/requests/:id/status   → updateRequestStatus
// PUT    /api/requests/:id/accept   → acceptRequest
// POST   /api/requests/:id/rate     → rateDonor

router.post("/create", auth, createRequest);          // ✅ was "/"
router.get("/my", auth, getMyRequests);               // ✅ was missing
router.get("/incoming", auth, getIncomingRequests);   // ✅ was missing
router.get("/donor", auth, getDonorRequests);
router.get("/", auth, getRequests);
router.put("/:id/accept", auth, acceptRequest);
router.put("/:id/status", auth, updateRequestStatus);
router.post("/:id/rate", auth, rateDonor);

module.exports = router;