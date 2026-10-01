const pool = require("../config/db");

// Enroll user in a course
exports.enroll = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error("Enroll error: User not found on request object after protect middleware.");
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    const userId = req.user.id;
    const { course_id } = req.body;
    if (!course_id) return res.status(400).json({ success: false, message: "course_id required" });

    const exists = await pool.query(
      "SELECT id FROM enrollments WHERE user_id=$1 AND course_id=$2",
      [userId, course_id]
    );
    if (exists.rows.length)
      return res.status(400).json({ success: false, message: "Already enrolled" });

    const { rows } = await pool.query(
      "INSERT INTO enrollments (user_id, course_id) VALUES ($1,$2) RETURNING *",
      [userId, course_id]
    );
    res.status(201).json({ success: true, enrollment: rows[0] });
  } catch (err) {
    console.error("Enroll error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update progress
exports.updateProgress = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error("Update progress error: User not found on request object after protect middleware.");
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    const userId = req.user.id;
    const enrollmentId = Number(req.params.id);
    const { completion_pct, time_spent_hours, completion_status } = req.body;

    const eRes = await pool.query(
      "SELECT * FROM enrollments WHERE id=$1 AND user_id=$2",
      [enrollmentId, userId]
    );
    if (!eRes.rows.length)
      return res.status(404).json({ success: false, message: "Enrollment not found" });

    const q = `
      UPDATE enrollments
      SET completion_pct = $1,
          time_spent_hours = $2,
          completion_status = $3::varchar,
          completion_date = CASE WHEN $3 = 'Completed' THEN CURRENT_TIMESTAMP ELSE completion_date END
      WHERE id=$4
      RETURNING *`;

    const vals = [
      completion_pct !== undefined ? Number(completion_pct) : eRes.rows[0].completion_pct,
      time_spent_hours !== undefined ? Number(time_spent_hours) : eRes.rows[0].time_spent_hours,
      completion_status !== undefined ? String(completion_status) : eRes.rows[0].completion_status || "In-progress",
      enrollmentId
    ];

    const { rows } = await pool.query(q, vals);
    res.json({ success: true, enrollment: rows[0] });
  } catch (err) {
    console.error("Update progress error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get enrollment by ID
exports.getEnrollmentById = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error("Get enrollment by ID error: User not found on request object after protect middleware.");
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    const enrollmentId = Number(req.params.id);
    const userId = req.user.id;

    const { rows } = await pool.query(
      `SELECT e.*, c.title, c.platform_id, c.instructor_name, c.duration_hours, c.category, c.url
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.id = $1 AND e.user_id = $2`,
      [enrollmentId, userId]
    );

    if (!rows.length) return res.status(404).json({ success: false, message: "Enrollment not found" });

    res.json({ success: true, enrollment: rows[0] });
  } catch (err) {
    console.error("Get enrollment by ID error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get user's enrollments
exports.getUserEnrollments = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error("Get enrollments error: User not found on request object after protect middleware.");
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    const userId = req.user.id;
    console.log("Fetching enrollments for user ID:", userId);

    const { rows } = await pool.query(
      `SELECT e.*, c.title, c.platform_id, c.instructor_name, c.duration_hours, c.category, c.url
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.user_id = $1
       ORDER BY e.enrollment_date DESC`,
      [userId]
    );

    console.log(`Found ${rows.length} enrollments for user ID: ${userId}`);
    res.json({ success: true, enrollments: rows });
  } catch (err) {
    console.error("Get enrollments error:", err.message);
    res.status(500).json({ success: false, message: "Server error retrieving enrollments" });
  }
};
