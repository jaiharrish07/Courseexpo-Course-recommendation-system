// routes/recommendRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getRecommendations } = require("../controllers/recommendController");

// Rule-based recommendations
router.get("/", protect, getRecommendations);

module.exports = router;



