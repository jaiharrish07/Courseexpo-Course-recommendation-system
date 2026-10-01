// scripts/generateEmbeddings.js
// Usage: NODE_ENV=production node scripts/generateEmbeddings.js
require("dotenv").config();
const pool = require("../config/db");
const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function run() {
  const { rows: courses } = await pool.query("SELECT id, title, description, category FROM courses");
  console.log(`Found ${courses.length} courses`);
  for (const c of courses) {
    const text = `${c.title}. ${c.description || ""}. Category: ${c.category || ""}`;
    try {
      const embeddingRes = await client.embeddings.create({
        model: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-large",
        input: text,
      });
      const vector = embeddingRes.data[0].embedding;
      // store vector (pgvector supports sending array)
      await pool.query("UPDATE courses SET embedding = $1 WHERE id = $2", [vector, c.id]);
      console.log(`Saved embedding for course id=${c.id}`);
    } catch (err) {
      console.error("Embedding error for course", c.id, err.message || err);
    }
  }
  console.log("Done");
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });

