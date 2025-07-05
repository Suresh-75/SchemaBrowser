import React from "react";
import { Handle, Position } from "@xyflow/react";

const SchemaCards = ({ table, darkmode }) => {
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

  const getTypeColor = (type) => {
    return darkmode ? "bg-blue-800 text-blue-100" : "bg-blue-100 text-blue-800";
  };

  return (
    <div
      className={`rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden max-w-md ring-1 ${
        darkmode
          ? "bg-gray-900 hover:shadow-3xl-dark border-gray-700 ring-gray-700 text-gray-100"
          : "bg-white hover:shadow-3xl border-slate-200 ring-slate-100 text-slate-900"
      }`}
    >
      {/* Handles for ReactFlow */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className={`w-5 h-5 rounded-full z-10 ${
          darkmode ? "bg-indigo-500" : "bg-indigo-400"
        }`}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className={`w-5 h-5 rounded-full z-10 ${
          darkmode ? "bg-teal-500" : "bg-teal-400"
        }`}
      />

      {/* Table Header */}
      <div
        className={`px-6 py-5 flex items-center justify-between ${
          darkmode
            ? "bg-gradient-to-r from-blue-700 to-indigo-700 text-white"
            : "bg-gradient-to-r from-blue-400 to-indigo-400 text-white"
        }`}
      >
        <h3 className="text-xl font-bold truncate">
          {table.table_name || "Unknown Table"}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            darkmode ? "bg-blue-900 text-blue-200" : "bg-blue-300 text-blue-900"
          }`}
        >
          {table.type || "Table"}
        </span>
      </div>

      {/* Table Description/Comment */}
      {table.comment && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm italic opacity-80">{table.comment}</p>
        </div>
      )}

      {/* Table Columns/Schema */}
      {table.columns && table.columns.length > 0 && (
        <div className="p-6 max-h-60 overflow-y-auto custom-scrollbar">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg
              className={`w-5 h-5 ${
                darkmode ? "text-indigo-400" : "text-indigo-600"
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
            Columns
          </h4>
          <ul className="space-y-3">
            {table.columns.map((col, index) => (
              <li
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`font-medium ${
                      col.is_primary_key
                        ? "text-yellow-500 dark:text-yellow-400"
                        : ""
                    }`}
                  >
                    {col.name}
                  </span>
                  {col.is_primary_key && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        darkmode
                          ? "bg-yellow-800 text-yellow-100"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      PK
                    </span>
                  )}
                  {col.is_nullable && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        darkmode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      Nullable
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getTypeColor(
                    col.type
                  )}`}
                >
                  {col.type}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Table Metadata */}
      {table.input_format && (
        <div
          className={`p-6 border-t ring-1 ${
            darkmode
              ? "bg-gray-800 text-gray-100 ring-gray-700 border-gray-700"
              : "bg-slate-50 text-slate-800 ring-slate-200 border-slate-200"
          }`}
        >
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg
              className={`w-5 h-5 ${
                darkmode ? "text-blue-400" : "text-blue-600"
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 17v-6h13M9 7H5a2 2 0 00-2 2v9a2 2 0 002 2h4m13-6l-3-3m0 0l3-3m-3 3H9"
              />
            </svg>
            Table Metadata
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <li>
              <span className="font-semibold block">Input Format</span>
              <span className="italic opacity-90">{table.input_format}</span>
            </li>
            <li>
              <span className="font-semibold block">Output Format</span>
              <span className="italic opacity-90">{table.output_format}</span>
            </li>
            <li>
              <span className="font-semibold block">Partitioned By</span>
              <span className="italic opacity-90">
                {table.partitioned_by || "—"}
              </span>
            </li>
            <li className="col-span-2">
              <span className="font-semibold block">Location</span>
              <span className="italic break-words text-xs opacity-90">
                {table.location}
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SchemaCards;
