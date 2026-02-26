import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Search, Sparkles, Zap, Target, BarChart } from "lucide-react";

const Home = () => {
  return (
    <div className="text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Hero Section */}
      <section className="min-h-[70vh] flex flex-col justify-center items-center text-center px-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-indigo-700 dark:text-indigo-300 drop-shadow-sm">
          Find, Compare & Master Courses Smarter 🎓
        </h1>
        <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-300 mb-8">
          Discover the best online courses tailored to your career goals using AI-powered insights, comparisons, and personalized paths from platforms worldwide.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/ai-search"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow hover:shadow-lg transition-all transform hover:scale-105"
          >
            Try AI Search <Search size={18} />
          </Link>
          <Link
            to="/smart-recommend"
            className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-200 px-6 py-3 rounded-lg font-medium flex items-center gap-2 border border-gray-300 dark:border-gray-600 shadow hover:shadow-lg transition-all transform hover:scale-105"
          >
            Smart Recommend <Sparkles size={18} />
          </Link>
        </div>
      </section>

      {/* How it Works / Benefits Section */}
      <section className="py-16 bg-white dark:bg-gray-800 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-indigo-700 dark:text-indigo-300">How CourseExpo Helps You</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
            Navigating the vast world of online courses can be overwhelming. CourseExpo uses AI to simplify your choices and accelerate your learning journey.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-6 bg-indigo-50 dark:bg-gray-700 rounded-xl shadow-sm transition-transform hover:scale-105">
              <Zap size={40} className="text-indigo-500 dark:text-indigo-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 dark:text-white">Intelligent Search</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Go beyond simple keywords. Our AI understands your learning goals to find truly relevant courses across multiple platforms.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-indigo-50 dark:bg-gray-700 rounded-xl shadow-sm transition-transform hover:scale-105">
              <Target size={40} className="text-indigo-500 dark:text-indigo-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 dark:text-white">Personalized Paths</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Answer a few questions and get a custom roadmap with course recommendations tailored to your skills and aspirations.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-indigo-50 dark:bg-gray-700 rounded-xl shadow-sm transition-transform hover:scale-105">
              <BarChart size={40} className="text-indigo-500 dark:text-indigo-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 dark:text-white">Data-Driven Comparison</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Compare courses side-by-side with AI-generated pros, cons, and summaries based on your preferences. Make informed decisions, faster.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-16 px-8 max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-center">
        <Link to="/trending" className="block bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow transform hover:scale-105">
          <TrendingUp className="mx-auto text-orange-500 dark:text-orange-400 mb-4" size={40} />
          <h3 className="text-xl font-semibold mb-2 dark:text-white">Trending Courses</h3>
          <p className="text-gray-600 dark:text-gray-400">See what’s popular and stay ahead of the curve.</p>
        </Link>

        <Link to="/compare" className="block bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow transform hover:scale-105">
          <BarChart className="mx-auto text-blue-500 dark:text-blue-400 mb-4" size={40} />
          <h3 className="text-xl font-semibold mb-2 dark:text-white">Compare Courses</h3>
          <p className="text-gray-600 dark:text-gray-400">Let AI analyze courses based on your needs.</p>
        </Link>

        <Link to="/career" className="block bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow transform hover:scale-105">
          <Target className="mx-auto text-green-500 dark:text-green-400 mb-4" size={40} />
          <h3 className="text-xl font-semibold mb-2 dark:text-white">AI Career Path</h3>
          <p className="text-gray-600 dark:text-gray-400">Get a personalized roadmap to achieve your career goals.</p>
        </Link>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600 text-white text-center px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Level Up Your Learning?</h2>
        <p className="text-lg mb-8 max-w-xl mx-auto">
          Join thousands of learners using CourseExpo to find the perfect courses and accelerate their careers.
        </p>
        <Link
          to="/register"
          className="bg-white text-indigo-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 flex items-center mx-auto w-fit gap-2 shadow hover:shadow-lg transition-all transform hover:scale-105"
        >
          Get Started <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
};

export default Home;
