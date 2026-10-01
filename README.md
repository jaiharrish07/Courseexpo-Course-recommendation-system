# CourseExpo — Course Recommendation System

An AI-powered course recommendation platform built with **React**, **Node.js/Express**, **PostgreSQL**, and **Google Gemini**.

## Features

- **Smart Recommendations** — Interactive questionnaire + AI-powered course matching
- **AI Search** — Natural language course search using Gemini
- **Career Path Generator** — AI-generated learning roadmaps
- **Course Comparison** — Side-by-side AI-enhanced course comparison
- **Trending Courses** — Popularity-based trending with configurable time windows
- **User Profiles** — Registration, login (JWT), preference management
- **Enrollments & Progress** — Track course enrollments and completion
- **Reviews** — Rate and review courses

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router, Framer Motion, Lucide Icons, Tailwind CSS |
| Backend | Node.js, Express, Express Validator |
| Database | PostgreSQL |
| AI | Google Gemini (generative-ai SDK) |
| Auth | JWT + bcrypt |

## Project Structure

```
├── server.js                  # Express entry point
├── config/
│   ├── db.js                  # PostgreSQL pool
│   └── gemini.js              # Gemini AI client
├── routes/                    # Express route definitions
├── controllers/               # Request handlers
├── middleware/
│   ├── authMiddleware.js      # JWT protect middleware
│   ├── errorHandler.js        # Global error handler
│   └── validate.js            # Express-validator helper
├── services/                  # Business logic (AI scoring)
├── utils/
│   ├── logger.js              # Request logger
│   └── scoring.js             # Rule-based course ranking
├── scripts/                   # DB seed, embeddings generation
├── sql/                       # Schema & sample data
├── data/                      # CSV datasets
└── client/                    # React frontend
    └── src/
        ├── pages/             # Page components
        ├── components/        # Reusable UI components
        ├── context/           # React context (theme)
        └── utils/             # API client & endpoints
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Google Gemini API key

### 1. Clone & Install

```bash
git clone https://github.com/jaiharrish07/Courseexpo-Course-recommendation-system.git
cd Courseexpo-Course-recommendation-system

# Backend dependencies
npm install

# Frontend dependencies
cd client && npm install && cd ..
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database URL, Gemini API key, and JWT secret
```

### 3. Set Up Database

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE courseexpo;"

# Run schema
psql -U postgres -d courseexpo -f sql/schema.sql

# Seed sample data
npm run seed
```

### 4. Run

```bash
# Backend (port 5000)
npm run dev

# Frontend (port 3000) — in a separate terminal
cd client && npm start
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register |
| POST | `/api/users/login` | Login (returns JWT) |
| GET | `/api/courses` | List courses |
| GET | `/api/courses/:id` | Course details |
| POST | `/api/smart-recommend/next-question` | Get next questionnaire question |
| POST | `/api/smart-recommend/smart-recommend` | Get AI recommendations |
| GET | `/api/ai-search?q=...` | AI-powered search |
| POST | `/api/career-path` | Generate career path |
| POST | `/api/compare` | Compare courses |
| GET | `/api/trending` | Trending courses |
| GET | `/api/enrollments` | User enrollments |
| GET | `/api/progress/summary` | Progress overview |
| GET | `/api/home` | Home page data |

## License

MIT
