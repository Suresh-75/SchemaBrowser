import React from "react";
import { Handle, Position } from "@xyflow/react";

const SchemaCards = ({ table, darkmode }) => {
  // Check if table object and its required properties exist
  console.log(table);
  const handleProfileRequest = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          schema: table.schema_name,
          table: table.table_name
        })
      });

      if (!response.ok) {
        const error = await response.json();
        alert("Error: " + error.error);
        return;
      }

      // Get the filename from Content-Disposition header (if present)
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${table.schema_name}_${table.table_name}_profile.html`;
      a.click();
      a.remove();
    } catch (error) {
      console.error("Profile generation failed:", error);
      alert("Failed to generate profile.");
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/table/csv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          schema: table.schema_name,
          table: table.table_name
        })
      });

      if (!response.ok) {
        const error = await response.json();
        alert("Error: " + error.error);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${table.schema_name}_${table.table_name}.csv`;
      a.click();
      a.remove();
    } catch (error) {
      console.error("CSV download failed:", error);
      alert("Failed to download CSV.");
    }
  };

  if (!table) {
    return (
      <div
        className={`rounded-2xl shadow-lg p-8 text-center border-2 border-dashed ${darkmode
            ? "bg-gray-800 text-red-400 border-red-400/50"
            : "bg-red-50 text-red-600 border-red-300"
          }`}
      >
        <div className="flex flex-col items-center gap-3">
          <svg
            className="w-12 h-12 opacity-60"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <p className="font-medium">
            Table information is incomplete or not found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl shadow-lg overflow-hidden w-[27rem] ring-1 ${darkmode
          ? "bg-gray-900 border-gray-700 ring-gray-600 text-gray-100"
          : "bg-white border-slate-200 ring-slate-200 text-slate-900"
        }`}
    >
      {/* Handles for ReactFlow */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className={`w-4 h-4 rounded-full z-10 border-2 ${
          darkmode
            ? "bg-indigo-500 border-indigo-300"
            : "bg-indigo-400 border-indigo-200"
        }`}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className={`w-4 h-4 rounded-full z-10 border-2 ${
          darkmode
            ? "bg-teal-500 border-teal-300"
            : "bg-teal-400 border-teal-200"
        }`}
      />

      {/* Table Header */}
      <div
        className={`px-6 py-5 ${
          darkmode ? "bg-indigo-600 text-white" : "bg-blue-500 text-white"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold truncate">{table.table_name}</h3>
          </div>

          {/* Table count badge */}
        </div>
      </div>

      {/* Attributes Section */}
      {table.attributes && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <div
                className={`p-2 rounded-lg ${
                  darkmode
                    ? "bg-gray-700 text-indigo-400"
                    : "bg-indigo-100 text-indigo-600"
                }`}
              >
                <svg
                  className="w-4 h-4"
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
              </div>
              Attributes
            </h4>
            <span
              className={`text-sm px-2 py-1 rounded-full font-medium ${
                darkmode
                  ? "bg-gray-700 text-gray-300"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {table.attributes.length}
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {table.attributes.map((attributeName, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    darkmode
                      ? "bg-gray-800 border border-gray-700"
                      : "bg-slate-50 border border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        darkmode ? "bg-emerald-400" : "bg-emerald-500"
                      }`}
                    />
                    <span className="font-medium text-sm">{attributeName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Metadata Section */}
      {(table.schema_name || table.table_id) && (
        <div
          className={`px-6 py-5 border-t ${
            darkmode
              ? "bg-gray-800 border-gray-700"
              : "bg-slate-50 border-slate-200"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <div
                className={`p-2 rounded-lg ${
                  darkmode
                    ? "bg-gray-700 text-blue-400"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                <svg
                  className="w-4 h-4"
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
              </div>
              Metadata
            </h4>

            <div className="flex gap-2">
              <button
                onClick={handleProfileRequest}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium shadow ${
                  darkmode
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                    : "bg-indigo-100 hover:bg-indigo-200 text-indigo-800"
                }`}
              >
                Generate Profile
              </button>
              <button
                onClick={handleDownloadCSV}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium shadow ${
                  darkmode
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-emerald-100 hover:bg-emerald-200 text-emerald-800"
                }`}
              >
                Download CSV
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {table.table_id && (
              <div
                className={`p-3 rounded-lg ${
                  darkmode ? "bg-gray-700" : "bg-white"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <svg
                    className={`w-4 h-4 ${
                      darkmode ? "text-gray-400" : "text-gray-500"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <span className="font-semibold text-sm">Table ID</span>
                </div>
                <span
                  className={`text-sm font-mono ${
                    darkmode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {table.table_id}
                </span>
              </div>
            )}

            {table.schema_name && (
              <div
                className={`p-3 rounded-lg ${
                  darkmode ? "bg-gray-700" : "bg-white"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <svg
                    className={`w-4 h-4 ${
                      darkmode ? "text-gray-400" : "text-gray-500"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <span className="font-semibold text-sm">Schema</span>
                </div>
                <span
                  className={`text-sm font-mono ${
                    darkmode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {table.schema_name}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemaCards;
