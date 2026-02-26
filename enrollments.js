const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const { enroll, updateProgress, getUserEnrollments, getEnrollmentById } = require("../controllers/enrollmentController");
const { protect } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validate");

// --- SPECIFIC ROUTE FIRST ---
// Get user's own enrollments
router.get("/me", protect, getUserEnrollments);

// Enroll in a course
router.post(
  "/",
  protect,
  [
    body("course_id").notEmpty().withMessage("course_id required"),
    validateRequest
  ],
  enroll
);

// Get a specific enrollment by ID
router.get(
  "/:id",
  protect,
  [
    param("id").isInt().withMessage("Enrollment id must be integer"),
    validateRequest
  ],
  getEnrollmentById
);

// Update progress for a specific enrollment
router.put(
  "/:id",
  protect,
  [
    param("id").isInt().withMessage("Enrollment id must be integer"),
    // Add validation for progress fields if needed
    validateRequest
  ],
  updateProgress
);

module.exports = router;
