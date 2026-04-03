const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getNearbyDonors } = require("../controllers/searchController");
const { getDonors, updateLocation, getProfile, updateAvailability } = require("../controllers/userController");

router.get("/donors", auth, getDonors);
router.get("/nearby", auth, getNearbyDonors);
router.get("/profile", auth, getProfile);
router.put("/location", auth, updateLocation);
router.put("/availability", auth, updateAvailability);

module.exports = router;