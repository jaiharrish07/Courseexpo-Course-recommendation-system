import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRecommendations } from "../utils/api";

export default function Recommendations() {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecs = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getRecommendations();
        if (res.data?.recommendations) setRecs(res.data.recommendations);
        else setError("No recommendations available.");
      } catch (err) {
        console.error(err);
        setError("Failed to load recommendations.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  if (loading)
    return <p className="p-8 text-center dark:text-gray-200">Loading recommendations...</p>;

  if (error)
    return <p className="p-8 text-center text-red-500">{error}</p>;

  if (!recs.length)
    return <p className="p-8 text-center dark:text-gray-200">No recommendations available.</p>;

  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recs.map((course) => (
        <div
          key={course.id}
          className="border rounded p-4 shadow hover:shadow-lg transition"
        >
          <h2 className="font-bold text-xl mb-2">{course.title}</h2>
          <p className="text-gray-600 mb-2">{course.category || "N/A"}</p>
          <p className="text-gray-700 mb-2">
            Combined Score: {course.combined_score ?? "N/A"}
          </p>
          <p className="text-gray-700 mb-2">AI Reason: {course.ai_reason || "N/A"}</p>
          <Link
            to={`/courses/${course.id}`}
            className="text-blue-600 hover:underline"
          >
            View Details
          </Link>
        </div>
      ))}
    </div>
  );
}
