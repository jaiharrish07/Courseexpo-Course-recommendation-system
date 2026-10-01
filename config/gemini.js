// config/gemini.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });

/**
 * generateContent(prompt, options)
 * Handles AI generation with support for JSON mode.
 */
const generateContent = async (prompt, options = {}) => {
  const maxTokens = options.maxOutputTokens || 1200;
  const temperature = options.temperature || 0.1; // Low temperature is better for JSON
  const responseMimeType = options.responseMimeType || "text/plain";

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { 
        temperature, 
        maxOutputTokens: maxTokens,
        responseMimeType // Use native JSON mode if requested
      },
    });

    const text = result.response?.text?.() || result.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text || text.trim().length === 0) {
      throw new Error("Gemini returned an empty response.");
    }

    return text;
  } catch (error) {
    console.error("❌ Gemini AI Error:", error);
    throw new Error(error.message || "Gemini API request failed.");
  }
};

module.exports = { generateContent };