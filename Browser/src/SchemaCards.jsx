import React, { useState, useEffect } from "react";
import { Handle, Position } from "@xyflow/react";
import { ChevronDown, ChevronsDown, ChevronUp, Key, Link } from "lucide-react";

const SchemaCards = ({
  table,
  darkmode,
  selectedDatabase,
  setSelectedTable,
  setSelectedPath,
}) => {
  const [relationshipColumns, setRelationshipColumns] = useState([]);
  const [foreignKeyColumns, setForeignKeyColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleColumns = isExpanded
    ? table.attributes
    : table.attributes.slice(0, 5);
  const hasMoreColumns = table.attributes.length > 5;
  console.log(table.attributes);

  useEffect(() => {
    if (table && table.table_id && selectedDatabase) {
      fetchRelationshipColumns();
      fetchForeignKeyColumns();
    }
  }, [table, selectedDatabase]);

  const fetchRelationshipColumns = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/tables/${table.table_name}/primary-key`
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data);

        if (data.success) {
          // Extract primary key column names
          const primaryKeyColumns = data.primary_key_columns.map(
            (col) => col.name
          );
          setRelationshipColumns(primaryKeyColumns);
          console.log("Primary key columns: ", primaryKeyColumns);
        } else {
          console.error("API error:", data.error);
          setRelationshipColumns([]);
        }
      } else {
        console.error("Failed to fetch primary key data");
        setRelationshipColumns([]);
      }
    } catch (error) {
      console.error("Error fetching primary key columns:", error);
      setRelationshipColumns([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchForeignKeyColumns = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/er_relationships`
      );
      if (response.ok) {
        const relationships = await response.json();
        console.log("Relationships data:", relationships);

        // Filter relationships that involve this table
        const tableRelationships = relationships.filter(
          (rel) =>
            rel.from_table_id === table.table_id ||
            rel.to_table_id === table.table_id
        );

        // Extract unique foreign key columns from this table
        const fkColumns = new Set();
        console.log("tablerels: ", tableRelationships);
        tableRelationships.forEach((rel) => {
          if (rel.from_table_id === table.table_id) {
            fkColumns.add(rel.from_column);
          }
          if (rel.to_table_id === table.table_id) {
            fkColumns.add(rel.to_column);
          }
        });

        setForeignKeyColumns(Array.from(fkColumns));
        console.log("Foreign key columns: ", Array.from(fkColumns));
      } else {
        console.error("Failed to fetch relationships data");
        setForeignKeyColumns([]);
      }
    } catch (error) {
      console.error("Error fetching foreign key columns:", error);
      setForeignKeyColumns([]);
    }
  };

  const getColumnType = (columnName) => {
    const isPrimaryKey = relationshipColumns.includes(columnName);
    const isForeignKey = foreignKeyColumns.includes(columnName);

    if (isPrimaryKey && isForeignKey) return "both";
    if (isPrimaryKey) return "primary";
    if (isForeignKey) return "foreign";
    return "regular";
  };

  const renderColumnIcon = (columnType) => {
    switch (columnType) {
      case "primary":
        return (
          <div
            className={`p-1 rounded ${
              darkmode ? "bg-yellow-600" : "bg-yellow-500"
            }`}
          >
            <Key className="w-3 h-3 text-white" />
          </div>
        );
      case "foreign":
        return (
          <div
            className={`p-1 rounded ${
              darkmode ? "bg-blue-600" : "bg-blue-500"
            }`}
          >
            <Link className="w-3 h-3 text-white" />
          </div>
        );
      case "both":
        return (
          <div className="flex gap-1">
            <div
              className={`p-1 rounded ${
                darkmode ? "bg-yellow-600" : "bg-yellow-500"
              }`}
            >
              <Key className="w-3 h-3 text-white" />
            </div>
            <div
              className={`p-1 rounded ${
                darkmode ? "bg-blue-600" : "bg-blue-500"
              }`}
            >
              <Link className="w-3 h-3 text-white" />
            </div>
          </div>
        );
      default:
        return (
          <div
            className={`w-2 h-2 rounded-full ${
              darkmode ? "bg-gray-400" : "bg-gray-500"
            }`}
          />
        );
    }
  };

  const getColumnBadge = (columnType) => {
    switch (columnType) {
      case "primary":
        return (
          <div
            className={`ml-auto px-2 py-1 text-xs rounded-full ${
              darkmode
                ? "bg-yellow-600 text-yellow-100"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            PK
          </div>
        );
      case "foreign":
        return (
          <div
            className={`ml-auto px-2 py-1 text-xs rounded-full ${
              darkmode
                ? "bg-blue-600 text-blue-100"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            FK
          </div>
        );
      case "both":
        return (
          <div
            className={`ml-auto px-2 py-1 text-xs rounded-full ${
              darkmode
                ? "bg-purple-600 text-purple-100"
                : "bg-purple-100 text-purple-800"
            }`}
          >
            PK/FK
          </div>
        );
      default:
        return null;
    }
  };

  const handleProfileRequest = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          schema: table.schema_name,
          table: table.table_name,
        }),
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
      a.download = `${table.schema_name}_${table.table_name}_profile.html`;
      a.click();
      a.remove();
    } catch (error) {
      console.error("Profile generation failed:", error);
      alert("Failed to generate profile.");
    }
  };

  if (!table) {
    return (
      <div
        className={`rounded-2xl shadow-lg p-8 text-center border-2 border-dashed ${
          darkmode
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

  // Get only primary key and foreign key columns
  const keyColumns = Array.from(
    new Set([...relationshipColumns, ...foreignKeyColumns])
  );

  const visibleKeyColumns = isExpanded ? keyColumns : keyColumns.slice(0, 5);
  const hasMoreKeyColumns = keyColumns.length > 5;

  return (
    <div
      onClick={() => {
        setSelectedPath((path) => {
          return { ...path, table: table.table_name };
        });
        setSelectedTable(table.table_id);
      }}
      className={`rounded-2xl shadow-lg overflow-hidden w-[27rem] ring-1 ${
        darkmode
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
        </div>
      </div>

      {/* Columns Section */}
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
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            Key Columns
          </h4>
          <span
            className={`text-sm px-2 py-1 rounded-full font-medium ${
              darkmode
                ? "bg-gray-700 text-gray-300"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {keyColumns.length}
          </span>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            </div>
          ) : keyColumns.length > 0 ? (
            <div className="p-2 max-w-md mx-auto">
              <div className="space-y-2">
                {visibleKeyColumns.map((columnName, index) => {
                  const columnType = getColumnType(columnName);
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        darkmode
                          ? "bg-gray-800 border border-gray-700"
                          : "bg-slate-50 border border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {renderColumnIcon(columnType)}
                        <span className="font-medium text-sm">
                          {columnName}
                        </span>
                        {getColumnBadge(columnType)}
                      </div>
                    </div>
                  );
                })}

                {hasMoreKeyColumns && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                    className={`w-full p-3 rounded-lg border-2 border-dashed transition-colors ${
                      darkmode
                        ? "border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300"
                        : "border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          <span className="text-sm font-medium">Show Less</span>
                        </>
                      ) : (
                        <>
                          <ChevronsDown className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Show {keyColumns.length - 5} More Columns
                          </span>
                        </>
                      )}
                    </div>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div
              className={`text-center p-4 rounded-lg ${
                darkmode
                  ? "bg-gray-800 text-gray-400"
                  : "bg-gray-50 text-gray-500"
              }`}
            >
              <svg
                className="w-8 h-8 mx-auto mb-2 opacity-50"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <p className="text-sm">No key columns found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchemaCards;
