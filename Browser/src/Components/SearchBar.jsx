import React, { useState, useEffect } from "react";
import { endpoints } from '../api';

const typeOrder = ["LOB", "Subject Area", "Database", "Table"];
const typeOptions = [
  { label: "LOB", value: "LOB" },
  { label: "Subject Area", value: "Subject Area" },
  { label: "Database", value: "Database" },
  { label: "Table", value: "Table" },
];

const SearchBar = ({ onSelect, darkmode }) => {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(typeOptions.map((opt) => opt.value)); // All selected by default

  useEffect(() => {
    if (query.length === 0) {
      setResults([]);
      return;
    }
    setLoading(true);
    endpoints.search(query)
      .then((res) => {
        setResults(res.data);
        setLoading(false);
      })
      .catch(() => setResults([]));
  }, [query]);

  // Filter results based on selected types
  const filteredResults = results.filter((item) => filters.includes(item.type));

  // Group results by type for better organization
  const groupedResults = filteredResults.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  const mapResultToSelectedPath = (item) => {
    switch (item.type) {
      case "LOB":
        return { lob: item.name, subject: null, database: null, table: null };
      case "Subject Area":
        return {
          lob: item.lob,
          subject: item.name,
          database: null,
          table: null,
        };
      case "Database":
        return {
          lob: item.lob,
          subject: item.subject,
          database: item.name,
          table: null,
        };
      case "Table":
        return {
          lob: item.lob,
          subject: item.subject,
          database: item.database,
          table: item.name,
        };
      default:
        return { lob: null, subject: null, database: null, table: null };
    }
  };

  return (
    <div
      className={`w-full rounded-xl px-3 py-2 border-b relative z-10 ${darkmode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
        }`}
    >
      {/* Filter Bar */}
      <div className="flex gap-4 mb-2">
        {typeOptions.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-center gap-2 text-xs cursor-pointer select-none ${darkmode ? "text-gray-300" : "text-gray-700"
              }`}
          >
            <span className="relative flex items-center">
              <input
                type="checkbox"
                checked={filters.includes(opt.value)}
                onChange={() => {
                  setFilters((filters) =>
                    filters.includes(opt.value)
                      ? filters.filter((f) => f !== opt.value)
                      : [...filters, opt.value]
                  );
                }}
                className="peer appearance-none h-4 w-4 border rounded-md transition-colors duration-150
                  focus:outline-none focus:ring-2 focus:ring-offset-1
                  disabled:opacity-50
                  checked:bg-blue-600 checked:border-blue-600
                  dark:checked:bg-blue-500 dark:checked:border-blue-500
                  border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-700
                  focus:ring-blue-400 dark:focus:ring-blue-500
                  hover:border-blue-400 dark:hover:border-blue-400
                  "
              />
              <span
                className={`
                  pointer-events-none absolute left-0 top-0 h-4 w-4 flex items-center justify-center
                  text-white transition-opacity duration-150
                  ${filters.includes(opt.value) ? "opacity-100" : "opacity-0"}
                `}
              >
                {/* Checkmark SVG */}
                <svg
                  className="h-3 w-3"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3.5 8.5 7 12 13 5" />
                </svg>
              </span>
            </span>
            <span className="font-medium">{opt.label}</span>
          </label>
        ))}
      </div>

      <input
        type="text"
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${darkmode
          ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-400 focus:border-blue-400"
          }`}
        placeholder="Search LOB, Subject Area, Database, or Table..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
      />

      {focused && loading && (
        <div
          className={`absolute left-6 right-6 mt-2 border rounded-lg shadow-lg z-50 px-4 py-3 ${darkmode
            ? "bg-gray-800 border-gray-600"
            : "bg-white border-gray-200"
            }`}
        >
          <div
            className={`text-center ${darkmode ? "text-gray-400" : "text-gray-400"
              }`}
          >
            Searching...
          </div>
        </div>
      )}

      {focused && !loading && filteredResults.length > 0 && (
        <div
          className={`absolute left-6 right-6 mt-2 border rounded-lg shadow-xl max-h-80 overflow-auto z-50 ${darkmode
            ? "bg-gray-800 border-gray-600"
            : "bg-white border-gray-200"
            }`}
        >
          {typeOrder.map(
            (type) =>
              groupedResults[type] &&
              groupedResults[type].map((item, idx) => (
                <button
                  key={`${item.type}-${item.name}-${idx}`}
                  className={`w-full text-left px-4 py-2 transition-all duration-150 rounded-md ${hoveredIdx === `${type}-${idx}`
                    ? darkmode
                      ? "bg-blue-900 text-blue-200 scale-[1.01] shadow"
                      : "bg-blue-100 scale-[1.01] shadow"
                    : darkmode
                      ? "hover:bg-gray-700 text-gray-200"
                      : "hover:bg-blue-50 text-gray-900"
                    }`}
                  onMouseEnter={() => setHoveredIdx(`${type}-${idx}`)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => {
                    if (onSelect) {
                      onSelect(mapResultToSelectedPath(item));
                    }
                    setQuery("");
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span>
                      {item.name}
                      <span
                        className={`ml-2 text-xs ${darkmode ? "text-gray-400" : "text-gray-500"
                          }`}
                      >
                        ({item.type})
                      </span>
                    </span>
                  </div>
                </button>
              ))
          )}
        </div>
      )}

      {focused &&
        !loading &&
        query.length > 0 &&
        filteredResults.length === 0 && (
          <div
            className={`absolute left-6 right-6 mt-2 border rounded-lg shadow-lg z-50 px-4 py-3 ${darkmode
              ? "bg-gray-800 border-gray-600"
              : "bg-white border-gray-200"
              }`}
          >
            <div
              className={`text-center ${darkmode ? "text-gray-400" : "text-gray-500"
                }`}
            >
              <div className="text-sm font-medium">No results found</div>
              <div className="text-xs mt-1">
                Try searching for a different term
              </div>
            </div>
          </div>
        )}

      {focused && query.length === 0 && (
        <div
          className={`absolute left-6 right-6 mt-2 border rounded-lg shadow-lg z-50 px-4 py-3 ${darkmode
            ? "bg-gray-800 border-gray-600"
            : "bg-white border-gray-200"
            }`}
        >
          <div
            className={`text-center ${darkmode ? "text-gray-400" : "text-gray-400"
              }`}
          >
            <div className="text-sm">Start typing to search...</div>
            <div className="text-xs mt-1">
              Search across LOBs, Subject Areas, Databases, and Tables
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
