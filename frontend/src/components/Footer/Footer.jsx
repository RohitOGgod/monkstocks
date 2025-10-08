import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-200 dark:bg-gray-900 py-12">
      <div className="container px-8 sm:px-16 py-4 mx-auto">
        <div className="w-full">
          <div className="px-6">
            <div>
              <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white hover:text-gray-700 dark:hover:text-gray-300">MockStocks</Link>
            </div>
            <p className="max-w-md mt-2 text-gray-500 dark:text-gray-400">The trading platform for all.</p>
          </div>
        </div>

        <hr className="h-px my-6 bg-gray-300 border-none dark:bg-gray-700" />

        <div className="flex items-center justify-between">
          <p className="text-gray-800 dark:text-white">© MockStocks {new Date().getFullYear()}</p>
          <p className="text-gray-600 dark:text-gray-300 text-sm">by Rohit</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
