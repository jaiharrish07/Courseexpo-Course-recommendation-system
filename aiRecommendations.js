const express = require("express");
const router = express.Router();
const { generateAIRecommendations } = require("../services/aiService");
const { protect } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validate");
const { body } = require("express-validator");

// Validation
const aiValidator = [
  body("preferences").optional().isObject().withMessage("Preferences must be an object"),
  body("candidates").optional().isArray().withMessage("Candidates must be an array"),
  validateRequest
];

router.post("/", protect, aiValidator, async (req, res) => {
  try {
    const prefs = req.body.preferences || {};
    const candidates = req.body.candidates || [];

    if (!prefs && !candidates.length) {
      return res.status(400).json({
        success: false,
        message: "Provide preferences or candidate courses"
      });
    }

    const recommendations = await generateAIRecommendations(prefs, candidates);

    res.json({
      success: true,
      data: recommendations
    });
  } catch (err) {
    console.error("AI recommendation error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;

