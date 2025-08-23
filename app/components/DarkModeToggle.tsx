"use client";

import { useState, useEffect } from "react";

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  // Check localStorage for theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") setDarkMode(true);
  }, []);

  // Apply theme class to body
  useEffect(() => {
    document.body.className = darkMode ? "dark" : "light";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
      <div className="toggle-container">
        <input
          type="checkbox"
          id="theme-toggle"
          className="toggle-checkbox"
          checked={darkMode}
          onChange={toggleTheme}
        />
        <label htmlFor="theme-toggle" className="toggle-label">
          <span className="toggle-slider">
            <span className="toggle-icon">
              {darkMode ? " " : " "}
            </span>
          </span>
        </label>
        <span className="toggle-text">
          {darkMode ? "Dark Mode" : "Light Mode"}
        </span>
      </div>

      <style jsx>{`
        .toggle-container {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .toggle-checkbox {
          display: none;
        }

        .toggle-label {
          position: relative;
          display: inline-block;
          width: 60px;
          height: 30px;
          background: ${darkMode ? '#4a5568' : '#e2e8f0'};
          border-radius: 30px;
          cursor: pointer;
          transition: background 0.3s ease;
          border: 2px solid ${darkMode ? '#2d3748' : '#cbd5e0'};
        }

        .toggle-slider {
          position: absolute;
<<<<<<< HEAD
          top: 3px;
=======
          top: 2px;
>>>>>>> main
          left: ${darkMode ? '28px' : '2px'};
          width: 24px;
          height: 24px;
          background: white;
          border-radius: 50%;
          transition: left 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .toggle-icon {
          font-size: 12px;
          line-height: 1;
        }

        .toggle-text {
          font-size: 14px;
          font-weight: 500;
          color: ${darkMode ? '#f7fafc' : '#2d3748'};
          user-select: none;
        }

        .toggle-label:hover {
          background: ${darkMode ? '#718096' : '#cbd5e0'};
        }

        .toggle-checkbox:focus + .toggle-label {
          outline: 2px solid #3182ce;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}