import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { Flame, Star, TrendingUp, Loader2 } from "lucide-react";

const Trending = () => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const response = await api.get("/trending");
        if (response.data.success) {
          setTrending(response.data.trending || []);
        } else {
          setError("Failed to load trending courses.");
        }
      } catch (err) {
        console.error(err);
        setError("Error connecting to server.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2 flex justify-center items-center gap-2 text-orange-600 dark:text-orange-400">
          <Flame size={32} /> Top Trending Courses
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover what’s hot right now — updated dynamically based on enrollments and ratings.
        </p>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin text-orange-500" size={36} />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <p className="text-center text-red-500 font-semibold mt-4">{error}</p>
      )}

      {/* Trending List */}
      {!loading && trending.length > 0 && (
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trending.map((course, index) => (
            <div
              key={course.id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-transparent hover:border-orange-500"
            >
              {/* Rank Badge */}
              <div className="flex justify-between items-center mb-3">
                <span className="flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400">
                  <TrendingUp size={16} /> Rank #{index + 1}
                </span>
                {index === 0 && (
                  <span className="text-yellow-500 font-bold text-lg">🏆</span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-300 mb-2 line-clamp-2">
                {course.title}
              </h3>

              {/* Category */}
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {course.category || "Uncategorized"}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-1 text-yellow-500 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < Math.round(Number(course.rating || 0)) ? "currentColor" : "none"}
                  />
                ))}
                <span className="text-sm text-gray-700 dark:text-gray-300 ml-1">
                  {Number(course.rating || 0).toFixed(1)} ({course.rating_count} reviews)
                </span>
              </div>

              {/* Price + Certification */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {course.price > 0 ? `₹${course.price}` : "Free"}
                </span>
                {course.certification && (
                  <span className="text-xs bg-green-100 dark:bg-green-700 text-green-700 dark:text-green-200 px-3 py-1 rounded-full">
                    Certified
                  </span>
                )}
              </div>

              {/* Enrollments */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Recent Enrollments:{" "}
                <span className="font-semibold text-orange-600 dark:text-orange-400">
                  {course.recent_enrollments || 0}
                </span>
              </p>

              {/* Link */}
              {course.url && (
                <a
                  href={course.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block mt-3 text-center bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  View Course
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Trending;
