const pool = require("../config/db");
const { generateContent } = require("../config/gemini");

exports.generateCareerPath = async (req, res) => {
  try {
    // Safely get the user ID. If req.user is null, userId will be null.
    const userId = req.user ? req.user.id : null;

    const { goal, skill_level, duration_preference } = req.body;

    if (!goal)
      return res
        .status(400)
        .json({ success: false, message: "Goal is required" });

    // 1️⃣ Fetch all courses
    const { rows: courses } = await pool.query(`
      SELECT id, title, category, difficulty_level, duration_hours, description, url, certification
      FROM courses
    `);

    if (!courses.length)
      return res.json({
        success: true,
        roadmap:
          "## No Courses Available\n\nWe couldn't find any courses in our database to build a roadmap. Please check back later.",
        message: "No courses available.",
      });

    // 2️⃣ AI prompt (Updated to request Markdown)
    const prompt = `
You are an AI Career Mentor.
User wants to become: "${goal}".
Current skill level: "${skill_level || "unspecified"}".
Preferred duration: "${duration_preference || "unspecified"}".

Here are available courses from our database:
${JSON.stringify(courses.slice(0, 35), null, 2)}

Task:
1. Design a 3-stage career roadmap: Beginner, Intermediate, Advanced.
2. For each stage, recommend 2-4 courses *from the list* and include a *short* reason why.
3. Add a short motivational summary at the end.
4. Output ONLY Markdown (no JSON, no \`\`\`markdown).

Example Output:
# Your Roadmap to ${goal}

## Beginner Stage
* **[Course Title]**: [Reason]
* **[Course Title]**: [Reason]

## Intermediate Stage
* **[Course Title]**: [Reason]

## Advanced Stage
* **[Course Title]**: [Reason]

**Summary:** [Your motivational summary...]
`;

    // 3️⃣ Get AI response
    let aiRaw = await generateContent(prompt, {
      temperature: 0.2,
      maxOutputTokens: 2048, // Increased token limit for markdown
    });

    // 4️⃣ Check for valid response
    if (!aiRaw || aiRaw.trim().length < 10) {
      console.warn("AI returned invalid or empty response.");
      return res
        .status(500)
        .json({ success: false, message: "AI returned invalid format." });
    }

    // 5️⃣ Save roadmap (if user is logged in) - Temporarily Commented Out for Debugging
    /*
    if (userId) {
      try {
        await pool.query(
          `INSERT INTO ai_roadmaps (user_id, goal, roadmap) VALUES ($1, $2, $3)`,
          [userId, goal, aiRaw]
        );
      } catch (dbError) {
        console.error("Database error saving roadmap:", dbError);
        // Don't crash the request if saving fails, just log it
      }
    }
    */

    // 6️⃣ Send success
    res.json({ success: true, roadmap: aiRaw }); // Send raw markdown
  } catch (err) {
    console.error("Career Path Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};
