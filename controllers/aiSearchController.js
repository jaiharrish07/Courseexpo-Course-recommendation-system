const pool = require("../config/db");
const { generateContent } = require("../config/gemini");

/**
 * searchCoursesAI
 * Step 1: SQL Keyword search to find potential matches.
 * Step 2: Gemini AI to rank them based on semantic fit.
 */
exports.searchCoursesAI = async (req, res) => {
  try {
    const query = req.query.q || req.body.query;
    const limit = Number(req.query.limit || req.body.limit || 10);

    if (!query) {
      return res.status(400).json({ success: false, message: "Search query is required." });
    }

    // 1. IMPROVED Keyword Extraction
    // We keep the query relatively broad for SQL to ensure we catch candidates
    const stopwords = [
      "best", "courses", "on", "in", "from", "to", "learn", "study", "how", "the", 
      "for", "a", "an", "is", "of", "and", "or", "want", "show", "me", "find", 
      "give", "get", "with", "mastering", "master", "course", "beginner", "advanced"
    ];
    
    const keywords = query
      .toLowerCase()
      .split(/[\s,\-_:]+/)
      .map((w) => w.replace(/[^\w]/g, ""))
      .filter((w) => w.length > 2 && !stopwords.includes(w));

    console.log("🔍 AI Search Triggered:", query);
    console.log("🧠 Cleaned Keywords:", keywords);

    if (keywords.length === 0) {
      return res.json({ success: true, results: [] });
    }

    // 2. Fetch Candidates from Database
    const likeClauses = keywords.map((_, i) => `(c.title ILIKE $${i + 1} OR c.description ILIKE $${i + 1} OR c.category ILIKE $${i + 1})`).join(" OR ");
    const values = keywords.map(w => `%${w}%`);
    const limitIdx = values.length + 1;
    
    // Fetch a healthy pool for the AI to judge
    values.push(30); 

    const sqlQuery = `
      SELECT c.id, c.title, c.category, c.description, c.url, c.price,
             c.certification, c.certification_included,
             COALESCE(c.rating, 0)::numeric(3,2) AS rating,
             COALESCE(c.rating_count, 0) AS rating_count,
             p.name AS platform_name
      FROM courses c
      LEFT JOIN platforms p ON c.platform_id = p.id
      WHERE ${likeClauses}
      ORDER BY c.rating DESC NULLS LAST
      LIMIT $${limitIdx}
    `;

    const { rows: candidates } = await pool.query(sqlQuery, values);
    console.log(`📡 Found ${candidates.length} SQL candidates.`);

    if (!candidates.length) {
      return res.json({ success: true, results: [] });
    }

    // 3. AI Semantic Ranking (with STRICT GROUNDING)
    const systemPrompt = `
      You are a semantic search engine. Your task is to rank the provided courses based on their relevance to the user's query.
      
      STRICT RULES:
      1. You MUST evaluate and provide a score for EVERY course provided in the JSON list.
      2. Match the user's intent: if they ask for "Java", distinguish it from "JavaScript". 
      3. A score of 0 means completely unrelated. 100 means perfect match.
      4. Return a JSON array of objects.
      
      Output format:
      [
        {"id": number, "score": number, "reason": "Short 1-sentence explanation"}
      ]
    `;

    const userPrompt = `User Query: "${query}"\n\nCourse Candidates:\n${JSON.stringify(
      candidates.map((c) => ({
        id: c.id,
        title: c.title,
        category: c.category || "General",
        description: (c.description || "").substring(0, 300)
      })), null, 2
    )}`;

    let aiResult = [];
    try {
      console.log("🚀 Requesting AI ranking...");
      const aiRaw = await generateContent(userPrompt, { 
        temperature: 0.1, 
        maxOutputTokens: 2500, // Increased to ensure long lists don't truncate
        responseMimeType: "application/json",
        systemInstruction: { parts: [{ text: systemPrompt }] } 
      });

      const cleaned = aiRaw.replace(/```json|```/g, "").trim();
      
      if (!cleaned.startsWith("[") || !cleaned.endsWith("]")) {
         throw new Error("AI response format invalid.");
      }
      
      aiResult = JSON.parse(cleaned);
      console.log(`✅ AI processed ${aiResult.length} items.`);
    } catch (aiErr) {
      console.warn("⚠️ AI Analysis failed or timed out. Falling back to SQL results.");
      return res.json({ 
        success: true, 
        results: candidates.map(c => ({ ...c, platform: c.platform_name, ai_score: 50, ai_reason: "Keyword match (AI fallback)" })).slice(0, limit) 
      });
    }

    // 4. Merge AI Scores
    const aiScoreMap = new Map();
    aiResult.forEach(s => {
      if (s && s.id != null) aiScoreMap.set(Number(s.id), s);
    });

    const resultsWithScores = candidates.map(c => {
      const aiData = aiScoreMap.get(Number(c.id));
      return {
        ...c,
        platform: c.platform_name,
        ai_score: aiData ? aiData.score : 10, // Default low score if AI missed it
        ai_reason: aiData ? aiData.reason : "Identified as a potential match via database search."
      };
    });

    // 5. Smart Filtering
    // We only filter out 0s if there are actually better results available
    let finalResults = resultsWithScores
      .filter(c => c.ai_score > 0)
      .sort((a, b) => b.ai_score - a.ai_score)
      .slice(0, limit);

    // If AI was too strict and returned nothing, fallback to top SQL matches
    if (finalResults.length === 0) {
      console.log("⚠️ AI filtered everything to 0. Falling back to SQL ranking.");
      finalResults = candidates.map(c => ({
        ...c,
        platform: c.platform_name,
        ai_score: 20,
        ai_reason: "Matching keywords found in course details."
      })).slice(0, limit);
    }

    console.log(`🏆 Returning ${finalResults.length} results.`);
    return res.json({ success: true, results: finalResults });

  } catch (err) {
    console.error("❌ Fatal Search Error:", err);
    res.status(500).json({ success: false, message: "Search service encountered a problem." });
  }
};