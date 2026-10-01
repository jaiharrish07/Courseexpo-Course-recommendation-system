import { useState } from "react";
import { generateCareerPathAPI } from "../utils/api";
import Footer from "../components/Footer";
import { Loader2, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function CareerPath() {
  const [goal, setGoal] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [duration, setDuration] = useState("");
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!goal.trim()) {
      setError("Please enter your career goal.");
      return;
    }
    setLoading(true);
    setError("");
    setRoadmap(null);
    try {
      const res = await generateCareerPathAPI({
        goal,
        skill_level: skillLevel,
        duration_preference: duration,
      });
      if (res.data?.success) {
        setRoadmap(res.data.roadmap);
      } else {
        setError(res.data?.message || "Failed to generate roadmap");
      }
    } catch (err) {
      console.error(err);
      setError("Server error while generating career path");
    } finally {
      setLoading(false);
    }
  };

  const MarkdownRenderer = ({ children }) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        table: ({ node, ...props }) => (
          <table
            className="table-auto w-full border-collapse border border-gray-300 dark:border-gray-600 my-4"
            {...props}
          />
        ),
        thead: ({ node, ...props }) => (
          <thead className="bg-gray-100 dark:bg-gray-700" {...props} />
        ),
        th: ({ node, ...props }) => (
          <th
            className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold"
            {...props}
          />
        ),
        tbody: ({ node, ...props }) => <tbody {...props} />,
        tr: ({ node, ...props }) => (
          <tr
            className="border-b border-gray-200 dark:border-gray-700"
            {...props}
          />
        ),
        td: ({ node, ...props }) => (
          <td
            className="border border-gray-300 dark:border-gray-600 px-4 py-2"
            {...props}
          />
        ),
        h1: ({ node, ...props }) => (
          <h1 className="text-3xl font-bold mb-4" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-2xl font-semibold mt-6 mb-3" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />
        ),
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-outside space-y-2 mb-4 ml-5" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol
            className="list-decimal list-outside space-y-2 mb-4 ml-5"
            {...props}
          />
        ),
        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
        p: ({ node, ...props }) => (
          <p className="mb-4 leading-relaxed" {...props} />
        ),
        strong: ({ node, ...props }) => (
          <strong
            className="font-semibold text-indigo-500 dark:text-indigo-400"
            {...props}
          />
        ),
        a: ({ node, ...props }) => (
          <a
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto p-6 w-full flex-grow">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-2 text-center">
          AI Career Roadmap
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-10">
          Enter your goals and let our AI build a step-by-step learning path for
          you.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 mb-8 p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1" htmlFor="goal">
                Your Career Goal <span className="text-red-500">*</span>
              </label>
              <input
                id="goal"
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full mt-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Full Stack Developer"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1" htmlFor="skill">
                Current Skill Level (Optional)
              </label>
              <input
                id="skill"
                type="text"
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="w-full mt-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Beginner, Intermediate"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1" htmlFor="duration">
              Preferred Duration (Optional)
            </label>
            <input
              id="duration"
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full mt-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., 3 months, 1 year"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold flex items-center justify-center gap-2 transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
            {loading ? "Generating..." : "Generate Roadmap"}
          </button>
        </form>

        {loading && (
          <div className="text-center py-10">
            <Loader2 className="h-8 w-8 animate-spin inline-block text-indigo-500" />
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Generating your personalized roadmap...
            </p>
          </div>
        )}

        {error && <p className="text-center text-red-500 font-medium py-10">{error}</p>}

        {roadmap && !loading && (
          <div className="mt-12 p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
              Your Custom Roadmap
            </h2>
            <div className="prose prose-indigo dark:prose-invert max-w-none prose-sm sm:prose-base">
              <MarkdownRenderer>{roadmap}</MarkdownRenderer>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
