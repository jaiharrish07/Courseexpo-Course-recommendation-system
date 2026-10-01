const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { compareCourses } = require("../controllers/compareController");

router.post("/", protect, compareCourses);

module.exports = router;
