const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getNearbyDonors } = require("../controllers/searchController");
const { getDonors, updateLocation } = require("../controllers/userController");


router.get("/donors", auth, getDonors);
router.get("/nearby", auth, getNearbyDonors);
router.put("/location", auth, updateLocation);

module.exports = router;