-- Platforms
INSERT INTO platforms (name, website_url, platform_type)
VALUES
('Udemy', 'https://www.udemy.com', 'MOOC'),
('Coursera', 'https://www.coursera.org', 'MOOC'),
('edX', 'https://www.edx.org', 'MOOC');

-- Users
INSERT INTO users (name, email, password_hash, preferences)
VALUES
('Alice', 'alice@example.com', '$2b$10$hashedpassword1', '{"budget":200,"topics":["AI","Web Dev"]}'),
('Bob', 'bob@example.com', '$2b$10$hashedpassword2', '{"budget":100,"topics":["Data Science","SQL"]}');

-- Courses
INSERT INTO courses (platform_id, title, instructor_name, duration_hours, difficulty_level, price, certification, category, description, url)
VALUES
(1, 'Java Programming for Beginners', 'Instructor A', 20, 'Beginner', 50, TRUE, 'Programming', 'Learn Java from scratch', 'https://www.udemy.com/java-beginners'),
(2, 'Python for Everybody', 'Instructor C', 18, 'Beginner', 0, FALSE, 'Programming', 'Intro to Python programming', 'https://www.coursera.org/python'),
(2, 'Advanced SQL for Data Analysis', 'Instructor B', 30, 'Advanced', 100, TRUE, 'Database', 'Master SQL for data analytics', 'https://www.coursera.org/sql-advanced');

-- Course Topics
INSERT INTO course_topics (course_id, topic)
VALUES
(1, 'Java'), (1, 'Programming'),
(2, 'Python'), (2, 'Programming'),
(3, 'SQL'), (3, 'Database');

-- Reviews
INSERT INTO reviews (user_id, course_id, rating, feedback_text, success_tag)
VALUES
(1, 1, 5, 'Great introduction to Java', 'Career Boost'),
(2, 3, 4, 'Very useful for data analysis', 'Skill Improvement');

-- Enrollments
INSERT INTO enrollments (user_id, course_id, completion_pct, time_spent_hours, completion_status)
VALUES
(1, 1, 50, 10, 'In-progress'),
(2, 3, 100, 30, 'Completed');

