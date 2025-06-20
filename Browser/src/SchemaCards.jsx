import React from "react";
import { Handle, Position } from "@xyflow/react"; // Import Handle and Position for connections

const SimpleTableCard = ({ table }) => {
  const getTypeColor = (type) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("int") || lowerType.includes("number")) {
      return "bg-blue-100 text-blue-800";
    }
    if (
      lowerType.includes("string") ||
      lowerType.includes("varchar") ||
      lowerType.includes("text")
    ) {
      return "bg-green-100 text-green-800";
    }
    if (lowerType.includes("bool")) {
      return "bg-purple-100 text-purple-800";
    }
    if (lowerType.includes("date") || lowerType.includes("time")) {
      return "bg-orange-100 text-orange-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-200 overflow-hidden max-w-md">
      {/*
        Handles are placed directly inside the main div of the node.
        Their visual position is controlled by the 'position' prop,
        not their DOM order relative to other elements,
        so they won't disrupt your existing UI layout.
      */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className="w-3 h-3 bg-blue-500 rounded-full" // Optional: Add some styling to make handles visible during development
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className="w-3 h-3 bg-green-500 rounded-full" // Optional: Add some styling to make handles visible during development
      />

      {/* Table Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">{table.name}</h3>
          {table.rowCount && (
            <span className="bg-slate-600 text-white px-3 py-1 rounded-full text-sm">
              {table.rowCount} rows
            </span>
          )}
        </div>
      </div>

      {/* Columns */}
      <div className="p-6">
        <div className="space-y-3">
          {table.columns.map((column, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {column.primaryKey && (
                    <div
                      className="w-2 h-2 bg-yellow-400 rounded-full"
                      title="Primary Key"
                    ></div>
                  )}
                  {column.foreignKey && (
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full"
                      title="Foreign Key"
                    ></div>
                  )}
                  <span className="font-medium text-slate-800">
                    {column.name}
                  </span>
                </div>
                {!column.nullable && (
                  <span className="text-red-500 text-xs font-medium">
                    NOT NULL
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 rounded-md text-xs font-medium ${getTypeColor(
                    column.type
                  )}`}
                >
                  {column.type}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Foreign Key References */}
        {table.columns.some((col) => col.foreignKey) && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <h4 className="text-sm font-medium text-slate-600 mb-2">
              Foreign Key References
            </h4>
            <div className="space-y-1">
              {table.columns
                .filter((col) => col.foreignKey)
                .map((col, index) => (
                  <div key={index} className="text-xs text-slate-500">
                    {col.name} → {col.foreignKey.table}.{col.foreignKey.column}
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
