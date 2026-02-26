const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getProgressSummary } = require("../controllers/progressController");

router.get("/summary", protect, getProgressSummary);

module.exports = router;
