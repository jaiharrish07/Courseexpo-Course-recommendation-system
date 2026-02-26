import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getNextQuestion, getSmartRecommendations } from "../utils/api";
import { Loader2, Star } from "lucide-react";

const CourseCard = ({ course }) => {
  const formatPrice = (price) => {
    if (price === null || isNaN(Number(price))) return "Price N/A";
    return Number(price) === 0 ? "Free" : `₹${Number(price).toLocaleString("en-IN")}`;
  };

  const renderStars = (rating) => {
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating <= 0) return <span className="text-xs text-gray-500">No rating</span>;
    const fullStars = Math.floor(numRating);
    const halfStar = numRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
      <div className="flex items-center" title={`${numRating.toFixed(1)} out of 5`}>
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={14} className="text-yellow-400 fill-current" />
        ))}
        {halfStar && <Star key="half" size={14} className="text-yellow-400" style={{ clipPath: "inset(0 50% 0 0)" }} />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={14} className="text-gray-300 dark:text-gray-600" />
        ))}
        {course.rating_count > 0 && <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">({course.rating_count})</span>}
      </div>
    );
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow bg-white dark:bg-gray-800 flex flex-col h-full transform hover:scale-[1.02] transition-transform">
      <div className="flex justify-between items-center mb-2">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider line-clamp-1">
          {course.platform || "N/A"}
        </p>
        <p
          className={`text-base font-semibold whitespace-nowrap ${
            Number(course.price) === 0 ? "text-green-600 dark:text-green-400" : "text-gray-800 dark:text-gray-200"
          }`}
        >
          {formatPrice(course.price)}
        </p>
      </div>
      <h3 className="font-bold text-base sm:text-lg mb-2 text-indigo-700 dark:text-indigo-300 line-clamp-2 min-h-[2.5em] sm:min-h-[3em]">
        {course.title || "Course Title"}
      </h3>
      <div className="mb-2">{renderStars(course.rating)}</div>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow line-clamp-3">
        {course.reason || "Recommended based on your preferences."}
      </p>
      {course.url && (
        <a
          href={course.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center w-full mt-auto px-4 py-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors font-medium text-sm"
        >
          View Course
        </a>
      )}
    </div>
  );
};

export default function SmartRecommend() {
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answers, setAnswers] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQuestionOrRecommendations({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchQuestionOrRecommendations = async (currentAnswers) => {
    setLoading(true);
    setError("");
    try {
      const res = await getNextQuestion(currentAnswers);
      if (res.data?.success && res.data.next_question) {
        console.log("Received next question:", res.data.next_question.id);
        setCurrentQuestion(res.data.next_question);
        setLoading(false);
      } else if (res.data?.success && res.data.next_question === null) {
        console.log("All questions answered, fetching recommendations...");
        setCurrentQuestion(null);
        fetchRecommendations(currentAnswers);
      } else {
        console.error("Unexpected response from getNextQuestion:", res.data);
        setError(res.data?.message || "Received an unexpected response.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Next question API error:", err);
      setError(err.response?.data?.message || "Failed to fetch next question.");
      setLoading(false);
    }
  };

  const fetchRecommendations = async (finalAnswers) => {
    setLoading(true);
    setError("");
    try {
      console.log("Fetching recommendations with answers:", finalAnswers);
      const res = await getSmartRecommendations(finalAnswers);
      if (res.data?.success && res.data.recommendations) {
        console.log("Received recommendations:", res.data.recommendations.length);
        setRecommendations(res.data.recommendations);
        setCurrentQuestion(null);
      } else {
        console.error("Failed to get recommendations:", res.data);
        setError(res.data?.message || "No recommendations found.");
        setRecommendations([]);
      }
    } catch (err) {
      console.error("Smart recommendations API error:", err);
      setError(err.response?.data?.message || "Failed to fetch recommendations.");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (value) => {
    if (!currentQuestion) return;
    const nextAnswers = { ...answers, [currentQuestion.id]: value };
    console.log(`Answered ${currentQuestion.id} with ${value}. New answers:`, nextAnswers);
    setAnswers(nextAnswers);
    fetchQuestionOrRecommendations(nextAnswers);
  };

  const handleTextInputChange = (e) => {
    if (!currentQuestion) return;
    if (error === "Please enter an answer before proceeding.") setError("");
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: e.target.value }));
  };

  const handleTextInputSubmit = () => {
    if (!currentQuestion || currentQuestion.type !== "text_input") return;
    const isOptional = currentQuestion.optional === true;
    const isEmpty = !answers[currentQuestion.id]?.trim();
    if (!isOptional && isEmpty) {
      setError("Please enter an answer before proceeding.");
      return;
    }
    setError("");
    const nextAnswers = { ...answers };
    if (isOptional && isEmpty) nextAnswers[currentQuestion.id] = null;
    console.log(`Submitting text answer for ${currentQuestion.id}. Answers:`, nextAnswers);
    fetchQuestionOrRecommendations(nextAnswers);
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4 min-h-[60vh]">
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-lg mt-20 dark:text-gray-200"
          >
            <Loader2 className="inline-block w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <p>Finding the next step...</p>
          </motion.div>
        )}

        {!loading && error && (
          <motion.p
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-red-500 mt-20 font-medium"
          >
            {error}
          </motion.p>
        )}

        {!loading && currentQuestion && !error && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
          >
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-gray-900 dark:text-white text-center">
              {currentQuestion.text}
            </h2>
            {currentQuestion.type === "text_input" ? (
              <div className="flex flex-col gap-3 items-center">
                <textarea
                  value={answers[currentQuestion.id] || ""}
                  onChange={handleTextInputChange}
                  placeholder="Enter skills/tools, separated by commas..."
                  className="w-full p-3 rounded-lg border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                />
                <motion.button
                  onClick={handleTextInputSubmit}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  className="mt-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Next
                </motion.button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {(currentQuestion.options || []).map((opt) => (
                  <motion.button
                    key={opt.value}
                    onClick={() => handleAnswer(opt.value)}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    className="p-3 w-full text-left rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {!loading && recommendations.length > 0 && !error && (
          <motion.div
            key="recommendations"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center dark:text-white">
              🎯 Smart Course Recommendations for You
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((course) => (
                <CourseCard key={course.id || course.title} course={course} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
