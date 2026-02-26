import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCourseById } from "../utils/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function CoursesDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getCourseById(id);
        if (res.data?.success && res.data.course) setCourse(res.data.course);
        else setError(res.data?.message || "Course not found.");
      } catch (err) {
        console.error(err);
        setError("Failed to load course.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (loading)
    return <div className="text-center mt-20 text-gray-600 dark:text-gray-300">Loading...</div>;
  if (error)
    return <div className="text-center mt-20 text-red-500">{error}</div>;
  if (!course) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Instructor: {course.instructor_name || "Unknown"}
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Duration: {course.duration_hours ? `${course.duration_hours} hours` : "N/A"}
        </p>
        {course.category && (
          <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-sm mb-4">
            {course.category}
          </span>
        )}
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          {course.description || "No description available."}
        </p>
        <div className="flex items-center gap-4 flex-wrap">
          {course.url && (
            <a
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Go to Course
            </a>
          )}
          {course.price != null && (
            <div className="text-lg font-semibold">
              Price:{" "}
              {course.discount_price != null ? (
                <>
                  <span className="line-through text-gray-400 dark:text-gray-500 mr-2">
                    ${course.price}
                  </span>
                  <span className="text-green-600 dark:text-green-400">
                    ${course.discount_price}
                  </span>
                </>
              ) : (
                <span>${course.price}</span>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
