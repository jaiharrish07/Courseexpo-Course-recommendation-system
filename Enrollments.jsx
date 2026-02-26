import { useEffect, useState } from "react";
import { getUserEnrollments, updateProgressAPI } from "../utils/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchEnrollments() {
      setLoading(true);
      setError("");
      try {
        const res = await getUserEnrollments();
        if (res.data.success) setEnrollments(res.data.enrollments || []);
        else setError(res.data.message || "Failed to fetch enrollments");
      } catch (err) {
        console.error(err);
        setError("Server error while fetching enrollments");
      } finally {
        setLoading(false);
      }
    }

    fetchEnrollments();
  }, []);

  const handleProgressUpdate = async (id, progress) => {
    try {
      const res = await updateProgressAPI(id, progress);
      if (res.data.success) {
        setEnrollments(prev =>
          prev.map(e => (e.id === id ? res.data.enrollment : e))
        );
      } else {
        alert(res.data.message || "Failed to update progress");
      }
    } catch (err) {
      console.error(err);
      alert("Server error while updating progress");
    }
  };

  if (loading) return <Loader text="Loading your enrollments..." />;
  if (error) return <p className="text-center text-red-500 mt-20">{error}</p>;
  if (!enrollments.length) return <p className="text-center mt-20">No enrollments yet.</p>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">My Enrollments</h1>

        <div className="space-y-4">
          {enrollments.map(e => (
            <div
              key={e.id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition"
            >
              <h2 className="font-bold text-xl mb-1">{e.title}</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-1">
                Instructor: {e.instructor_name || "N/A"} | Duration: {e.duration_hours || "N/A"} hrs
              </p>
              <p className="mb-2">
                Completion: {e.completion_pct ?? 0}% | Status: {e.completion_status || "In-progress"}
              </p>

              <div className="flex space-x-2 mb-2">
                <button
                  onClick={() =>
                    handleProgressUpdate(e.id, {
                      completion_pct: Math.min((e.completion_pct || 0) + 10, 100),
                    })
                  }
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  +10%
                </button>
                <button
                  onClick={() =>
                    handleProgressUpdate(e.id, { completion_status: "Completed", completion_pct: 100 })
                  }
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Mark Complete
                </button>
              </div>

              {e.url && (
                <a
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Go to Course
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
