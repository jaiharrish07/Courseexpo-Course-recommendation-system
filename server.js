const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const cors = require("cors");
const pool = require("./config/db");
const { errorHandler } = require("./middleware/errorHandler");
const { log } = require("./utils/logger");

const app = express();

// Middlewares
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(log); // logger middleware

// Routes
app.use("/api/users", require("./routes/users"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/enrollments", require("./routes/enrollments"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/smart-recommend", require("./routes/smartRecommend"));
app.use("/api/ai-search", require("./routes/aiSearch"));
app.use("/api/ai-test", require("./routes/aiTestRoutes"));
app.use("/api/compare", require("./routes/compare"));
app.use("/api/trending", require("./routes/trending"));
app.use("/api/progress", require("./routes/progress"));
app.use("/api/career-path", require("./routes/aiCareerPathRoutes")); // Fixed route
app.use("/api/home", require("./routes/home"));

// Health check
app.get("/", (req, res) => res.send("Course Recommender Backend — Core APIs"));

// Error handler
app.use(errorHandler);

// Start server after DB test
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("PostgreSQL connected ✅");
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("DB connection failed ❌", err.message);
    process.exit(1);
  }
})();
