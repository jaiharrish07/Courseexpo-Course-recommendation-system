// controllers/reviewController.js
const pool = require("../config/db");

exports.addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { course_id, rating, feedback_text, success_tag } = req.body;

    if (!course_id || rating === undefined || rating === null) {
      return res.status(400).json({ success: false, message: "course_id and rating are required" });
    }

    const r = Number(rating);
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      return res.status(400).json({ success: false, message: "rating must be a number between 1 and 5" });
    }

    // Ensure user is enrolled
    const enrollRes = await pool.query("SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2", [userId, course_id]);
    if (enrollRes.rows.length === 0) {
      return res.status(403).json({ success: false, message: "You must be enrolled to review" });
    }

    // Insert review
    const insertRes = await pool.query(
      `INSERT INTO reviews (user_id, course_id, rating, feedback_text, success_tag)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [userId, course_id, r, feedback_text || null, success_tag || null]
    );
    const newReview = insertRes.rows[0];

    // Recompute aggregates
    const aggRes = await pool.query(
      "SELECT AVG(rating)::numeric(3,2) AS avg_rating, COUNT(*)::int AS count FROM reviews WHERE course_id = $1",
      [course_id]
    );
    const avgRating = aggRes.rows[0].avg_rating || 0;
    const count = aggRes.rows[0].count || 0;

    // If courses table has rating_count column update it
    const colRes = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name='courses' AND column_name='rating_count'"
    );
    if (colRes.rows.length > 0) {
      await pool.query("UPDATE courses SET rating = $1, rating_count = $2 WHERE id = $3", [avgRating, count, course_id]);
    } else {
      await pool.query("UPDATE courses SET rating = $1 WHERE id = $2", [avgRating, course_id]);
    }

    const courseRes = await pool.query("SELECT * FROM courses WHERE id = $1", [course_id]);

    res.status(201).json({
      success: true,
      message: "Review added",
      review: newReview,
      course: courseRes.rows[0],
      updated_rating: avgRating,
      rating_count: count
    });
  } catch (err) {
    console.error("Add review error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getCourseReviews = async (req, res) => {
  try {
    const courseId = Number(req.params.courseId);
    if (!courseId) return res.status(400).json({ success: false, message: "Invalid course id" });

    const { rows } = await pool.query(
      `SELECT r.id, r.rating, r.feedback_text, r.success_tag, r.created_at, u.id as user_id, u.name as user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.course_id = $1
       ORDER BY r.created_at DESC`,
      [courseId]
    );

    res.json({ success: true, course_id: courseId, reviews: rows });
  } catch (err) {
    console.error("Get course reviews error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, u.name AS user_name, c.title AS course_title
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       JOIN courses c ON r.course_id = c.id
       ORDER BY r.created_at DESC`
    );
    res.json({ success: true, reviews: rows });
  } catch (err) {
    console.error("Get all reviews error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
