const pool = require("../config/db");

/**
 * GET /api/progress/summary
 * Returns an overview of enrollments, avg completion, total hours etc.
 */
exports.getProgressSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // fetch enrollments + course meta
    const { rows } = await pool.query(
      `SELECT e.id as enrollment_id, e.course_id, e.enrollment_date, e.completion_status, e.completion_pct, e.time_spent_hours,
              c.title, c.platform_id, c.url, c.duration_hours, c.category
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.user_id = $1
       ORDER BY e.enrollment_date DESC`,
      [userId]
    );

    // summary stats
    const totalEnrolled = rows.length;
    const avgCompletion = rows.length ? (rows.reduce((s, r) => s + Number(r.completion_pct || 0), 0) / rows.length) : 0;
    const totalHours = rows.reduce((s, r) => s + Number(r.time_spent_hours || 0), 0);
    const inProgress = rows.filter(r => r.completion_status === 'In-progress').length;
    const completed = rows.filter(r => r.completion_status === 'Completed').length;

    res.json({
      success: true,
      summary: {
        totalEnrolled,
        avgCompletion: Number(avgCompletion.toFixed(2)),
        totalHours: Number(totalHours.toFixed(2)),
        inProgress,
        completed
      },
      enrollments: rows
    });
  } catch (err) {
    console.error("Progress summary error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
