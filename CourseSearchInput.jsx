import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { Loader2, X, Search } from "lucide-react";
import useConstant from "use-constant"; 
import { debounce } from "lodash"; 

const CourseSearchInput = ({ selectedCourse, onSelect, placeholder }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchCourses = async (searchQuery) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/courses/search?q=${searchQuery}`);
      if (res.data.success) {
        setResults(res.data.courses || []);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Course search failed:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useConstant(() => debounce(searchCourses, 300));

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleSelect = (course) => {
    onSelect(course);
    setQuery("");
    setResults([]);
  };
  
  const handleClear = () => {
    onSelect(null);
    setQuery("");
    setResults([]);
  }

  if (selectedCourse) {
    return (
      <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900 border border-indigo-300 dark:border-indigo-700 flex items-center justify-between">
        <span className="text-indigo-800 dark:text-indigo-200 font-medium line-clamp-1">
          {selectedCourse.title}
        </span>
        <button type="button" onClick={handleClear} className="ml-2 text-indigo-600 dark:text-indigo-300 hover:text-red-500 dark:hover:text-red-400">
          <X size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || "Search for a course..."}
          className="w-full p-3 pl-10 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
        </span>
      </div>

      {results.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((course) => (
            <li
              key={course.id}
              onClick={() => handleSelect(course)}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            >
              <p className="font-medium dark:text-gray-200">{course.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{course.platform}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CourseSearchInput;
