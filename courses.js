const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const courseController = require("../controllers/courseController");
const { protect } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validate");

// --- NEW ROUTE FOR SEARCHING ---
// This route must come *before* the "/:id" route
// GET /api/courses/search?q=...
router.get("/search", courseController.searchCoursesByName);
// --- END OF NEW ROUTE ---

// Public: list/search
router.get("/", courseController.getCourses);
router.get("/:id", courseController.getCourseById);

// Protected: create course (admin)
router.post(
  "/",
  protect,
  [
  	body("platform_id").notEmpty().withMessage("platform_id required"),
  	body("title").notEmpty().withMessage("Title required"),
  	validateRequest
  ],
  courseController.createCourse
);

module.exports = router;