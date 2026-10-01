const express = require("express");
const router = express.Router();
const { testGemini } = require("../controllers/aiTestController");

router.post("/test", testGemini);

module.exports = router;
