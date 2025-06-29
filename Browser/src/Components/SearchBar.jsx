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
      const subjectObj = businessData[lob][subject];
      const databases = subjectObj.databases || [];
      const tables = subjectObj.tables || [];
      // Add databases
      for (const db of databases) {
        results.push({
          type: "Database",
          name: db,
          path: { lob, subject, database: db, table: null },
          granularity: "Database",
          breadcrumb: `${lob} > ${subject} > ${db}`,
        });
        // Add tables under each database
        for (const table of tables) {
          results.push({
            type: "Table",
            name: table,
            path: { lob, subject, database: db, table },
            granularity: "Table",
            breadcrumb: `${lob} > ${subject} > ${db} > ${table}`,
          });
        }
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
      ? allItems.filter(
          (item) =>
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.breadcrumb.toLowerCase().includes(query.toLowerCase())
        )
      : [];

  // Group results by type for better organization
  const groupedResults = filtered.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {});

  const typeOrder = ["LOB", "Subject Area", "Database", "Table"];
  // const typeColors = {
  //   LOB: "bg-blue-50 text-blue-700 border-blue-200",
  //   "Subject Area": "bg-green-50 text-green-700 border-green-200",
  //   Database: "bg-purple-50 text-purple-700 border-purple-200",
  //   Table: "bg-orange-50 text-orange-700 border-orange-200",
  // };

  return (
    <div className="w-full px-3 rounded-2xl shadow-2xs py-2 bg-white border-b border-gray-100 relative z-10">
      <input
        type="text"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        placeholder="Search LOB, Subject Area, Database, or Table..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
      />

      {focused && filtered.length > 0 && (
        <div className="absolute left-6 overflow-x-hidden right-6 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-auto z-50">
          {typeOrder.map(
            (type) =>
              groupedResults[type] &&
              groupedResults[type].map((item, idx) => (
                <button
                  key={item.type + item.name + idx}
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
                    <span className="text-xs text-gray-400">
                      {item.granularity}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.breadcrumb}
                  </div>
                </button>
              ))
          )}
        </div>
      )}

      {focused && query.length > 0 && filtered.length === 0 && (
        <div className="absolute left-6 right-6 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 px-4 py-3">
          <div className="text-center text-gray-500">
            <div className="text-sm font-medium">No results found</div>
            <div className="text-xs mt-1">
              Try searching for a different term
            </div>
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
