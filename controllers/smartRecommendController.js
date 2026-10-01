// controllers/smartRecommendController.js
const pool = require("../config/db");
const { generateContent } = require("../config/gemini");

const rankCourses = (courses, preferences) => {
  console.log("Applying rule-based ranking/filtering based on preferences:", preferences);
  return courses.map(c => ({ ...c, score: 0 }));
};

exports.getSmartRecommendations = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ success: false, message: "User not authenticated" });

    const preferences = req.body || {};
    console.log("Received preferences:", preferences);

    const { rows: courses } = await pool.query(`
      SELECT
        c.id, c.title, c.category, c.description, c.price, c.certification,
        c.certification_included, c.difficulty_level AS level, c.url,
        p.name AS platform_name,
        COALESCE(c.rating, 0)::numeric(3,2) AS rating,
        COALESCE(c.rating_count, 0) AS rating_count
      FROM courses c
      LEFT JOIN platforms p ON c.platform_id = p.id
    `);

    if (!courses.length)
      return res.json({ success: true, recommendations: [] });

    const ranked = rankCourses(courses, preferences);
    const candidates = ranked.slice(0, 20);

    const compact = candidates.map(c => ({
      id: c.id,
      title: c.title,
      platform: c.platform_name || 'N/A',
      category: c.category || 'N/A',
      level: c.level || 'N/A',
      price: Number(c.price || 0),
      rating: Number(c.rating || 0),
      certification: !!c.certification,
      description: (c.description || "").substring(0, 400)
    }));

    const prompt = `
You are an expert course recommender tailoring suggestions to user preferences.
User Preferences: ${JSON.stringify(preferences, null, 2)}

Here are candidate courses:
${JSON.stringify(compact, null, 2)}

Task:
1. Rank these courses (top 10) by fit to preferences.
2. For each, return:
   - "id": course ID
   - "score": 0–100
   - "reason": one-sentence reason

Return ONLY a valid JSON array:
[
  { "id": <course_id>, "score": <0-100>, "reason": "<why>" }
]
`;

    let aiRaw, aiRanking = [];
    try {
      aiRaw = await generateContent(prompt, { temperature: 0.1, maxOutputTokens: 2048 });
      const cleaned = aiRaw.replace(/```json|```/g, "").replace(/,\s*]/g, "]").replace(/,\s*}/g, "}").trim();
      if (!cleaned.startsWith("[") || !cleaned.endsWith("]")) throw new Error("Invalid JSON format");
      aiRanking = JSON.parse(cleaned);
    } catch (err) {
      console.warn("⚠️ Gemini failed or invalid JSON:", err.message);
      aiRanking = [];
    }

    const aiScoreMap = new Map();
    aiRanking.forEach(s => {
      if (s?.id) aiScoreMap.set(Number(s.id), { score: s.score, reason: s.reason });
    });

    const merged = candidates.map(c => {
      const ai = aiScoreMap.get(Number(c.id));
      const rule = c.score || 0;
      return {
        id: c.id,
        title: c.title,
        platform: c.platform_name,
        price: c.price,
        rating: c.rating,
        rating_count: c.rating_count,
        certification: c.certification,
        certification_included: c.certification_included,
        url: c.url,
        ai_score: ai?.score ?? null,
        reason: ai?.reason || "Recommended based on your preferences.",
        score_rule: rule,
        combined_score: ai?.score ?? rule
      };
    });

    merged.sort((a, b) => b.combined_score - a.combined_score);
    const finalRecommendations = merged.slice(0, 10);

    try {
      await Promise.all(finalRecommendations.map(c =>
        pool.query(
          `INSERT INTO recommendations (user_id, course_id, logic_used, score, reasons)
           VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
          [userId, c.id, "smart-recommend-v2", c.combined_score,
           JSON.stringify({ ai_reason: c.reason, score_rule: c.score_rule, preferences })]
        )
      ));
    } catch (dbErr) {
      console.warn("⚠️ Failed saving recommendations:", dbErr.message);
    }

    res.json({ success: true, recommendations: finalRecommendations });
  } catch (err) {
    console.error("❌ Smart recommendation error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
