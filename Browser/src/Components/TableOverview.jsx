import React, { useEffect, useState } from "react";
import { endpoints } from "../api";

const TableOverview = ({ table, darkmode }) => {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!table) return;
    setLoading(true);
    setErr("");
    endpoints
      .getTableOverview(table)
      .then((res) => {
        setInfo(res.data);
        setLoading(false);
      })
      .catch((e) => {
        setErr(e.response?.data?.error || "Failed to fetch table info");
        setLoading(false);
      });
  }, [table]);

  const handleDownloadCSV = () => {
    if (!info || !info.columns) return;

    const headers = [
      "S.No",
      "Column Name",
      "Type",
      "Nullable",
      "Default",
      "Primary Key",
    ];

    const escapeCSV = (val) =>
      typeof val === "string" ? `"${val.replace(/"/g, '""')}"` : val;

    const rows = info.columns.map((col) => [
      col.ordinal_position,
      escapeCSV(col.name),
      escapeCSV(col.type),
      escapeCSV(col.nullable),
      escapeCSV(col.default ?? "-"),
      col.is_primary_key ? "Yes" : "No",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${info.schema || "schema"}_${info.table || "table"}_overview.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  if (!table) {
    return (
      <div
        className={`p-4 text-center italic ${
          darkmode ? "text-gray-400 bg-gray-900" : "text-gray-600 bg-gray-100"
        } rounded`}
      >
        No table selected.
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className={`p-6 rounded-lg shadow ${
          darkmode ? "bg-gray-900 text-blue-100" : "bg-white text-gray-800"
        }`}
      >
        <p>Loading table info...</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className={darkmode ? "text-red-300" : "text-red-700"}>
          {err}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`p-6 rounded-lg shadow ${
        darkmode ? "bg-gray-900 text-blue-100" : "bg-white text-gray-800"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          Table:{" "}
          <span className="font-mono">
            {info.schema}.{info.table}
          </span>
        </h2>
        <button
          onClick={handleDownloadCSV}
          className={`px-4 py-2 rounded ${
            darkmode
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          } transition-colors`}
        >
          Download CSV
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <div>
          <span className="font-semibold">Owner:</span>{" "}
          {info.owner || <span className="italic text-gray-400">N/A</span>}
        </div>
        <div>
          <span className="font-semibold">Row Count (estimate):</span>{" "}
          {info.row_count ?? <span className="italic text-gray-400">N/A</span>}
        </div>
        <div>
          <span className="font-semibold">Column Count:</span>{" "}
          {info.column_count ?? (
            <span className="italic text-gray-400">N/A</span>
          )}
        </div>
        <div>
          <span className="font-semibold">Partitioned:</span>{" "}
          {info.is_partition ? "Yes" : "No"}
        </div>
        <div>
          <span className="font-semibold">Last Modified:</span>{" "}
          {info.last_modified ? (
            new Date(info.last_modified).toLocaleString()
          ) : (
            <span className="italic text-gray-400">N/A</span>
          )}
        </div>
      </div>

      <div>
        <span className="font-semibold">Columns:</span>
        {info.columns && info.columns.length > 0 ? (
          <div className="overflow-x-auto mt-2">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className={darkmode ? "bg-blue-950" : "bg-blue-100"}>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Nullable</th>
                  <th className="px-3 py-2 text-left">Default</th>
                  <th className="px-3 py-2 text-left">Primary Key</th>
                </tr>
              </thead>
              <tbody>
                {info.columns.map((col) => (
                  <tr
                    key={col.name}
                    className={
                      darkmode ? "hover:bg-blue-900" : "hover:bg-blue-50"
                    }
                  >
                    <td className="px-3 py-2">{col.ordinal_position}</td>
                    <td className="px-3 py-2 font-mono">{col.name}</td>
                    <td className="px-3 py-2">{col.type}</td>
                    <td className="px-3 py-2">{col.nullable}</td>
                    <td className="px-3 py-2">
                      {col.default !== null ? (
                        col.default
                      ) : (
                        <span className="italic text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {col.is_primary_key ? (
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            darkmode
                              ? "bg-green-900 text-green-200"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          Yes
                        </span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="italic text-gray-400 mt-2">No columns found.</div>
        )}
      </div>
    </div>
  );
};

export default TableOverview;
