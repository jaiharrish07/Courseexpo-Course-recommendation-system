import React from 'react';

// This is a basic, styled footer component.
// You can change it later.

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-inner mt-12 py-6">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          © 2025 CourseGenie. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

// We will export it as a default to match your import statement
export default Footer;