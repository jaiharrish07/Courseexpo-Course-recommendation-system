import { useState } from "react";
import api from "../utils/api";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { Loader2, Search, Award, Info } from "lucide-react";

export default function AISearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setError("");
    try {
      const res = await api.post(`/ai-search`, { query: query });
      if (res.data?.success) setResults(res.data.results || []);
      else setResults([]);
    } catch (err) {
      console.error("AI Search Error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch AI search results. Please try again later."
      );
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getCertificationText = (course) => {
    if (!course.certification) return null;
    if (course.certification_included) {
      return (
        <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs sm:text-sm">
          <Award size={14} /> Certificate Included
        </span>
      );
    } else {
      return (
        <span
          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs sm:text-sm"
          title="Certificate may require separate payment or upgrade"
        >
          <Award size={14} /> Certificate Available*
        </span>
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 flex-grow w-full">
        <form
          onSubmit={handleSearch}
          className="flex gap-2 mb-8 max-w-2xl mx-auto"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses using AI (e.g., 'best python courses for data science')"
            className="flex-1 px-4 py-3 rounded-lg border bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm sm:text-base"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-4 sm:px-5 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center shadow-sm text-sm sm:text-base"
          >
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Search size={20} className="mr-1 hidden sm:inline" />
            )}
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {loading && (
          <div className="text-center py-10">
            <Loader2 className="h-8 w-8 animate-spin inline-block text-indigo-500" />
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Searching with AI...
            </p>
          </div>
        )}
        {error && (
          <p className="text-center text-red-500 font-medium py-10 px-4">
            {error}
          </p>
        )}
        {!loading && !error && results.length === 0 && hasSearched && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-10 px-4">
            No results found for your query. Try searching for something else!
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {results.map((course) => (
            <div
              key={course.id}
              className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 shadow hover:shadow-lg transition flex flex-col transform hover:-translate-y-1"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider line-clamp-1">
                  {course.platform || "N/A"}
                </p>
                <p
                  className={`text-base sm:text-lg font-semibold whitespace-nowrap ${
                    Number(course.price) === 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {course.price !== null && !isNaN(Number(course.price))
                    ? Number(course.price) === 0
                      ? "Free"
                      : `₹${Number(course.price).toLocaleString("en-IN")}`
                    : "Price N/A"}
                </p>
              </div>

              <h2 className="font-bold text-base sm:text-lg mb-2 text-indigo-700 dark:text-indigo-300 line-clamp-2 min-h-[2.5em] sm:min-h-[3em]">
                {course.title}
              </h2>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300 min-h-[2.5em] sm:min-h-[1.5em] gap-1">
                <span className="line-clamp-1">
                  Category: {course.category || "Uncategorized"}
                </span>
                {getCertificationText(course)}
              </div>

              <div className="text-xs sm:text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-md mb-4 flex-grow min-h-[70px]">
                <p className="font-medium text-indigo-600 dark:text-indigo-400 mb-1">
                  AI Score:{" "}
                  <span className="text-base sm:text-lg">
                    {course.ai_score ?? "N/A"}
                  </span>
                </p>
                <p className="text-gray-700 dark:text-gray-300 italic line-clamp-3">
                  Reason: <span>{course.ai_reason || "N/A"}</span>
                </p>
              </div>

              <a
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center w-full mt-auto px-4 py-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors font-medium text-sm sm:text-base"
                onClick={(e) => !course.url && e.preventDefault()}
                style={{
                  opacity: course.url ? 1 : 0.5,
                  cursor: course.url ? "pointer" : "not-allowed",
                }}
              >
                {course.url ? "View Course" : "Link N/A"}
              </a>
            </div>
          ))}
        </div>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-8 italic">
          *Certificate Available may require separate payment or platform
          subscription/upgrade. Check course details.
        </p>
      </div>
      <Footer />
    </div>
  );
}
