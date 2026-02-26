// controllers/aiAssistantController.js
const pool = require("../config/db");

// --- Expanded Define the sequence of questions ---
const QUESTIONS = [
  { id: 'primary_goal', text: "What's your primary goal for taking online courses?", options: [ { label: "Learn a new skill for a hobby", value: "hobby" }, { label: "Advance in my current career", value: "career_advancement" }, { label: "Start a new career path", value: "new_career" }, { label: "Prepare for higher education", value: "education_prep" }, { label: "Just curious / General knowledge", value: "curiosity" } ] },
  { id: 'domain_interest', text: "Which broad domain interests you the most right now?", options: [ { label: "Technology (Programming, IT, Data Science)", value: "tech" }, { label: "Business (Marketing, Finance, Management)", value: "business" }, { label: "Creative Arts (Design, Writing, Music)", value: "creative" }, { label: "Health & Wellness", value: "health" }, { label: "Personal Development", value: "personal_dev" }, { label: "Languages", value: "language" }, { label: "Other", value: "other" } ] },
  { id: 'tech_sub_area', text: "Within Technology, which area are you most focused on?", dependsOn: { id: 'domain_interest', value: 'tech' }, options: [ { label: "Web Development (Frontend/Backend/Fullstack)", value: "web_dev" }, { label: "Data Science / Machine Learning / AI", value: "data_science_ml" }, { label: "Mobile App Development (iOS/Android)", value: "mobile_dev" }, { label: "Cloud Computing / DevOps", value: "cloud_devops" }, { label: "Cybersecurity", value: "cybersecurity" }, { label: "Game Development", value: "game_dev" }, { label: "IT Support / Networking", value: "it_support" }, { label: "Software Engineering Principles", value: "software_eng" } ] },
  { id: 'web_dev_focus', text: "For Web Development, are you more interested in Frontend, Backend, or Fullstack?", dependsOn: { id: 'tech_sub_area', value: 'web_dev' }, options: [ { label: "Frontend (User Interface, React, Vue, Angular)", value: "frontend" }, { label: "Backend (Server Logic, Databases, Node.js, Python, Java)", value: "backend" }, { label: "Fullstack (Both Frontend and Backend)", value: "fullstack" } ] },
  { id: 'data_science_focus', text: "Within Data Science/ML/AI, what's your main interest?", dependsOn: { id: 'tech_sub_area', value: 'data_science_ml' }, options: [ { label: "Data Analysis & Visualization", value: "data_analysis" }, { label: "Machine Learning Engineering", value: "ml_engineering" }, { label: "Deep Learning / AI Research", value: "deep_learning_ai" }, { label: "Big Data Technologies (Spark, Hadoop)", value: "big_data" }, { label: "Statistical Modeling", value: "stats_modeling" } ] },
  { id: 'mobile_platform', text: "For Mobile Development, which platform primarily interests you?", dependsOn: { id: 'tech_sub_area', value: 'mobile_dev' }, options: [ { label: "iOS (Swift, SwiftUI)", value: "ios" }, { label: "Android (Kotlin, Java)", value: "android" }, { label: "Cross-Platform (React Native, Flutter)", value: "cross_platform" }, { label: "Not sure yet", value: "unsure" } ] },
  { id: 'cloud_provider', text: "Which Cloud Provider are you most interested in?", dependsOn: { id: 'tech_sub_area', value: 'cloud_devops' }, options: [ { label: "AWS (Amazon Web Services)", value: "aws" }, { label: "Azure (Microsoft)", value: "azure" }, { label: "GCP (Google Cloud Platform)", value: "gcp" }, { label: "Platform Agnostic / General Concepts", value: "agnostic" } ] },
  { id: 'business_sub_area', text: "Within Business, which specific field interests you?", dependsOn: { id: 'domain_interest', value: 'business' }, options: [ { label: "Digital Marketing (SEO, SEM, Social Media)", value: "digital_marketing" }, { label: "Finance & Accounting", value: "finance_accounting" }, { label: "Management & Leadership", value: "management" }, { label: "Entrepreneurship / Startups", value: "entrepreneurship" }, { label: "Business Analytics", value: "business_analytics" }, { label: "Sales", value: "sales" } ] },
  { id: 'marketing_focus', text: "What aspect of Digital Marketing are you focusing on?", dependsOn: { id: 'business_sub_area', value: 'digital_marketing' }, options: [ { label: "Social Media Marketing", value: "social_media" }, { label: "Search Engine Optimization (SEO)", value: "seo" }, { label: "Paid Advertising (PPC)", value: "ppc" }, { label: "Content Marketing / Email", value: "content_email" }, { label: "Overall Strategy", value: "strategy" } ] },
  { id: 'creative_sub_area', text: "Within Creative Arts, what is your focus?", dependsOn: { id: 'domain_interest', value: 'creative' }, options: [ { label: "Graphic Design / Illustration", value: "graphic_design" }, { label: "UI/UX Design", value: "ui_ux" }, { label: "Photography / Videography", value: "photo_video" }, { label: "Music Production / Audio", value: "music_audio" }, { label: "Creative Writing", value: "writing" } ] },
  { id: 'design_tools', text: "Which design tools are you interested in learning?", dependsOn: { id: 'creative_sub_area', value: ['graphic_design', 'ui_ux'] }, options: [ { label: "Adobe Suite (Photoshop, Illustrator, XD)", value: "adobe" }, { label: "Figma", value: "figma" }, { label: "Canva", value: "canva" }, { label: "Procreate (for illustration)", value: "procreate" }, { label: "Not sure / Tool agnostic principles", value: "agnostic" } ] },
  { id: 'skill_level', text: "What's your current experience level in this chosen area?", options: [ { label: "Complete Beginner (No experience)", value: "beginner" }, { label: "Some Basic Knowledge / Familiarity", value: "familiar" }, { label: "Intermediate (Have built some projects)", value: "intermediate" }, { label: "Advanced (Professionally experienced)", value: "advanced" } ] },
  { id: 'learning_style', text: "How do you prefer to learn?", options: [ { label: "Mostly watching video lectures", value: "video" }, { label: "Reading articles and documentation", value: "reading" }, { label: "Primarily through hands-on projects", value: "projects" }, { label: "Interactive quizzes and assignments", value: "interactive" }, { label: "A balanced mix of everything", value: "mixed" } ] },
  { id: 'time_commitment', text: "How many hours per week can you realistically dedicate?", options: [ { label: "Casual (Less than 2 hours)", value: "low" }, { label: "Part-time (2-5 hours)", value: "medium-low" }, { label: "Focused (5-10 hours)", value: "medium" }, { label: "Dedicated (10-20 hours)", value: "medium-high" }, { label: "Intensive (20+ hours)", value: "high" } ] },
  { id: 'project_preference', text: "How important are real-world projects in a course?", options: [ { label: "Essential, I learn best by doing", value: "essential" }, { label: "Very important", value: "very_important" }, { label: "Somewhat important", value: "somewhat_important" }, { label: "Not a priority", value: "low_priority" } ] },
  { id: 'budget', text: "What's your approximate budget?", options: [ { label: "Free only", value: "free" }, { label: "Low (Under ₹2000 / $25)", value: "low" }, { label: "Medium (₹2000 - ₹10000 / $25 - $120)", value: "medium" }, { label: "High (Over ₹10000 / $120+)", value: "high" }, { label: "Flexible", value: "flexible" } ] },
  { id: 'certification_importance', text: "How important is getting a certificate?", options: [ { label: "Not important", value: "none" }, { label: "Nice to have", value: "low" }, { label: "Somewhat important", value: "medium" }, { label: "Very important", value: "high" } ] },
  { id: 'specific_skills_tools', text: "Any specific tools, languages, or skills you MUST learn? (Optional - Separate with commas)", type: 'text_input', optional: true },
  { id: 'preferred_platform', text: "Do you have a preferred learning platform? (Optional)", options: [ { label: "No preference", value: "any" }, { label: "Udemy", value: "Udemy" }, { label: "Coursera", value: "Coursera" }, { label: "edX", value: "edX" }, { label: "Udacity", value: "Udacity" }, { label: "LinkedIn Learning", value: "LinkedIn Learning" }, { label: "Pluralsight", value: "Pluralsight" }, { label: "Skillshare", value: "Skillshare" }, { label: "Other", value: "other" } ], optional: true }
];

exports.getNextQuestion = async (req, res) => {
  try {
    const answers = req.body.answers || {};
    console.log("Received answers:", answers);

    let nextQuestion = null;
    for (const question of QUESTIONS) {
      if (answers[question.id]) continue;
      let dependenciesMet = true;
      if (question.dependsOn) {
        const depId = question.dependsOn.id;
        const depValue = question.dependsOn.value;
        const userAnswer = answers[depId];
        if (Array.isArray(depValue)) {
          if (!userAnswer || !depValue.includes(userAnswer)) dependenciesMet = false;
        } else {
          if (userAnswer !== depValue) dependenciesMet = false;
        }
      }
      if (dependenciesMet) {
        nextQuestion = question;
        break;
      }
    }

    if (nextQuestion) {
      return res.json({
        success: true,
        next_question: {
          id: nextQuestion.id,
          text: nextQuestion.text,
          options: nextQuestion.options || [],
          type: nextQuestion.type || 'multiple_choice',
          optional: nextQuestion.optional === true
        }
      });
    } else {
      return res.json({ success: true, next_question: null, message: "All questions answered" });
    }
  } catch (err) {
    console.error("❌ Error in getNextQuestion:", err);
    res.status(500).json({ success: false, message: "Server error getting next question", error: err.message });
  }
};
