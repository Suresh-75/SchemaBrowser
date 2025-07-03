import React, { useState, useEffect } from "react";

const typeOrder = ["LOB", "Subject Area", "Database", "Table"];
const typeOptions = [
  { label: "LOB", value: "LOB" },
  { label: "Subject Area", value: "Subject Area" },
  { label: "Database", value: "Database" },
  { label: "Table", value: "Table" },
];

const SearchBar = ({ onSelect }) => {
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
    fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data);
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

  return (
    <div className="w-full px-6 py-2 bg-white border-b border-gray-100 relative z-10">
      {/* Filter Bar */}
      <div className="flex gap-4 mb-2">
        {typeOptions.map((opt) => (
          <label key={opt.value} className="flex items-center gap-1 text-xs">
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
            />
            {opt.label}
          </label>
        ))}
      </div>

      <input
        type="text"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        placeholder="Search LOB, Subject Area, Database, or Table..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
      />

      {focused && loading && (
        <div className="absolute left-6 right-6 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 px-4 py-3">
          <div className="text-center text-gray-400">Searching...</div>
        </div>
      )}

      {focused && !loading && filteredResults.length > 0 && (
        <div className="absolute left-6 right-6 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-auto z-50">
          {typeOrder.map(
            (type) =>
              groupedResults[type] &&
              groupedResults[type].map((item, idx) => (
                <button
                  key={`${item.type}-${item.name}-${idx}`}
                  className={`w-full text-left px-4 py-2 transition-all duration-150
                    ${
                      hoveredIdx === `${type}-${idx}`
                        ? "bg-blue-100 scale-[1.01] shadow"
                        : "hover:bg-blue-50"
                    }
                    rounded-md`}
                  onMouseEnter={() => setHoveredIdx(`${type}-${idx}`)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => {
                    console.log(item)
                    onSelect && onSelect(item);
                    setQuery("");
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span>
                      {item.name}
                      <span className="ml-2 text-xs text-gray-500">
                        ({item.type})
                      </span>
                    </span>
                  </div>
                </button>
              ))
          )}
        </div>
      )}

      {focused && !loading && query.length > 0 && filteredResults.length === 0 && (
        <div className="absolute left-6 right-6 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 px-4 py-3">
          <div className="text-center text-gray-500">
            <div className="text-sm font-medium">No results found</div>
            <div className="text-xs mt-1">Try searching for a different term</div>
          </div>
        </div>
      )}

      {focused && query.length === 0 && (
        <div className="absolute left-6 right-6 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 px-4 py-3">
          <div className="text-center text-gray-400">
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