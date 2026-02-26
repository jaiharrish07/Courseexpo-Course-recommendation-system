// services/aiService.js
const { generateContent } = require("../config/gemini");
const { rankCourses } = require("./scoring");

/**
 * Calls Gemini AI to score and explain relevance of a single course
 */
async function aiScoreSingleCourse(course, userPrefs) {
  const prompt = `
You are an AI system for recommending online courses.

USER PREFERENCES:
${JSON.stringify(userPrefs, null, 2)}

COURSE DETAILS:
${JSON.stringify(course, null, 2)}

TASK:
Evaluate how well this course matches the user preferences.
Consider category relevance, level, rating, certification, and price.
Give a score between 0 and 100 and 2–3 short reasons.

Respond strictly in pure JSON only (no extra words, no markdown):
{
  "ai_score": number,
  "ai_reasons": [ "reason1", "reason2", "reason3" ]
}
`;

  try {
    const response = await generateContent(prompt);

    // 🧠 Gemini sometimes wraps JSON in text — so clean it
    const match = response.match(/\{[\s\S]*\}/);
    if (!match) {
      console.warn("⚠️ Gemini did not return valid JSON:", response);
      return {
        ai_score: 50,
        ai_reasons: ["AI response malformed, fallback score used."],
      };
    }

    const cleaned = match[0];
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("❌ AI JSON parse failed:", cleaned);
      parsed = { ai_score: 50, ai_reasons: ["AI response invalid JSON."] };
    }

    return {
      ai_score: parsed.ai_score ?? 50,
      ai_reasons: parsed.ai_reasons ?? ["No valid reasons provided."],
    };
  } catch (error) {
    console.error("🚨 AI scoring error:", error);
    return {
      ai_score: 50,
      ai_reasons: ["AI service unavailable, fallback score used."],
    };
  }
}

/**
 * Hybrid AI + Rule-based scoring for multiple courses
 */
async function aiScoreCourses(courses, userPrefs) {
  const results = [];

  for (const course of courses) {
    const aiResult = await aiScoreSingleCourse(course, userPrefs);

    results.push({
      ...course,
      ai_score: aiResult.ai_score,
      ai_reasons: aiResult.ai_reasons,
    });
  }

  return results;
}

/**
 * Final AI-powered recommendations
 */
async function generateAIRecommendations(courses, userPrefs) {
  // Step 1: Rule-based ranking
  const ruleRanked = rankCourses(courses, userPrefs);

  // Step 2: AI-based scoring
  const aiRanked = await aiScoreCourses(courses, userPrefs);

  // Step 3: Merge both scores (50-50 weighting)
  const merged = courses.map(course => {
    const ruleData = ruleRanked.find(c => c.id === course.id) || {};
    const aiData = aiRanked.find(c => c.id === course.id) || {};

    const finalScore =
      ((ruleData.final_score || 0) * 0.5) + ((aiData.ai_score || 0) * 0.5);

    return {
      ...course,
      rule_score: ruleData.final_score || 0,
      ai_score: aiData.ai_score || 0,
      ai_reasons: aiData.ai_reasons || [],
      final_score: finalScore,
    };
  });

  // Step 4: Sort by final score
  return merged.sort((a, b) => b.final_score - a.final_score);
}

module.exports = {
  aiScoreCourses,
  generateAIRecommendations,
};
