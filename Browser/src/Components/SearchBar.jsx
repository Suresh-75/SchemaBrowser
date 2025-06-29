import React, { useState } from "react";

const flattenBusinessData = (businessData) => {
  const results = [];
  for (const lob in businessData) {
    results.push({
      type: "LOB",
      name: lob,
      path: { lob, subject: null, database: null, table: null },
      granularity: "Line of Business",
      breadcrumb: lob,
    });
    for (const subject in businessData[lob]) {
      results.push({
        type: "Subject Area",
        name: subject,
        path: { lob, subject, database: null, table: null },
        granularity: "Subject Area",
        breadcrumb: `${lob} > ${subject}`,
      });
      for (const database of businessData[lob][subject].databases) {
        results.push({
          type: "Database",
          name: database,
          path: { lob, subject, database, table: null },
          granularity: "Database",
          breadcrumb: `${lob} > ${subject} > ${database}`,
        });
      }
      for (const table of businessData[lob][subject].tables) {
        results.push({
          type: "Table",
          name: table,
          path: { lob, subject, database: null, table },
          granularity: "Table",
          breadcrumb: `${lob} > ${subject} > ${table}`,
        });
      }
    }
  }
  return results;
};

const SearchBar = ({ businessData, onSelect }) => {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const allItems = flattenBusinessData(businessData);

  const filtered =
    query.length > 0
      ? allItems.filter((item) =>
          item.name.toLowerCase().includes(query.toLowerCase())
        )
      : [];

  return (
    <div className="w-full rounded-2xl px-3 py-3 bg-gradient-to-r from-white via-blue-50 to-indigo-50 border border-indigo-100 shadow-md relative z-10">
      <div className="relative">
        <input
          type="text"
          className="w-full px-5 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-base transition-all placeholder-gray-400 bg-white"
          placeholder="🔍  Search LOB, Subject Area, Database, or Table..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
        />
        {query.length > 0 && (
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setQuery("")}
            tabIndex={-1}
            type="button"
          >
            ×
          </button>
        )}
      </div>
      {focused && filtered.length > 0 && (
        <div className="absolute left-0 overflow-x-hidden right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-72 overflow-auto z-10 animate-fade-in">
          {filtered.map((item, idx) => (
            <button
              key={item.type + item.name + idx}
              className={`w-full text-left px-5 py-3 transition-all duration-150 flex flex-col
                ${
                  hoveredIdx === idx
                    ? "bg-blue-100 scale-[1.01] shadow"
                    : "hover:bg-blue-50"
                }
                rounded-lg`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => {
                onSelect(item.path);
                setQuery("");
              }}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">
                  {item.name}
                  <span className="ml-2 text-xs text-gray-500 font-normal">
                    ({item.type})
                  </span>
                </span>
                <span className="text-xs text-indigo-400 font-semibold">
                  {item.granularity}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1 italic">
                {item.breadcrumb}
              </div>
            </button>
          ))}
        </div>
      )}
      {focused && query.length > 0 && filtered.length === 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-10 px-5 py-3 text-gray-400 text-center animate-fade-in">
          No results found.
        </div>
      )}
    </div>
  );
};

export default SearchBar;
