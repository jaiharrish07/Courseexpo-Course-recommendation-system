const pool = require("../config/db");

exports.createCourse = async (req, res) => {
  try {
    const {
      platform_id, title, instructor_name, duration_hours,
      difficulty_level, price, discount_price, certification,
      category, description, url
    } = req.body;

    if (!title || !platform_id) return res.status(400).json({ success: false, message: "Missing title or platform_id" });

    const { rows } = await pool.query(
      `INSERT INTO courses (platform_id, title, instructor_name, duration_hours, difficulty_level,
        price, discount_price, certification, category, description, url)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [platform_id, title, instructor_name || null, duration_hours || null, difficulty_level || null,
        price == null ? 0 : price, discount_price || null, certification || false, category || null, description || null, url || null]
    );

    res.status(201).json({ success: true, course: rows[0] });
  } catch (err) {
    console.error("Create course:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getCourses = async (req, res) => {
  try {
    // simple filters: q, category, maxPrice (frontend can use)
    const { q, category, maxPrice, limit = 100 } = req.query;
    const clauses = [];
    const params = [];
    let i = 1;

    if (q) { clauses.push(`(title ILIKE $${i} OR description ILIKE $${i})`); params.push(`%${q}%`); i++; }
    if (category) { clauses.push(`category = $${i}`); params.push(category); i++; }
      if (maxPrice) { clauses.push(`price <= $${i}`); params.push(Number(maxPrice)); i++; }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const sql = `SELECT * FROM courses ${where} ORDER BY created_at DESC LIMIT $${i}`;
    params.push(Number(limit));

    const { rows } = await pool.query(sql, params);
    res.json({ success: true, courses: rows });
  } catch (err) {
    console.error("Get courses:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { rows } = await pool.query("SELECT * FROM courses WHERE id=$1", [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Course not found" });
    res.json({ success: true, course: rows[0] });
  } catch (err) {
    console.error("Get course:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --- UPDATED SEARCH FUNCTION FOR BETTER RESULTS ---
// This version searches titles, descriptions, AND categories to ensure the dropdown is populated
exports.searchCoursesByName = async (req, res) => {
  const { q } = req.query;

  // Return empty if search query is missing or too short
  if (!q || q.length < 2) {
    return res.json({ success: true, courses: [] });
  }

  try {
    const searchTerm = `%${q}%`;
    
    // Broadened the WHERE clause to include description and category
    // Added ordering by rating to show higher quality courses first
    const { rows } = await pool.query(
      `
       SELECT c.id, c.title, COALESCE(p.name, 'N/A') AS platform 
       FROM courses c
       LEFT JOIN platforms p ON c.platform_id = p.id
       WHERE (c.title ILIKE $1 OR c.description ILIKE $1 OR c.category ILIKE $1)
       ORDER BY c.rating DESC NULLS LAST, c.rating_count DESC NULLS LAST
       LIMIT 15
      `,
      [searchTerm]
    );
    
    res.json({ success: true, courses: rows });

  } catch (err) {
    console.error("Search courses by name error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};