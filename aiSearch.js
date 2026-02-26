// routes/aiSearch.js
const express = require("express");
const router = express.Router();
const { searchCoursesAI } = require("../controllers/aiSearchController");

// POST search courses with AI
router.post("/", searchCoursesAI);

module.exports = router;


