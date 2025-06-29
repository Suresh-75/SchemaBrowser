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
    <div className="w-full px-6 py-2 bg-white border-b border-gray-100 relative z-10">
      <input
        type="text"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Search LOB, Subject Area, Database, or Table..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
      />
      {focused && filtered.length > 0 && (
        <div className="absolute left-6 right-6 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto z-50">
          {filtered.map((item, idx) => (
            <button
              key={item.type + item.name + idx}
              className={`w-full text-left px-4 py-2 transition-all duration-150
                ${
                  hoveredIdx === idx
                    ? "bg-blue-100 scale-[1.01] shadow"
                    : "hover:bg-blue-50"
                }
                rounded-md`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => {
                onSelect(item.path);
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
                <span className="text-xs text-gray-400">{item.granularity}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">{item.breadcrumb}</div>
            </button>
          ))}
        </div>
      )}
      {focused && query.length > 0 && filtered.length === 0 && (
        <div className="absolute left-6 right-6 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 px-4 py-2 text-gray-400">
          No results found.
        </div>
      )}
    </div>
  );
};

export default SearchBar;