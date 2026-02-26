// controllers/recommendController.js
const pool = require("../config/db");
const { rankCourses } = require("../utils/scoring");
const { generateContent } = require("../config/gemini"); // expects generateContent(prompt, options)

const AI_MODEL_NAME = "gemini-2.5-pro"; // for your reference in prompts

// Helper: call Gemini to re-rank candidate courses.
// Expects candidates: array of { id, title, category, description, price, rating, rating_count, certification, difficulty_level, url }
async function aiRerankCandidates(userPrefs, candidates) {
  // build compact candidate list for prompt
  const candidatesCompact = candidates.map(c => ({
    id: c.id,
    title: c.title,
    category: c.category,
    price: Number(c.price || 0),
    rating: Number(c.rating || 0),
    rating_count: Number(c.rating_count || 0),
    certification: !!c.certification,
    difficulty_level: c.level || c.difficulty_level || null,
    url: c.url || null,
    description: (c.description || "").slice(0, 800) // limit size
  }));

  const prompt = `
You are an expert course recommender. The user preferences (JSON) are:
${JSON.stringify(userPrefs, null, 2)}

Here are candidate courses (array of objects). For each candidate include id, title, category, price, rating, rating_count, certification (true/false), difficulty_level, url, and a short description:
${JSON.stringify(candidatesCompact, null, 2)}

Task:
1) Re-rank the candidates by best fit for the user and return the top 10 in order.
2) For each recommended course return an object: { "id": <course id>, "score": <numeric score 0-100>, "reason": "<one-line reason>" }.
3) Output must be valid JSON: an array of objects as described.

Important:
- Only use the provided candidate ids (do NOT invent courses).
- Prefer courses that better match user preferences and goals.
- Keep the "score" consistent (0 lowest, 100 best).

Respond with JSON only.
`;

  // call Gemini
  const aiRaw = await generateContent(prompt, { temperature: 0.0, maxOutputTokens: 800 });
  // generateContent should return text (string)
  // try to parse JSON; if fails, attempt to extract JSON-ish text heuristically
  let aiList = [];
  try {
    aiList = JSON.parse(aiRaw);
  } catch (err) {
    // try to extract first JSON substring
    const jsonStart = aiRaw.indexOf("[");
    const jsonEnd = aiRaw.lastIndexOf("]");
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      try {
        aiList = JSON.parse(aiRaw.slice(jsonStart, jsonEnd + 1));
      } catch (err2) {
        // fallback: empty array
        aiList = [];
      }
    } else {
      aiList = [];
    }
  }

  return aiList;
}

exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1) Get user preferences
    const uRes = await pool.query("SELECT preferences FROM users WHERE id = $1", [userId]);
    if (!uRes.rows.length) return res.status(404).json({ success: false, message: "User not found" });
    const preferences = uRes.rows[0].preferences || {};

    // 2) Fetch courses + aggregates (rating_count)
    const { rows: courses } = await pool.query(`
      SELECT c.id, c.title, c.category, c.duration_hours, c.instructor_name, c.url,
             c.price, c.certification, c.difficulty_level AS level, c.description,
             COALESCE(AVG(r.rating), 0)::numeric(3,2) as rating,
             COUNT(r.id) as rating_count
      FROM courses c
      LEFT JOIN reviews r ON c.id = r.course_id
      GROUP BY c.id
    `);

    if (!courses.length) return res.json({ success: true, recommendations: [] });

    // 3) Rule-based ranking (filter + score)
    const ranked = rankCourses(courses, preferences);

    // If no candidates survive filters, fall back to top rated
    const fallbackCandidates = ranked.length ? ranked : courses.sort((a,b) => Number(b.rating || 0) - Number(a.rating || 0));

    // 4) Choose top N candidates to send to Gemini (limit to reduce prompt size)
    const TOP_N = 30;
    const candidates = fallbackCandidates.slice(0, TOP_N);

    // 5) Call Gemini to re-rank candidates semantically
    const aiResult = await aiRerankCandidates(preferences, candidates);

    // If Gemini returned no usable JSON, fallback to our rule-based order
    let finalList = [];
    if (Array.isArray(aiResult) && aiResult.length > 0) {
      // map aiResult (ids + score + reason) back to course objects
      const byId = {};
      candidates.forEach(c => { byId[c.id] = c; });
      finalList = aiResult
        .map(item => {
          const course = byId[item.id];
          if (!course) return null;
          return {
            ...course,
            ai_score: Number(item.score || 0),
            ai_reason: item.reason || null,
            score_rule: Number(course.score || 0),
            combined_score: Math.round((Number(item.score || 0) + Number(course.score || 0)) / 2)
          };
        })
        .filter(Boolean);
    } else {
      // fallback: attach rule-based scores and top candidates only
      finalList = candidates.map(c => ({
        ...c,
        ai_score: null,
        ai_reason: null,
        score_rule: c.score || 0,
        combined_score: c.score || 0
      }));
    }

    // 6) Persist top recommendations into recommendations table (non-blocking)
    const topToSave = finalList.slice(0, 10);
    try {
      const insertPromises = topToSave.map((course, idx) =>
        pool.query(
          `INSERT INTO recommendations (user_id, course_id, logic_used, score, reasons)
           VALUES ($1,$2,$3,$4,$5)`,
          [
            userId,
            course.id,
            "hybrid-gemini-2.5-pro",
            course.combined_score || course.ai_score || course.score,
            JSON.stringify({ ai_reason: course.ai_reason || null, score_rule: course.score || null, rank: idx + 1 })
          ]
        )
      );
      await Promise.all(insertPromises);
    } catch (err) {
      // do not fail the response if save fails
      console.warn("Failed to persist recommendations:", err.message);
    }

    // 7) Return recommendations
    res.json({ success: true, recommendations: finalList.slice(0, 10) });
  } catch (err) {
    console.error("Recommendation Error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

