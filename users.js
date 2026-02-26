// routes/users.js

const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { registerUser, loginUser, getProfile,getUserById, updatePreferences } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validate");

// Register
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
    validateRequest
  ],
  registerUser
);

// Login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
    validateRequest
  ],
  loginUser
);

// Profile
router.get("/profile", protect, getProfile);



// Get user by ID
router.get("/:id",protect, getUserById);

// Update Preferences
router.put("/preferences", protect, updatePreferences);

module.exports = router;





