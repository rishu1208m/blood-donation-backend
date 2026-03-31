const router = require("express").Router();
const { searchDonors } = require("../controllers/searchController");

router.get("/", searchDonors);

module.exports = router;