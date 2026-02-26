// controllers/aiTestController.js
const { generateContent } = require("../config/gemini");

exports.testGemini = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt)
      return res.status(400).json({ success: false, message: "Prompt is required" });

    // Strengthen prompt to force Gemini to output JSON
    const structuredPrompt = `
You are an expert course recommender.
Task: ${prompt}

Please provide your answer as a JSON array like this:
[
  { "title": "Course name", "description": "Short 1-line explanation", "rating": 4.5, "price": 0, "certification": true },
  ...
]

Output only valid JSON (no extra text).
`;

    const response = await generateContent(structuredPrompt, {
      temperature: 0.6,
      maxOutputTokens: 1200,
    });

    // Try parsing JSON
    let parsedResponse = null;
    try {
      const jsonStart = response.indexOf("[");
      const jsonEnd = response.lastIndexOf("]");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        parsedResponse = JSON.parse(response.slice(jsonStart, jsonEnd + 1));
      }
    } catch (err) {
      parsedResponse = null;
    }

    res.json({
      success: true,
      prompt,
      aiResponse: parsedResponse || response || "No valid response.",
    });
  } catch (err) {
    console.error("AI Test Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

