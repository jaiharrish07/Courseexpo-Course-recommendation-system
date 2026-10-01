import React, { useState } from "react";
import api from "../utils/api";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import CourseSearchInput from "../components/CourseSearchInput";

const Compare = () => {
  const [course1, setCourse1] = useState(null);
  const [course2, setCourse2] = useState(null);
  const [preferences, setPreferences] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!course1 || !course2) {
      setError("Please select two courses to compare.");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    try {
      let prefObj = {};
      if (preferences.trim()) {
        try {
          prefObj = JSON.parse(preferences);
        } catch {
          throw new Error("Invalid JSON in preferences field.");
        }
      }

      const response = await api.post("/compare", {
        course_ids: [Number(course1.id), Number(course2.id)],
        preferences: prefObj,
      });

      if (response.data.success) {
        // Map titles back to the AI results using ID matching
        const merged = response.data.comparison.map((res) => {
          const match = [course1, course2].find(c => Number(c.id) === Number(res.id));
          return { ...res, title: match ? match.title : "Unknown Course" };
        });
        setResults(merged);
      } else {
        setError(response.data.message || "Comparison failed.");
      }
    } catch (err) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-10 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3 text-indigo-600 flex items-center justify-center gap-2">
          <Sparkles size={32} /> AI Comparison
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Select two courses to analyze side-by-side.</p>
      </div>

      <form onSubmit={handleCompare} className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <CourseSearchInput selectedCourse={course1} onSelect={setCourse1} placeholder="Search Course 1" />
          <CourseSearchInput selectedCourse={course2} onSelect={setCourse2} placeholder="Search Course 2" />
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium">Add Context (JSON Optional):</label>
          <textarea
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder='e.g. {"goal": "career change", "focus": "practical projects"}'
            className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
            rows="3"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !course1 || !course2}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
          {loading ? "AI Analyzing..." : "Compare Now"}
        </button>
      </form>

      {error && <p className="text-center text-red-500 mt-6">{error}</p>}

      {results.length > 0 && (
        <div className="mt-12 max-w-5xl mx-auto grid md:grid-cols-2 gap-6 pb-20">
          {results.map((course) => (
            <div key={course.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border-t-4 border-indigo-500">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-indigo-600 line-clamp-2">{course.title}</h3>
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                  Score: {course.score}
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-green-600 font-bold text-sm uppercase">Pros</h4>
                  <ul className="text-sm list-disc pl-5 text-gray-700 dark:text-gray-300">
                    {course.pros.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="text-red-600 font-bold text-sm uppercase">Cons</h4>
                  <ul className="text-sm list-disc pl-5 text-gray-700 dark:text-gray-300">
                    {course.cons.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
                <p className="italic text-gray-500 border-t pt-4 text-sm">"{course.summary}"</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Compare;