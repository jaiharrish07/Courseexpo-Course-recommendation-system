-- sql/schema.sql
-- DROP if exists (only for dev)
DROP TABLE IF EXISTS ai_model_logs CASCADE;
DROP TABLE IF EXISTS recommendations CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS course_topics CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS platforms CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  preferences JSONB, -- e.g. { "budget": 200, "topics": ["AI","Web Dev"] }
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Platforms
CREATE TABLE platforms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) UNIQUE NOT NULL,
  website_url TEXT,
  platform_type VARCHAR(50)
);

-- Courses
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  platform_id INT REFERENCES platforms(id) ON DELETE SET NULL,
  title VARCHAR(300) NOT NULL,
  instructor_name VARCHAR(200),
  duration_hours INT, -- integer hours
  difficulty_level VARCHAR(50),
  price NUMERIC(10,2) DEFAULT 0,
  discount_price NUMERIC(10,2),
  certification BOOLEAN DEFAULT FALSE,
  category VARCHAR(150),
  description TEXT,
  url TEXT,
  rating NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course topics (many-to-many via topic string)
CREATE TABLE course_topics (
  course_id INT REFERENCES courses(id) ON DELETE CASCADE,
  topic VARCHAR(100),
  PRIMARY KEY (course_id, topic)
);

-- Reviews
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  course_id INT REFERENCES courses(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  success_tag VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enrollments (student dashboard: progress, completion status)
CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  course_id INT REFERENCES courses(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completion_status VARCHAR(50) DEFAULT 'In-progress', -- In-progress / Completed / Dropped
  completion_pct NUMERIC(5,2) DEFAULT 0, -- 0 - 100
  completion_date TIMESTAMP,
  time_spent_hours NUMERIC(8,2) DEFAULT 0
);

-- Recommendation log (for later)
CREATE TABLE recommendations (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  course_id INT REFERENCES courses(id) ON DELETE CASCADE,
  logic_used VARCHAR(200),
  score NUMERIC(8,2),
  reasons JSONB,
  recommended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI logs (future)
CREATE TABLE ai_model_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  input_data JSONB,
  output_courses JSONB,
  model_version VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE user_progress (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  course_id INT REFERENCES courses(id),
  progress_percent DECIMAL(5,2),
  last_accessed TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ai_roadmaps (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  goal TEXT,
  roadmap JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);



-- Useful index for searching
CREATE INDEX idx_courses_title ON courses USING gin (to_tsvector('english', title));
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_price ON courses(price);
