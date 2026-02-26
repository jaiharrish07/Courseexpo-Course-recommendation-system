const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { generateCareerPath } = require("../controllers/aiCareerPathController");

// --- THIS IS THE FIX ---
// The route path should be "/" because "/api/career-path" is already defined in server.js
router.post("/", protect, generateCareerPath);
// --- END OF FIX ---

module.exports = router;