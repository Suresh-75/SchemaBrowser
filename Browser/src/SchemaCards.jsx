import React from "react";
import { Handle, Position } from "@xyflow/react";

const SimpleTableCard = ({ table }) => {
  if (!table) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-red-600">
        Table info not found.
      </div>
    );
  }

  // Make all types blue
  const getTypeColor = (type) => {
    return "bg-blue-100 text-blue-800";
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 border border-slate-200 overflow-hidden max-w-md ring-1 ring-slate-100">
      {/* Handles for ReactFlow */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className="w-3 h-3 bg-blue-500 rounded-full"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className="w-3 h-3 bg-green-500 rounded-full"
      />

      {/* Table Header */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-800 px-6 py-5">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white tracking-wide drop-shadow">
            {table.name}
          </h3>
          {table.rowCount && (
            <span className="bg-slate-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
              {table.rowCount} rows
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-4">
          <span className="text-xs text-blue-200 bg-slate-700 px-2 py-1 rounded">
            <strong>DB:</strong> {table.database_name}
          </span>
          <span className="text-xs text-blue-200 bg-slate-700 px-2 py-1 rounded">
            <strong>ID:</strong> {table.id}
          </span>
        </div>
      </div>

      {/* Columns */}
      <div className="p-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="space-y-3">
          {Array.isArray(table.columns) && table.columns.length > 0 ? (
            table.columns.map((column, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-100 hover:bg-blue-50 transition-colors duration-200 shadow-sm"
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
                    <span className="font-semibold text-slate-800 tracking-wide">
                      {column.name}
                    </span>
                  </div>
                  {!column.nullable && (
                    <span className="text-blue-700 text-xs font-bold bg-blue-100 px-2 py-0.5 rounded">
                      NOT NULL
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-semibold border border-blue-200 shadow-sm ${getTypeColor(
                      column.type
                    )}`}
                  >
                    {column.type}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-slate-400 text-sm">No columns found.</div>
          )}
        </div>

        {/* Foreign Key References */}
        {Array.isArray(table.columns) &&
          table.columns.some((col) => col.foreignKey) && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-blue-400"
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
                    <div key={index} className="text-xs text-slate-600 pl-2">
                      <span className="font-semibold text-blue-700">
                        {col.name}
                      </span>
                      <span className="mx-1 text-slate-400">→</span>
                      <span className="font-mono text-slate-700">
                        {col.foreignKey.table}
                      </span>
                      <span className="text-slate-400">.</span>
                      <span className="font-mono text-slate-700">
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

export default SimpleTableCard;
