import { Link } from "react-router-dom";

export default function CourseCard({ course }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-4 flex flex-col justify-between h-full">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-1">{course.title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-300 mb-2">{course.instructor_name || "Unknown Instructor"}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Duration: {course.duration_hours ? `${course.duration_hours} hours` : "N/A"}
          </p>
          {course.category && (
            <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs mb-2">
              {course.category}
            </span>
          )}
          <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3 mb-2">
            {course.description || "No description available."}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            {course.discount_price != null ? (
              <div className="text-sm">
                <span className="line-through text-gray-400 dark:text-gray-500 mr-2">${course.price}</span>
                <span className="text-green-600 dark:text-green-400 font-semibold">${course.discount_price}</span>
              </div>
            ) : (
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">${course.price}</div>
            )}
          </div>
          <Link
            to={`/courses/${course.id}`}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
