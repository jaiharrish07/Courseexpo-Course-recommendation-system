const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getHome } = require("../controllers/homeController");

router.get("/", protect, getHome);

module.exports = router;
