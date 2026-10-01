const pool = require("../config/db");

/**
 * GET /api/trending
 * Query params: ?limit=10&period_days=14
 */
exports.getTrending = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 10);
    const period_days = Number(req.query.period_days || 14);

    // We calculate trending score using:
    // recent enrollments (weight 0.6), avg rating (0.3), rating_count (0.1)
    // enrollments in the last period
    const { rows } = await pool.query(
      `SELECT c.id, c.title, c.category, c.url, c.price, c.certification, COALESCE(c.rating,0)::numeric(3,2) as rating,
              COALESCE(c.rating_count,0) as rating_count,
              SUM(CASE WHEN e.enrollment_date >= NOW() - ($2 || ' days')::interval THEN 1 ELSE 0 END) AS recent_enrollments,
              COUNT(e.id) as total_enrollments
       FROM courses c
       LEFT JOIN enrollments e ON c.id = e.course_id
       GROUP BY c.id
       ORDER BY (SUM(CASE WHEN e.enrollment_date >= NOW() - ($2 || ' days')::interval THEN 1 ELSE 0 END) * 0.6
                + COALESCE(c.rating,0) * 0.3
                + LEAST(COALESCE(c.rating_count,0), 50) * 0.1) DESC
       LIMIT $1`,
      [limit, period_days]
    );

    res.json({ success: true, trending: rows });
  } catch (err) {
    console.error("Trending error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
