// seedDb.js
// Populates PostgreSQL DB with platform and course data.
// Assumes prices entered in the 'coursesData' array are ALREADY IN INR.
// Includes optional table clearing and certification cost flag.
// !! USER MUST REPLACE PLACEHOLDER DATA IN 'coursesData' WITH REAL, CURRENT DATA IN INR !!

const pool = require('./config/db');
require('dotenv').config();

// --- Configuration ---
const CLEAR_EXISTING_COURSES = true;

// --- Platform Data ---
const platforms = [
  { name: 'Udemy', url: 'https://www.udemy.com/' },
  { name: 'Coursera', url: 'https://www.coursera.org/' },
  { name: 'edX', url: 'https://www.edx.org/' },
  { name: 'Khan Academy', url: 'https://www.khanacademy.org/' },
  { name: 'Udacity', url: 'https://www.udacity.com/' },
  { name: 'Skillshare', url: 'https://www.skillshare.com/' },
  { name: 'LinkedIn Learning', url: 'https://www.linkedin.com/learning/' },
  { name: 'FutureLearn', url: 'https://www.futurelearn.com/' },
  { name: 'Pluralsight', url: 'https://www.pluralsight.com/' },
];

// --- Sample Course Data ---
const coursesData = [
  {
    platformName: 'Udemy',
    title: 'The Complete 2025 Web Development Bootcamp',
    instructor_name: 'Dr. Angela Yu',
    duration_hours: 66,
    difficulty_level: 'Beginner',
    price: 3499,
    certification: true,
    category: 'Web Development',
    description: 'Become a Full-Stack Web Developer: HTML, CSS, Javascript, Node, React, MongoDB, Web3 and DApps.',
    url: 'https://www.udemy.com/course/the-complete-web-development-bootcamp/',
    rating: 4.7,
    rating_count: 250000,
  },
  {
    platformName: 'Coursera',
    title: 'Google Data Analytics Professional Certificate',
    instructor_name: 'Google Career Certificates',
    duration_hours: 180,
    difficulty_level: 'Beginner',
    price: 0,
    certification: true,
    category: 'Data Science',
    description: 'Professional training designed by Google to prepare for a career in data analytics.',
    url: 'https://www.coursera.org/professional-certificates/google-data-analytics',
    rating: 4.8,
    rating_count: 90000,
  },
  {
    platformName: 'edX',
    title: "CS50's Introduction to Computer Science",
    instructor_name: 'David J. Malan (Harvard)',
    duration_hours: 120,
    difficulty_level: 'Beginner',
    price: 0,
    certification: true,
    category: 'Computer Science',
    description: 'An introduction to the intellectual enterprises of computer science and the art of programming.',
    url: 'https://www.edx.org/course/introduction-computer-science-harvardx-cs50x',
    rating: 4.9,
    rating_count: 50000,
  },
  {
    platformName: 'Udacity',
    title: 'Introduction to Python Programming',
    instructor_name: 'Various Instructors',
    duration_hours: 60,
    difficulty_level: 'Beginner',
    price: 0,
    certification: false,
    category: 'Programming',
    description: 'Learn the fundamentals of Python programming.',
    url: 'https://www.udacity.com/course/introduction-to-python--ud1110',
    rating: 4.6,
    rating_count: 15000,
  },
  {
    platformName: 'Khan Academy',
    title: 'SQL: Querying and managing data',
    instructor_name: 'Khan Academy Team',
    duration_hours: 10,
    difficulty_level: 'Beginner',
    price: 0,
    certification: false,
    category: 'Databases',
    description: 'Learn how to use SQL to store, query, and manipulate data.',
    url: 'https://www.khanacademy.org/computing/computer-programming/sql',
    rating: 4.8,
    rating_count: 100000,
  },
  {
  "platformName": "LinkedIn Learning",
  "title": "SQL Essential Training",
  "instructor_name": "Bill Weinman",
  "duration_hours": 4, 
  "difficulty_level": "Beginner",
  "price": 0, 
  "certification": true,
  "category": "Databases",
  "description": "Learn the basics of SQL for database management.",
  "url": "https://www.linkedin.com/learning/sql-essential-training-14536128",
  "rating": 4.6,
  "rating_count": 130000
 },
 {
  "platformName": "Coursera",
  "title": "Google Data Analytics Professional Certificate",
  "instructor_name": "Google Career Certificates",
  "duration_hours": 112,
  "difficulty_level": "Beginner",
  "price": 49 * 83, 
  "certification": true,
  "category": "Data Analytics",
  "description": "Build job-ready skills in data analytics including spreadsheets, SQL, R, Tableau.",
  "url": "https://www.coursera.org/professional-certificates/google-data-analytics",
  "rating": 4.8,
  "rating_count": 162598
 },
 {
  "platformName": "Udemy",
  "title": "The Complete Python Bootcamp From Zero to Hero in Python",
  "instructor_name": "Jose Portilla",
  "duration_hours": 21,
  "difficulty_level": "Beginner to Intermediate",
  "price": 39.99 * 83,
  "certification": true,
  "category": "Programming / Python",
  "description": "Learn Python like a professional — basics to advanced, build applications and games.",
  "url": "https://www.udemy.com/course/complete-python-bootcamp/?srsltid=AfmBOopjxWwl7wwKy8P7_78rrUXtPpbcZ4hVLEC7Eguwt8SvcSY9GsIu",
  "rating": 4.6,
  "rating_count": 2100000
},
{
  "platformName": "Udemy",
  "title": "100 Days of Code: The Complete Python Pro Bootcamp",
  "instructor_name": "Dr. Angela Yu",
  "duration_hours": 60,
  "difficulty_level": "Beginner to Advanced",
  "price": 15.99 * 83,
  "certification": true,
  "category": "Programming / Python",
  "description": "Build Python skills over 100 days by doing 1 real-project per day; covers websites, games, apps, automation.",
  "url": "https://www.udemy.com/course/excellent-python-3-bootcamp-in-2023/?srsltid=AfmBOoqsomRWCeE6nSa0R6qP8/",
  "rating": 4.7,
  "rating_count": 397442
},
{
  "platformName": "Coursera",
  "title": "IBM Data Analyst Professional Certificate",
  "instructor_name": "IBM Skills Network Team",
  "duration_hours": 120,
  "difficulty_level": "Beginner",
  "price": 59 * 83,
  "certification": true,
  "category": "Data Analytics",
  "description": "Learn data analysis using Excel, Python, SQL, dashboards and gain job-ready portfolio.",
  "url": "https://www.coursera.org/professional-certificates/ibm-data-analyst",
  "rating": 4.7,
  "rating_count": 24514
},
{
  "platformName": "Udemy",
  "title": "Machine Learning A-Z™: Hands-On Python & R In Data Science",
  "instructor_name": "Kirill Eremenko & Hadelin de Ponteves",
  "duration_hours": 40,
  "difficulty_level": "Intermediate",
  "price": 49.99 * 83,
  "certification": true,
  "category": "Data Science / Machine Learning",
  "description": "Learn machine learning techniques using Python and R; build models, work on real projects.",
  "url": "https://www.udemy.com/course/machinelearning/",
  "rating": 4.5,
  "rating_count": 450000
},
{
  "platformName": "edX",
  "title": "CS50’s Introduction to Computer Science",
  "instructor_name": "David J. Malan",
  "duration_hours": 120,
  "difficulty_level": "Beginner / Advanced",
  "price": 199 * 83,
  "certification": true,
  "category": "Computer Science",
  "description": "Harvard’s flagship introductory course to computer science and programming.",
  "url": "https://www.edx.org/course/cs50s-introduction-to-computer-science",
  "rating": 4.8,
  "rating_count": 350000
},
{
  "platformName": "Coursera",
  "title": "Deep Learning Specialization",
  "instructor_name": "Andrew Ng",
  "duration_hours": 150,
  "difficulty_level": "Intermediate to Advanced",
  "price": 49 * 83,
  "certification": true,
  "category": "Artificial Intelligence / Deep Learning",
  "description": "In-depth tutorials on neural networks, CNNs, sequence models and more by deeplearning.ai.",
  "url": "https://www.coursera.org/specializations/deep-learning",
  "rating": 4.8,
  "rating_count": 180000
},
{
  "platformName": "Pluralsight",
  "title": "Azure Administration – The Big Picture",
  "instructor_name": "Shane Young",
  "duration_hours": 2.5,
  "difficulty_level": "Beginner",
  "price": 29 * 83,
  "certification": true,
  "category": "Cloud Computing / Azure",
  "description": "Get a high-level overview of Microsoft Azure administration and services.",
  "url": "https://www.pluralsight.com/courses/azure-administration-big-picture",
  "rating": 4.6,
  "rating_count": 2200
},
{
  "platformName": "Udacity",
  "title": "Data Analyst Nanodegree",
  "instructor_name": "Udacity Team",
  "duration_hours": 4 * 30,  // ~4 months assuming 30 hours/month
  "difficulty_level": "Intermediate",
  "price": 399 * 83,
  "certification": true,
  "category": "Data Science / Analytics",
  "description": "Become a data analyst by mastering SQL, Python, statistics, and project work.",
  "url": "https://www.udacity.com/course/data-analyst-nanodegree--nd002",
  "rating": 4.7,
  "rating_count": 15000
},
{
  "platformName": "Udemy",
  "title": "Complete Java Masterclass",
  "instructor_name": "Tim-Buchalka & Goran Lochert",
  "duration_hours": 80,
  "difficulty_level": "Beginner to Intermediate",
  "price": 39.99 * 83,
  "certification": true,
  "category": "Programming / Java",
  "description": "Learn Java from scratch and master object-oriented programming, GUIs and more.",
  "url": "https://www.udemy.com/course/java-programming-masterclass-for-java-developers/",
  "rating": 4.6,
  "rating_count": 470000
},
{
  "platformName": "edX",
  "title": "MicroMasters® Program in Artificial Intelligence",
  "instructor_name": "Columbia University",
  "duration_hours": 240,
  "difficulty_level": "Intermediate to Advanced",
  "price": 1499 * 83,
  "certification": true,
  "category": "Artificial Intelligence",
  "description": "Advanced series of courses covering AI techniques including search, planning, machine learning, robotics.",
  "url": "https://www.edx.org/micromasters/columbiax-artificial-intelligence",
  "rating": 4.7,
  "rating_count": 38000
},
{
  "platformName": "edX",
  "title": "MicroMasters® Program in Artificial Intelligence",
  "instructor_name": "Columbia University",
  "duration_hours": 240,
  "difficulty_level": "Intermediate to Advanced",
  "price": 1499 * 83,
  "certification": true,
  "category": "Artificial Intelligence",
  "description": "Advanced series of courses covering AI techniques including search, planning, machine learning, robotics.",
  "url": "https://www.edx.org/micromasters/columbiax-artificial-intelligence",
  "rating": 4.7,
  "rating_count": 38000
},
{
  "platformName": "Coursera",
  "title": "Python for Everybody Specialization",
  "instructor_name": "Charles Severance",
  "duration_hours": 140,
  "difficulty_level": "Beginner",
  "price": 49 * 83,
  "certification": true,
  "category": "Programming / Python",
  "description": "Learn Python basics, data structures, web access, databases with Python.",
  "url": "https://www.coursera.org/specializations/python",
  "rating": 4.8,
  "rating_count": 230000
},
{
  "platformName": "Pluralsight",
  "title": "C# Fundamentals Including C# 10",
  "instructor_name": "Scott Allen",
  "duration_hours": 6.5,
  "difficulty_level": "Beginner",
  "price": 29 * 83,
  "certification": true,
  "category": "Programming / C#",
  "description": "Get started with C#, covering syntax, object-oriented features, LINQ, async and more.",
  "url": "https://www.pluralsight.com/courses/csharp-fundamentals-dev",
  "rating": 4.5,
  "rating_count": 1500
},
{
  "platformName": "Udacity",
  "title": "AI Programming with Python Nanodegree",
  "instructor_name": "Udacity Team",
  "duration_hours": 3 * 40,  // ~3 months at ~40 hrs/month
  "difficulty_level": "Intermediate",
  "price": 399 * 83,
  "certification": true,
  "category": "Artificial Intelligence / Python",
  "description": "Learn Python, NumPy, Pandas, Matplotlib, Linear Algebra, Neural Networks and deploy AI applications.",
  "url": "https://www.udacity.com/course/ai-programming-python-nanodegree--nd089",
  "rating": 4.7,
  "rating_count": 11800
},
{
  "platformName": "Udemy",
  "title": "Complete Java Masterclass",
  "instructor_name": "Tim Buchalka & Goran Lochert",
  "duration_hours": 80,
  "difficulty_level": "Beginner to Intermediate",
  "price": 39.99 * 83,
  "certification": true,
  "category": "Programming / Java",
  "description": "Learn Java from scratch and master object-oriented programming, GUIs and more.",
  "url": "https://www.udemy.com/course/java-programming-masterclass-for-java-developers/",
  "rating": 4.6,
  "rating_count": 470000
},
{
  "platformName": "edX",
  "title": "MicroMasters® Program in Artificial Intelligence",
  "instructor_name": "Columbia University",
  "duration_hours": 240,
  "difficulty_level": "Intermediate to Advanced",
  "price": 1499 * 83,
  "certification": true,
  "category": "Artificial Intelligence",
  "description": "Advanced series of courses covering AI techniques including search, planning, machine learning, robotics.",
  "url": "https://www.edx.org/micromasters/columbiax-artificial-intelligence",
  "rating": 4.7,
  "rating_count": 38000
},
{
  "platformName": "Coursera",
  "title": "Python for Everybody Specialization",
  "instructor_name": "Charles Severance",
  "duration_hours": 140,
  "difficulty_level": "Beginner",
  "price": 49 * 83,
  "certification": true,
  "category": "Programming / Python",
  "description": "Learn Python basics, data structures, web access, databases with Python.",
  "url": "https://www.coursera.org/specializations/python",
  "rating": 4.8,
  "rating_count": 230000
},
{
  "platformName": "Pluralsight",
  "title": "C# Fundamentals Including C# 10",
  "instructor_name": "Scott Allen",
  "duration_hours": 6.5,
  "difficulty_level": "Beginner",
  "price": 29 * 83,
  "certification": true,
  "category": "Programming / C#",
  "description": "Get started with C#, covering syntax, object-oriented features, LINQ, async and more.",
  "url": "https://www.pluralsight.com/courses/csharp-fundamentals-dev",
  "rating": 4.5,
  "rating_count": 1500
},
{
  "platformName": "Udacity",
  "title": "AI Programming with Python Nanodegree",
  "instructor_name": "Udacity Team",
  "duration_hours": 120,  // ~3 months at ~40 hrs/month
  "difficulty_level": "Intermediate",
  "price": 399 * 83,
  "certification": true,
  "category": "Artificial Intelligence / Python",
  "description": "Learn Python, NumPy, Pandas, Matplotlib, Linear Algebra, Neural Networks and deploy AI applications.",
  "url": "https://www.udacity.com/course/ai-programming-python-nanodegree--nd089",
  "rating": 4.7,
  "rating_count": 11800
},





















];

// --- Seeding Logic ---
async function seedDatabase() {
  const client = await pool.connect();
  console.log('Connected to database for seeding...');

  try {
    await client.query('BEGIN');

    if (CLEAR_EXISTING_COURSES) {
      console.warn('⚠️ Clearing ALL existing courses...');
      await client.query('DELETE FROM courses;');
      console.log('   -> Existing courses cleared.');
    }

    console.log('Seeding platforms...');
    const platformInserts = platforms.map(p =>
      client.query('INSERT INTO platforms (name, website_url) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING RETURNING id, name', [p.name, p.url])
    );
    await Promise.all(platformInserts);

    const { rows: allPlatforms } = await client.query('SELECT id, name FROM platforms');
    const platformNameToId = Object.fromEntries(allPlatforms.map(p => [p.name, p.id]));
    console.log('Platforms seeded/verified.');

    console.log(`Seeding courses...`);
    let coursesInserted = 0;

    for (const course of coursesData) {
      const platformId = platformNameToId[course.platformName];
      if (!platformId) {
        console.warn(`⚠️ Platform '${course.platformName}' not found. Skipping '${course.title}'.`);
        continue;
      }

      const priceInINR = isNaN(Number(course.price)) ? 0 : Number(course.price);
      const certificationIncluded = !!(course.certification && priceInINR === 0);

      try {
        const result = await client.query(
          `INSERT INTO courses (
            platform_id, title, instructor_name, duration_hours, difficulty_level,
            price, discount_price, certification, category, description, url, rating, rating_count,
            certification_included
          ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14
          ) RETURNING id`,
          [
            platformId, course.title, course.instructor_name || null,
            Math.round(course.duration_hours) || null,
            course.difficulty_level || null,
            priceInINR, null, course.certification || false,
            course.category || null, course.description || null,
            course.url || null, course.rating || 0, course.rating_count || 0,
            certificationIncluded
          ]
        );

        if (result.rowCount > 0) coursesInserted++;
      } catch (insertError) {
        if (insertError.message.includes("certification_included")) {
          console.error(`❌ Column 'certification_included' missing in DB schema. Please update schema.sql.`);
        } else {
          console.error(`❌ Error inserting '${course.title}':`, insertError.message);
        }
      }
    }

    console.log(`✅ Inserted ${coursesInserted} new courses.`);
    await client.query('COMMIT');
    console.log('✅ Database seeding completed!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err.message);
  } finally {
    client.release();
    console.log('Database connection released.');
    await pool.end();
    console.log('Connection pool closed.');
  }
}

seedDatabase();
