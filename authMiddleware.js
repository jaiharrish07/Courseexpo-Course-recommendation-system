const jwt = require("jsonwebtoken");
const pool = require("../config/db");
require("dotenv").config();

async function protect(req, res, next) {
  let token;
  const auth = req.headers.authorization;

  if (auth && auth.startsWith("Bearer ")) {
    token = auth.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userRes = await pool.query("SELECT id, name, email FROM users WHERE id=$1", [decoded.id]);

    if (!userRes.rows.length) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = userRes.rows[0]; // Attach full user info
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ success: false, message: "Not authorized, token failed" });
  }
}

module.exports = { protect };

