const pool = require("../config/db");
const { generateContent } = require("../config/gemini");

/**
 * compareCourses
 * Fetches detailed course data from the database and uses Gemini AI 
 * to provide a structured, scored comparison based on user preferences.
 */
exports.compareCourses = async (req, res) => {
  try {
    const { course_ids, preferences = {} } = req.body;

    // 1. Validation: Ensure we have at least two IDs
    if (!Array.isArray(course_ids) || course_ids.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Select at least two courses to compare.",
      });
    }

    // 2. Fetch detailed course info from PostgreSQL
    // We cast IDs to integers to ensure the ANY clause works correctly
    const { rows: courses } = await pool.query(
      `
      SELECT c.id, c.title, p.name AS platform_name,
             c.price, c.certification, c.difficulty_level AS level,
             c.duration_hours, c.description,
             COALESCE(c.rating, 0)::numeric(3,2) AS rating,
             COALESCE(c.rating_count, 0) AS rating_count
      FROM courses c
      LEFT JOIN platforms p ON c.platform_id = p.id
      WHERE c.id = ANY($1::int[])
      `,
      [course_ids.map(id => Number(id))]
    );

    if (courses.length < 2) {
      return res.status(404).json({ 
        success: false, 
        message: "One or more selected courses were not found in the database." 
      });
    }

    // 3. Prepare compact data for the AI prompt
    const compactData = courses.map(c => ({
      id: Number(c.id),
      title: c.title,
      platform: c.platform_name,
      price: Number(c.price || 0),
      level: c.level,
      rating: Number(c.rating),
      description: (c.description || "").substring(0, 500)
    }));

    // 4. Construct the prompt for Native JSON Mode
    const prompt = `
      You are an expert education consultant. 
      Compare the following courses based on these user preferences: ${JSON.stringify(preferences)}
      
      Course Data:
      ${JSON.stringify(compactData, null, 2)}

      Return a JSON array of objects. Each object MUST contain:
      - id (exact numeric ID from the input)
      - score (integer 0-100)
      - pros (array of exactly 3 short strings)
      - cons (array of exactly 3 short strings)
      - summary (one short sentence verdict)

      Focus specifically on how these courses align with the user's goals.
    `;

    // 5. Call Gemini with JSON Mode enabled
    console.log("🚀 Requesting AI Comparison with JSON Mode...");
    const aiRaw = await generateContent(prompt, { 
      temperature: 0.1,
      responseMimeType: "application/json" // CRITICAL: This forces the model to return valid JSON
    });
    
    // 6. Clean and parse AI response
    let aiResult = [];
    try {
      // Remove any accidental markdown fences (```json) if the model ignored the config
      const cleanedJson = aiRaw.replace(/```json|```/g, "").trim();
      aiResult = JSON.parse(cleanedJson);
    } catch (parseError) {
      console.warn("⚠️ AI JSON parse failed, attempting regex fallback for safety...");
      // Regex fallback to find the array block inside the string
      const match = aiRaw.match(/\[[\s\S]*\]/);
      if (match) {
        aiResult = JSON.parse(match[0]);
      } else {
        console.error("AI Output could not be parsed:", aiRaw);
        throw new Error("AI failed to generate a parseable comparison.");
      }
    }

    // 7. Final normalization for Frontend safety
    // This ensures IDs are numbers and arrays exist so the UI doesn't crash
    const finalComparison = (Array.isArray(aiResult) ? aiResult : []).map(item => ({
      ...item,
      id: Number(item.id), 
      score: Number(item.score || 0),
      pros: Array.isArray(item.pros) ? item.pros : ["Comprehensive curriculum", "Hands-on projects", "Platform reputation"],
      cons: Array.isArray(item.cons) ? item.cons : ["Requires significant time", "Limited advanced depth", "Certificate may have extra cost"],
      summary: item.summary || "This course provides a balanced approach to the subject matter."
    }));

    res.json({ success: true, comparison: finalComparison });

  } catch (error) {
    console.error("❌ Comparison Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "The AI is currently processing high volume or returned an invalid format. Please try again in a moment." 
    });
  }
};