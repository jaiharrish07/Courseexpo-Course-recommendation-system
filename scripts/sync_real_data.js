const fs = require('fs');
const path = require('path');
require('dotenv').config();

// The API key is provided by the execution environment at runtime.
const apiKey = ""; 

// Expanded categories to ensure a "real-world" catalog depth
const CATEGORIES = [
    "Full Stack Web Development (React, Node.js, Next.js)",
    "Data Science, Machine Learning, and Artificial Intelligence",
    "Digital Marketing, SEO, and Social Media Strategy",
    "UI/UX Design and Product Design (Figma, Adobe XD)",
    "Cloud Computing (AWS, Microsoft Azure, Google Cloud)",
    "Cybersecurity, Ethical Hacking, and Network Security",
    "Mobile App Development (Flutter, React Native, Swift, Kotlin)",
    "Blockchain Development and Web3 Foundations",
    "DevOps Engineering and CI/CD Pipelines",
    "Data Analytics and Business Intelligence (Tableau, PowerBI)"
];

const CSV_HEADER = "Title,PlatformName,Instructor,PriceINR,Rating,RatingCount,URL,Category,Description,DurationHours,DifficultyLevel,Certification,CertificationIncluded\n";
const CSV_FILE_PATH = path.resolve(__dirname, 'courses_data.csv');

/**
 * Fetches real-time data using Gemini 2.5 Flash with Google Search grounding.
 */
async function fetchRealData(category) {
    console.log(`🔍 Live-searching the web for ${category} courses...`);
    
    const systemPrompt = `You are a professional web data extraction agent. 
    Your goal is to find the top 5 most highly-rated and current online courses for the specific category provided.
    
    CRITICAL REQUIREMENTS:
    - You MUST use Google Search to find current prices and ratings.
    - Prices MUST be in Indian Rupees (INR). If the site shows USD, convert it using the current rate (~83.5).
    - If a course is Free, PriceINR should be 0.
    - CertificationIncluded: TRUE if the certificate comes with the base price (like Udemy), FALSE if it requires a separate fee or subscription (like Coursera/edX audit).
    
    Return ONLY a valid JSON array of objects with these exact keys:
    - title (string)
    - platform (string: Udemy, Coursera, edX, etc.)
    - instructor (string)
    - priceINR (number)
    - rating (number, e.g., 4.7)
    - ratingCount (number)
    - url (string)
    - category (string)
    - description (string, max 150 chars)
    - durationHours (number)
    - difficultyLevel (string: Beginner, Intermediate, Advanced)
    - certification (boolean)
    - certificationIncluded (boolean)`;

    const userQuery = `Find the 5 best real-time courses for: "${category}". Use Google Search to verify current INR prices and review counts.`;

    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        tools: [{ "google_search": {} }],
        generationConfig: {
            responseMimeType: "application/json"
        }
    };

    let retries = 5;
    let backoff = 1000;

    while (retries > 0) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            
            const result = await response.json();
            const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!textResponse) throw new Error("Empty response from AI");
            
            return JSON.parse(textResponse);
        } catch (error) {
            retries--;
            if (retries === 0) {
                console.error(`❌ Failed to fetch ${category} after multiple retries.`);
                return [];
            }
            await new Promise(res => setTimeout(res, backoff));
            backoff *= 2;
        }
    }
}

/**
 * Escapes values for CSV safety.
 */
function escapeCSV(val) {
    if (val === null || val === undefined) return '""';
    let str = String(val).replace(/"/g, '""');
    return `"${str}"`;
}

/**
 * Orchestrates the data collection and file writing.
 */
async function runSync() {
    console.log("--------------------------------------------------");
    console.log("🚀 STARTING REAL-TIME COURSE DATA SYNCHRONIZATION");
    console.log("--------------------------------------------------");
    
    let allCourses = [];

    for (const category of CATEGORIES) {
        const courses = await fetchRealData(category);
        if (Array.isArray(courses)) {
            // Standardize object keys to handle variations in AI output
            const standardized = courses.map(c => ({
                title: c.title || c.Title,
                platform: c.platform || c.Platform || c.PlatformName,
                instructor: c.instructor || c.Instructor,
                price: c.priceINR || c.PriceINR || c.price || 0,
                rating: c.rating || c.Rating || 0,
                count: c.ratingCount || c.RatingCount || c.count || 0,
                url: c.url || c.URL,
                cat: c.category || c.Category,
                desc: c.description || c.Description,
                dur: c.durationHours || c.DurationHours || 0,
                diff: c.difficultyLevel || c.DifficultyLevel || "Beginner",
                cert: c.certification ?? true,
                inc: c.certificationIncluded ?? false
            }));
            
            allCourses = [...allCourses, ...standardized];
            console.log(`✅ Collected ${standardized.length} courses for ${category}.`);
        }
    }

    if (allCourses.length === 0) {
        console.error("❌ Critical Failure: No data collected. Please verify API availability.");
        return;
    }

    console.log("\n📝 Saving data to CSV...");

    let csvContent = CSV_HEADER;

    allCourses.forEach(c => {
        const row = [
            escapeCSV(c.title),
            escapeCSV(c.platform),
            escapeCSV(c.instructor),
            c.price,
            c.rating,
            c.count,
            escapeCSV(c.url),
            escapeCSV(c.cat),
            escapeCSV(c.desc),
            c.dur,
            escapeCSV(c.diff),
            String(c.cert).toUpperCase(),
            String(c.inc).toUpperCase()
        ];
        csvContent += row.join(',') + '\n';
    });

    try {
        fs.writeFileSync(CSV_FILE_PATH, csvContent);
        console.log("--------------------------------------------------");
        console.log(`🎉 SUCCESS! ${allCourses.length} real courses saved to ${CSV_FILE_PATH}.`);
        console.log("👉 Next: Run 'node importFromCsv.js' to update your database.");
        console.log("--------------------------------------------------");
    } catch (err) {
        console.error("❌ File System Error:", err.message);
    }
}

// Ensure the script is running after a short delay to allow environment setup
setTimeout(runSync, 500);