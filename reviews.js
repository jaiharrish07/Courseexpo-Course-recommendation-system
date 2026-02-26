// routes/reviews.js
const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const { addReview, getCourseReviews, getAllReviews } = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validate");

// Add review (auth + enrolled)
router.post(
  "/",
  protect,
  [
    body("course_id").notEmpty().withMessage("course_id required"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("rating 1-5"),
    validateRequest
  ],
  addReview
);

// Get course reviews (public)
router.get(
  "/course/:courseId",
  [
    param("courseId").isInt().withMessage("courseId must be integer"),
    validateRequest
  ],
  getCourseReviews
);

// Get all reviews (admin)
router.get("/", protect, getAllReviews);

module.exports = router;



