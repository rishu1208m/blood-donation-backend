const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
    getDonorRequests,
    updateRequestStatus
} = require("../controllers/requestController");
const {
    createRequest,
    getRequests,
    acceptRequest,
    rateDonor
} = require("../controllers/requestController");

router.post("/", auth, createRequest);
router.get("/", getRequests);
router.put("/:id/accept", auth, acceptRequest);
router.post("/:id/rate", auth, rateDonor);
router.get("/donor", auth, getDonorRequests);
router.put("/:id/status", auth, updateRequestStatus);

module.exports = router;