const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { createRequest, getRequests, acceptRequest, rateDonor, getDonorRequests, updateRequestStatus, getMyRequests, getIncomingRequests } = require("../controllers/requestController");

router.post("/create", auth, createRequest);
router.get("/my", auth, getMyRequests);
router.get("/incoming", auth, getIncomingRequests);
router.get("/donor", auth, getDonorRequests);
router.get("/", auth, getRequests);
router.put("/:id/accept", auth, acceptRequest);
router.put("/:id/status", auth, updateRequestStatus);
router.post("/:id/rate", auth, rateDonor);

module.exports = router;