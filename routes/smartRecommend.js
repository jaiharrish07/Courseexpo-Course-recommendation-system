const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getNextQuestion } = require("../controllers/aiAssistantController");
const { getSmartRecommendations } = require("../controllers/smartRecommendController");

// Next question for AI onboarding
router.post("/next-question", protect, getNextQuestion);

// Smart AI recommendations
router.post("/smart-recommend", protect, getSmartRecommendations);

module.exports = router;

