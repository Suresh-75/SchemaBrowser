import React from "react";
import { Handle, Position } from "@xyflow/react";

const SchemaCards = ({ table, darkmode }) => {
  // Accept darkmode prop
  console.log(table);
  console.log(darkmode);
  if (!table) {
    return (
      <div
        className={`rounded-xl shadow-lg p-6 text-red-600 ${
          darkmode ? "bg-gray-800 text-red-400" : "bg-white"
        }`}
      >
        Table info not found.
      </div>
    );
  }

  // Make all types blue (or a dark-mode friendly blue)
  const getTypeColor = (type) => {
    return darkmode ? "bg-blue-800 text-blue-100" : "bg-blue-100 text-blue-800";
  };

  return (
    <div
      className={`rounded-2xl shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden max-w-md ring-1 ${
        darkmode
          ? "bg-gray-800 hover:shadow-3xl-dark border-gray-700 ring-gray-700"
          : "bg-white hover:shadow-3xl border-slate-200 ring-slate-100"
      }`}
    >
      {/* Handles for ReactFlow */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className={`w-3 h-3 rounded-full ${
          darkmode ? "bg-blue-600" : "bg-blue-500"
        }`}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className={`w-3 h-3 rounded-full ${
          darkmode ? "bg-green-600" : "bg-green-500"
        }`}
      />

      {/* Table Header */}
      <div className={`px-6 py-5 ${darkmode ? "bg-blue-700" : "bg-blue-400"}`}>
        <div className="flex items-center justify-between">
          <h3
            className={`text-2xl font-bold tracking-wide drop-shadow ${
              darkmode ? "text-white" : "text-white"
            }`}
          >
            {table.name}
          </h3>
          {table.rowCount && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold shadow ${
                darkmode ? "bg-gray-600 text-white" : "bg-slate-700 text-white"
              }`}
            >
              {table.rowCount} rows
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-4">
          <span
            className={`text-xs px-2 py-1 rounded ${
              darkmode ? "bg-gray-200 text-gray-800" : "bg-white text-black"
            }`}
          >
            <strong>DB:</strong> {table.database_name}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded ${
              darkmode ? "bg-black text-white" : "bg-slate-800 text-white"
            }`}
          >
            <strong>Table ID : </strong> {table.id}
          </span>
        </div>
      </div>
      {/* Columns */}
      <div
        className={`p-6 ${
          darkmode
            ? "bg-gradient-to-b from-gray-700 to-gray-800"
            : "bg-gradient-to-b from-slate-50 to-white"
        }`}
      >
        <div className="space-y-3">
          {Array.isArray(table.columns) && table.columns.length > 0 ? (
            table.columns.map((column, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border shadow-sm transition-colors duration-200 ${
                  darkmode
                    ? "bg-gray-800 border-gray-700 hover:bg-gray-700"
                    : "bg-white border-slate-100 hover:bg-blue-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {column.primaryKey && (
                      <div
                        className="w-2 h-2 bg-yellow-400 rounded-full shadow"
                        title="Primary Key"
                      ></div>
                    )}
                    {column.foreignKey && (
                      <div
                        className="w-2 h-2 bg-blue-400 rounded-full shadow"
                        title="Foreign Key"
                      ></div>
                    )}
                    <span
                      className={`font-semibold tracking-wide ${
                        darkmode ? "text-gray-100" : "text-slate-800"
                      }`}
                    >
                      {column.name}
                    </span>
                  </div>
                  {!column.nullable && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        darkmode
                          ? "text-blue-200 bg-blue-700"
                          : "text-blue-700 bg-blue-100"
                      }`}
                    >
                      NOT NULL
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-semibold border shadow-sm ${getTypeColor(
                      column.type
                    )} ${darkmode ? "border-blue-600" : "border-blue-200"}`}
                  >
                    {column.type}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div
              className={`text-sm ${
                darkmode ? "text-gray-400" : "text-slate-400"
              }`}
            >
              No columns found.
            </div>
          )}
        </div>

        {/* Foreign Key References */}
        {Array.isArray(table.columns) &&
          table.columns.some((col) => col.foreignKey) && (
            <div
              className={`mt-6 pt-4 border-t ${
                darkmode ? "border-gray-600" : "border-slate-200"
              }`}
            >
              <h4
                className={`text-sm font-semibold mb-2 flex items-center gap-2 ${
                  darkmode ? "text-blue-400" : "text-blue-700"
                }`}
              >
                <svg
                  className={`w-4 h-4 ${
                    darkmode ? "text-blue-500" : "text-blue-400"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 17v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1"
                  ></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M23 21v-1a4 4 0 00-3-3.87"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 3.13a4 4 0 010 7.75"
                  ></path>
                </svg>
                Foreign Key References
              </h4>
              <div className="space-y-1">
                {table.columns
                  .filter((col) => col.foreignKey)
                  .map((col, index) => (
                    <div
                      key={index}
                      className={`text-xs pl-2 ${
                        darkmode ? "text-gray-300" : "text-slate-600"
                      }`}
                    >
                      <span
                        className={`font-semibold ${
                          darkmode ? "text-blue-400" : "text-blue-700"
                        }`}
                      >
                        {col.name}
                      </span>
                      <span
                        className={`mx-1 ${
                          darkmode ? "text-gray-500" : "text-slate-400"
                        }`}
                      >
                        →
                      </span>
                      <span
                        className={`font-mono ${
                          darkmode ? "text-gray-200" : "text-slate-700"
                        }`}
                      >
                        {col.foreignKey.table}
                      </span>
                      <span
                        className={`${
                          darkmode ? "text-gray-500" : "text-slate-400"
                        }`}
                      >
                        .
                      </span>
                      <span
                        className={`font-mono ${
                          darkmode ? "text-gray-200" : "text-slate-700"
                        }`}
                      >
                        {col.foreignKey.column}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default SchemaCards;
