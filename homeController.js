const pool = require("../config/db");
const { getTrendingScore } = require("../utils/scoring.js"); // optional helper

exports.getHome = async (req, res) => {
  try {
    const limit = 10;

    // Featured courses (top-rated)
    const { rows: featured } = await pool.query(`
      SELECT id, title, category, url, price, certification, COALESCE(rating,0)::numeric(3,2) as rating
      FROM courses
      ORDER BY rating DESC
      LIMIT $1
    `, [limit]);

    // Trending courses (reuse trending logic)
    const { rows: trending } = await pool.query(`
      SELECT c.id, c.title, c.category, c.url, c.price, c.certification, COALESCE(c.rating,0)::numeric(3,2) as rating,
             SUM(CASE WHEN e.enrollment_date >= NOW() - '14 days'::interval THEN 1 ELSE 0 END) AS recent_enrollments
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      GROUP BY c.id
      ORDER BY (SUM(CASE WHEN e.enrollment_date >= NOW() - '14 days'::interval THEN 1 ELSE 0 END) * 0.6
                + COALESCE(c.rating,0) * 0.3
                + LEAST(COALESCE(c.rating_count,0), 50) * 0.1) DESC
      LIMIT $1
    `, [limit]);

    res.json({
      success: true,
      featured,
      trending
    });
  } catch (err) {
    console.error("Home error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
