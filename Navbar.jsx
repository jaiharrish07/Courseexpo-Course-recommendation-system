import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Sun, Moon, Menu, X, ChevronDown } from "lucide-react";

const Navbar = () => {
  const [theme, setTheme] = useState("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    if (token) {
      const name = localStorage.getItem("userName") || "User";
      setUserName(name);
    }

    const storedTheme = localStorage.getItem("theme");
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = storedTheme || (prefersDark ? "dark" : "light");

    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", newTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setIsAuthenticated(false);
    setUserName("");
    setMenuOpen(false);
    navigate("/login");
  };

  const allLinks = [
    { name: "Home", path: "/", authRequired: false },
    { name: "AI Search", path: "/ai-search", authRequired: false },
    { name: "Smart Recommend", path: "/smart-recommend", authRequired: true },
    { name: "Trending", path: "/trending", authRequired: false },
    { name: "Compare", path: "/compare", authRequired: true },
    { name: "Career Path", path: "/career", authRequired: true },
  ];

  const visibleLinks = allLinks.filter(
    (link) => !link.authRequired || isAuthenticated
  );

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <NavLink
          to="/"
          className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0"
        >
          Course<span className="text-gray-800 dark:text-gray-200">Expo</span>
        </NavLink>

        <div className="hidden md:flex items-center space-x-6">
          {visibleLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-500"
                    : "text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="p-1 rounded-full text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                  <span>{userName}</span>
                  <ChevronDown size={16} />
                </button>
                <div className="absolute right-0 mt-2 w-40 origin-top-right bg-white dark:bg-gray-800 shadow-lg rounded-md ring-1 ring-black ring-opacity-5 py-1 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 invisible group-hover:visible group-hover:pointer-events-auto focus:outline-none transition-all duration-150 ease-in-out z-50">
                  <NavLink
                    to="/profile"
                    className="block w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Profile
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <NavLink
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm font-medium"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  Register
                </NavLink>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-1 rounded-md text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div
          className={`${
            menuOpen ? "translate-x-0 shadow-xl" : "translate-x-full"
          } fixed inset-y-0 right-0 z-40 w-full max-w-xs sm:max-w-sm bg-white dark:bg-gray-900 p-6 transition-transform duration-300 ease-in-out md:hidden`}
        >
          <button
            className="absolute top-4 right-4 p-1 rounded-md text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>

          <nav className="flex flex-col space-y-4 mt-10">
            {visibleLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `block py-2 px-3 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-semibold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`
                }
                onClick={() => setMenuOpen(false)}
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6 space-y-4">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/profile"
                  className="block py-2 px-3 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile ({userName})
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="w-full text-left block py-2 px-3 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="block py-2 px-3 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-center text-base font-semibold transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>

        {menuOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          ></div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
