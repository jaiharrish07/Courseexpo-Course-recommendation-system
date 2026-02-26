// controllers/userController.js
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: "Missing fields" });

    const exists = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
    if (exists.rows.length) return res.status(400).json({ success: false, message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const result = await pool.query(
      "INSERT INTO users (name,email,password_hash,preferences) VALUES ($1,$2,$3,$4) RETURNING id,name,email,preferences",
      [name, email, hashed, {}]
    );
    const user = result.rows[0];

    res.status(201).json({ success: true, message: "Registered", user, token: generateToken(user.id) });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Missing fields" });

    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (!result.rows.length) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ success: false, message: "Invalid credentials" });

    res.json({
      success: true,
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email, preferences: user.preferences || {} },
      token: generateToken(user.id)
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id,name,email,preferences,created_at FROM users WHERE id=$1", [req.user.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error("Get profile error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const { rows } = await pool.query(
      "SELECT id, name, email, preferences, created_at FROM users WHERE id=$1",
      [userId]
    );

    if (!rows.length) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error("Get user by ID error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.updatePreferences = async (req, res) => {
  try {
    const prefs = req.body.preferences || {};
    await pool.query("UPDATE users SET preferences=$1 WHERE id=$2", [prefs, req.user.id]);
    const { rows } = await pool.query("SELECT preferences FROM users WHERE id=$1", [req.user.id]);
    res.json({ success: true, message: "Preferences saved", preferences: rows[0].preferences });
  } catch (err) {
    console.error("Prefs error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

