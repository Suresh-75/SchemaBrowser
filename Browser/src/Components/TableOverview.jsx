import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  Download,
  Copy,
  Check,
  Filter,
  SortAsc,
  SortDesc,
  Database,
  Calendar,
  User,
  Hash,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import endpoints from "../api";

const TableOverview = ({ table, darkmode }) => {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    if (!table) return;
    setLoading(true);
    setErr("");
    endpoints
      .getTableOverview(table)
      .then((res) => {
        console.log("API Response:", res.data);

        if (!res.data || !res.data.columns) {
          throw new Error("Invalid response format: missing columns data");
        }

        // No need for complex transformation, just use the data as is
        setInfo(res.data);
        setLoading(false);
      })
      .catch((e) => {
        console.error("Error fetching table info:", e);
        setErr(e.response?.data?.error || "Failed to fetch table info");
        setLoading(false);
      });
  }, [table]);

  const filteredColumns = useMemo(() => {
    if (!info?.columns) return [];

    return info.columns.filter((col) => {
      switch (filterType) {
        case "primary":
          return col.primary_key === "Y";
        case "foreign":
          return col.foreign_key === "Y";
        case "nullable":
          return col.nullable === "Y";
        default:
          return true;
      }
    });
  }, [info?.columns, filterType]);

  const handleDownloadCSV = () => {
    if (!info || !info.columns) return;

    // Convert columns data to CSV format with enhanced metadata
    const headers = [
      "Position",
      "Name",
      "Data Type",
      "Length",
      "Precision",
      "Scale",
      "Nullable",
      "Default",
      "Comment",
    ];
    const rows = info.columns.map((col) => [
      col.position,
      col.name,
      col.data_type,
      col.length,
      col.precision,
      col.scale,
      col.nullable,
      col.default || "",
      col.comment || "",
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${info.table.table_name}_overview.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-full">
        <span className={darkmode ? "text-blue-200" : "text-blue-700"}>
          Loading table overview...
        </span>
      </div>
    );

  if (err)
    return (
      <div className="flex items-center justify-center h-full">
        <span className={darkmode ? "text-red-300" : "text-red-700"}>
          {err}
        </span>
      </div>
    );

  if (!info) return null;

  return (
    <div
      className={`p-6 ${
        darkmode ? "bg-gray-900 text-blue-100" : "bg-white text-gray-800"
      } rounded-lg shadow`}
    >
      {/* Table header with comment */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">
            Table: <span className="font-mono">{info.table.table_name}</span>
          </h2>
          {info.table.comment && (
            <p className="text-sm mt-1 text-gray-500">{info.table.comment}</p>
          )}
        </div>
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

      {/* Table info grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div key="row-count">
          <span className="font-semibold">Row Count:</span>{" "}
          {info.table.num_rows || "N/A"}
        </div>
        {info.size_info && (
          <div key="size">
            <span className="font-semibold">Size:</span>{" "}
            {(info.size_info.size_kb / 1024).toFixed(2)} MB
          </div>
        )}
        <div key="tablespace">
          <span className="font-semibold">Tablespace:</span>{" "}
          {info.table.tablespace || "N/A"}
        </div>
        <div key="last-analyzed">
          <span className="font-semibold">Last Analyzed:</span>{" "}
          {info.table.last_analyzed || "N/A"}
        </div>
      </div>

      {/* Columns section with enhanced metadata */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Columns</h3>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`px-3 py-1 text-sm rounded border ${
              darkmode
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-white border-gray-200 text-gray-600"
            }`}
          >
            <option value="all">All Columns</option>
            <option value="primary">Primary Keys</option>
            <option value="foreign">Foreign Keys</option>
            <option value="nullable">Nullable</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className={darkmode ? "bg-blue-950" : "bg-blue-100"}>
                <th className="px-3 py-2 text-left">Position</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Data Type</th>
                <th className="px-3 py-2 text-left">Length/Precision</th>
                <th className="px-3 py-2 text-left">Nullable</th>
                <th className="px-3 py-2 text-left">Primary Key</th>
                <th className="px-3 py-2 text-left">Foreign Key</th>
                <th className="px-3 py-2 text-left">Default</th>
                <th className="px-3 py-2 text-left">Comment</th>
              </tr>
            </thead>
            <tbody>
              {filteredColumns.map((col) => (
                <tr
                  key={`${info.table.table_name}-${col.name}`}
                  className={
                    darkmode ? "hover:bg-blue-900" : "hover:bg-blue-50"
                  }
                >
                  <td className="px-3 py-2">{col.position}</td>
                  <td className="px-3 py-2 font-mono">{col.name}</td>
                  <td className="px-3 py-2">{col.data_type}</td>
                  <td className="px-3 py-2">
                    {col.precision
                      ? `${col.precision}${col.scale ? `,${col.scale}` : ""}`
                      : col.length || "-"}
                  </td>
                  <td className="px-3 py-2">{col.nullable}</td>
                  {/* Primary Key Cell */}
                  <td className="px-3 py-2">
                    {col.primary_key || "N"}
                  </td>
                  {/* Foreign Key Cell */}
                  <td className="px-3 py-2">
                    {col.foreign_key || "N"}
                  </td>
                  <td className="px-3 py-2">{col.default || "-"}</td>
                  <td className="px-3 py-2">{col.comment || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Constraints section */}
      {info.constraints && info.constraints.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Constraints</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className={darkmode ? "bg-blue-950" : "bg-blue-100"}>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Column</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Condition</th>
                </tr>
              </thead>
              <tbody>
                {info.constraints.map((constraint) => (
                  <tr
                    key={`${info.table.table_name}-${constraint.name}`}
                    className={
                      darkmode ? "hover:bg-blue-900" : "hover:bg-blue-50"
                    }
                  >
                    <td className="px-3 py-2">{constraint.name}</td>
                    <td className="px-3 py-2">{constraint.type}</td>
                    <td className="px-3 py-2">{constraint.column}</td>
                    <td className="px-3 py-2">{constraint.status}</td>
                    <td className="px-3 py-2">{constraint.condition || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// const TableOverview = ({ table = "users", darkmode = false }) => {
//   const [info, setInfo] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [sortConfig, setSortConfig] = useState({
//     key: "ordinal_position",
//     direction: "asc",
//   });
//   const [filterType, setFilterType] = useState("all");
//   const [copiedField, setCopiedField] = useState(null);
//   const [showSensitiveData, setShowSensitiveData] = useState(true);
//   const [selectedColumns, setSelectedColumns] = useState(new Set());

//   useEffect(() => {
//     if (!table) return;
//     setLoading(true);
//     setErr("");
//     setSelectedColumns(new Set());

//     endpoints
//       .getTableOverview(table)
//       .then((res) => {
//         setInfo(res.data);
//         setLoading(false);
//       })
//       .catch((e) => {
//         setErr(e.response?.data?.error || "Failed to fetch table info");
//         setLoading(false);
//       });
//   }, [table]);

//   const filteredAndSortedColumns = useMemo(() => {
//     if (!info?.columns) return [];

//     let filtered = info.columns.filter((col) => {
//       const matchesSearch =
//         col.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         col.type.toLowerCase().includes(searchTerm.toLowerCase());

//       const matchesFilter =
//         filterType === "all" ||
//         (filterType === "primary" && col.is_primary_key) ||
//         (filterType === "nullable" && col.nullable === "YES") ||
//         (filterType === "required" && col.nullable === "NO");

///       return matchesSearch && matchesFilter;
///     });

///     return filtered.sort((a, b) => {
///       const aVal = a[sortConfig.key];
///       const bVal = b[sortConfig.key];

///       if (sortConfig.direction === "asc") {
///         return aVal > bVal ? 1 : -1;
///       } else {
///         return aVal < bVal ? 1 : -1;
///       }
///     });
///   }, [info?.columns, searchTerm, sortConfig, filterType]);

///   const handleSort = (key) => {
///     setSortConfig((prev) => ({
///       key,
///       direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
///     }));
///   };

///   const handleCopyToClipboard = async (text, field) => {
///     try {
///       await navigator.clipboard.writeText(text);
///       setCopiedField(field);
///       setTimeout(() => setCopiedField(null), 2000);
///     } catch (err) {
///       console.error("Failed to copy:", err);
///     }
///   };

///   const handleDownloadCSV = () => {
///     if (!info || !info.columns) return;

///     const headers = [
///       "S.No",
///       "Column Name",
///       "Type",
///       "Nullable",
///       "Default",
///       "Primary Key",
///     ];

///     const escapeCSV = (val) =>
///       typeof val === "string" ? `"${val.replace(/"/g, '""')}"` : val;

///     const rows = filteredAndSortedColumns.map((col) => [
///       col.ordinal_position,
///       escapeCSV(col.name),
///       escapeCSV(col.type),
///       escapeCSV(col.nullable),
///       escapeCSV(col.default ?? "-"),
///       col.is_primary_key ? "Yes" : "No",
///     ]);

///     const csvContent = [headers, ...rows]
///       .map((row) => row.join(","))
///       .join("\n");

///     const blob = new Blob([csvContent], { type: "text/csv" });
///     const url = window.URL.createObjectURL(blob);
///     const link = document.createElement("a");
///     link.href = url;
///     link.setAttribute(
///       "download",
///       `${info.schema || "schema"}_${info.table || "table"}_overview.csv`
///     );
///     document.body.appendChild(link);
///     link.click();
///     link.remove();
///     window.URL.revokeObjectURL(url);
///   };

///   const handleRefresh = () => {
///     if (!table) return;
///     setLoading(true);
///     setErr("");
///     endpoints
///       .getTableOverview(table)
///       .then((res) => {
///         setInfo(res.data);
///         setLoading(false);
///       })
///       .catch((e) => {
///         setErr(e.response?.data?.error || "Failed to fetch table info");
///         setLoading(false);
///       });
///   };

///   const toggleColumnSelection = (columnName) => {
///     setSelectedColumns((prev) => {
///       const newSet = new Set(prev);
///       if (newSet.has(columnName)) {
///         newSet.delete(columnName);
///       } else {
///         newSet.add(columnName);
///       }
///       return newSet;
///     });
///   };

///   const selectAllColumns = () => {
///     setSelectedColumns(
///       new Set(filteredAndSortedColumns.map((col) => col.name))
///     );
///   };

///   const deselectAllColumns = () => {
///     setSelectedColumns(new Set());
///   };

///   const formatRowCount = (count) => {
///     if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
///     if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
///     return count?.toLocaleString() || "N/A";
///   };

///   const getTypeColor = (type) => {
///     const typeMap = {
///       bigint: "bg-blue-100 text-blue-800",
///       varchar: "bg-green-100 text-green-800",
///       timestamp: "bg-purple-100 text-purple-800",
///       boolean: "bg-yellow-100 text-yellow-800",
///       jsonb: "bg-pink-100 text-pink-800",
///       integer: "bg-indigo-100 text-indigo-800",
///     };

///     const baseType = type.split("(")[0].toLowerCase();
///     return typeMap[baseType] || "bg-gray-100 text-gray-800";
///   };

///   if (!table) {
///     return (
///       <div
///         className={`p-8 text-center rounded-lg border-2 border-dashed ${
///           darkmode
///             ? "text-gray-400 bg-gray-900 border-gray-700"
///             : "text-gray-600 bg-gray-50 border-gray-300"
///         }`}
///       >
///         <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
///         <p className="text-lg font-medium mb-2">No table selected</p>
///         <p className="text-sm opacity-75">
///           Select a table to view its overview
///         </p>
///       </div>
///     );
///   }

///   if (loading) {
///     return (
///       <div
///         className={`p-8 rounded-lg shadow-lg ${
///           darkmode ? "bg-gray-900 text-blue-100" : "bg-white text-gray-800"
///         }`}
///       >
///         <div className="flex items-center justify-center">
///           <RefreshCw className="w-6 h-6 mr-3 animate-spin" />
///           <p className="text-lg">Loading table information...</p>
///         </div>
///       </div>
///     );
///   }

///   if (err) {
///     return (
///       <div
///         className={`p-8 rounded-lg shadow-lg ${
///           darkmode
///             ? "bg-gray-900 border border-red-800"
///             : "bg-white border border-red-200"
///         }`}
///       >
///         <div className="flex items-center justify-center">
///           <div className="text-center">
///             <div
///               className={`text-2xl mb-4 ${
///                 darkmode ? "text-red-400" : "text-red-600"
///               }`}
///             >
///               ⚠️
///             </div>
///             <p
///               className={`text-lg font-medium mb-2 ${
///                 darkmode ? "text-red-300" : "text-red-700"
///               }`}
///             >
///               Error loading table
///             </p>
///             <p
///               className={`text-sm ${
///                 darkmode ? "text-red-400" : "text-red-600"
///               }`}
///             >
///               {err}
///             </p>
///             <button
///               onClick={handleRefresh}
///               className={`mt-4 px-4 py-2 rounded-lg font-medium transition-colors ${
///                 darkmode
///                   ? "bg-red-800 hover:bg-red-700 text-red-100"
///                   : "bg-red-100 hover:bg-red-200 text-red-800"
///               }`}
///             >
///               Try Again
///             </button>
///           </div>
///         </div>
///       </div>
///     );
///   }

///   return (
///     <div
///       className={`rounded-lg shadow-lg ${
///         darkmode ? "bg-gray-900 text-blue-100" : "bg-white text-gray-800"
///       }`}
///     >
///       {/* Header */}
///       <div
///         className={`p-6 border-b ${
///           darkmode ? "border-gray-700" : "border-gray-200"
///         }`}
///       >
///         <div className="flex justify-between items-start mb-4">
///           <div>
///             <h1 className="text-2xl font-bold mb-2">
///               <Database className="w-6 h-6 inline mr-2" />
///               <span className="font-mono">
///                 {info.schema}.{info.table}
///               </span>
///             </h1>
///             <div className="flex items-center space-x-4 text-sm">
///               <span className="flex items-center">
///                 <User className="w-4 h-4 mr-1" />
///                 {info.owner || "N/A"}
///               </span>
///               <span className="flex items-center">
///                 <Calendar className="w-4 h-4 mr-1" />
///                 {info.last_modified
///                   ? new Date(info.last_modified).toLocaleDateString()
///                   : "N/A"}
///               </span>
///             </div>
///           </div>
///           <div className="flex space-x-2">
///             <button
///               onClick={handleRefresh}
///               className={`p-2 rounded-lg transition-colors ${
///                 darkmode
///                   ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
///                   : "bg-gray-100 hover:bg-gray-200 text-gray-600"
///               }`}
///               title="Refresh data"
///             >
///               <RefreshCw className="w-4 h-4" />
///             </button>
///             <button
///               onClick={handleDownloadCSV}
///               className={`px-4 py-2 rounded-lg font-medium transition-colors ${
///                 darkmode
///                   ? "bg-blue-600 hover:bg-blue-700 text-white"
///                   : "bg-blue-500 hover:bg-blue-600 text-white"
///               }`}
///             >
///               <Download className="w-4 h-4 mr-2 inline" />
///               Export CSV
///             </button>
///           </div>
///         </div>

///         {/* Stats Grid */}
///         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
///           <div
///             className={`p-4 rounded-lg ${
///               darkmode ? "bg-gray-800" : "bg-gray-50"
///             }`}
///           >
///             <div className="flex items-center justify-between">
///               <div>
///                 <p className="text-sm opacity-75">Rows</p>
///                 <p className="text-xl font-bold">
///                   {formatRowCount(info.row_count)}
///                 </p>
///               </div>
///               <Hash className="w-8 h-8 opacity-50" />
///             </div>
///           </div>
///           <div
///             className={`p-4 rounded-lg ${
///               darkmode ? "bg-gray-800" : "bg-gray-50"
///             }`}
///           >
///             <div className="flex items-center justify-between">
///               <div>
///                 <p className="text-sm opacity-75">Columns</p>
///                 <p className="text-xl font-bold">{info.column_count}</p>
///               </div>
///               <Database className="w-8 h-8 opacity-50" />
///             </div>
///           </div>
///           <div
///             className={`p-4 rounded-lg ${
///               darkmode ? "bg-gray-800" : "bg-gray-50"
///             }`}
///           >
///             <div className="flex items-center justify-between">
///               <div>
///                 <p className="text-sm opacity-75">Partitioned</p>
///                 <p className="text-xl font-bold">
///                   {info.is_partition ? "Yes" : "No"}
///                 </p>
///               </div>
///               <div
///                 className={`w-8 h-8 rounded-full flex items-center justify-center ${
///                   info.is_partition
///                     ? darkmode
///                       ? "bg-green-900 text-green-400"
///                       : "bg-green-100 text-green-600"
///                     : darkmode
///                     ? "bg-gray-700 text-gray-400"
///                     : "bg-gray-200 text-gray-600"
///                 }`}
///               >
///                 {info.is_partition ? "✓" : "–"}
///               </div>
///             </div>
///           </div>
///           <div
///             className={`p-4 rounded-lg ${
///               darkmode ? "bg-gray-800" : "bg-gray-50"
///             }`}
///           >
///             <div className="flex items-center justify-between">
///               <div>
///                 <p className="text-sm opacity-75">Primary Keys</p>
///                 <p className="text-xl font-bold">
///                   {info.columns?.filter((col) => col.is_primary_key).length ||
//                     0}
//                 </p>
///               </div>
///               <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
///                 🔑
///               </div>
///             </div>
///           </div>
///         </div>
///       </div>

///       {/* Controls */}
///       <div
///         className={`p-6 border-b ${
///           darkmode ? "border-gray-700" : "border-gray-200"
///         }`}
///       >
///         <div className="flex flex-wrap gap-4 items-center">
///           <div className="flex-1 min-w-64">
///             <div className="relative">
///               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-50" />
///               <input
///                 type="text"
///                 placeholder="Search columns..."
///                 value={searchTerm}
///                 onChange={(e) => setSearchTerm(e.target.value)}
///                 className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
///                   darkmode
///                     ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
///                     : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
///                 }`}
///               />
///             </div>
///           </div>

///           <select
///             value={filterType}
///             onChange={(e) => setFilterType(e.target.value)}
///             className={`px-3 py-2 rounded-lg border ${
///               darkmode
///                 ? "bg-gray-800 border-gray-700 text-white"
///                 : "bg-white border-gray-300 text-gray-900"
///             }`}
///           >
///             <option value="all">All Columns</option>
///             <option value="primary">Primary Keys</option>
///             <option value="nullable">Nullable</option>
///             <option value="required">Required</option>
///           </select>

///           <div className="flex items-center space-x-2">
///             <button
///               onClick={selectAllColumns}
///               className={`px-3 py-1 text-sm rounded ${
///                 darkmode
///                   ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
///                   : "bg-gray-100 hover:bg-gray-200 text-gray-700"
///               }`}
///             >
///               Select All
///             </button>
///             <button
///               onClick={deselectAllColumns}
///               className={`px-3 py-1 text-sm rounded ${
///                 darkmode
///                   ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
///                   : "bg-gray-100 hover:bg-gray-200 text-gray-700"
///               }`}
///             >
///               Clear
///             </button>
///           </div>

///           <button
///             onClick={() => setShowSensitiveData(!showSensitiveData)}
///             className={`p-2 rounded-lg ${
///               darkmode
///                 ? "bg-gray-800 hover:bg-gray-700 text-gray-300"
///                 : "bg-gray-100 hover:bg-gray-200 text-gray-600"
///             }`}
///             title={
///               showSensitiveData ? "Hide sensitive data" : "Show sensitive data"
///             }
///           >
///             {showSensitiveData ? (
///               <Eye className="w-4 h-4" />
///             ) : (
///               <EyeOff className="w-4 h-4" />
///             )}
///           </button>
///         </div>

///         {selectedColumns.size > 0 && (
///           <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
///             <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
///               {selectedColumns.size} column
///               {selectedColumns.size !== 1 ? "s" : ""} selected
///             </p>
///           </div>
///         )}
///       </div>

///       {/* Table */}
///       <div className="p-6">
///         {filteredAndSortedColumns.length > 0 ? (
///           <div className="overflow-x-auto">
///             <table className="w-full border-collapse">
///               <thead>
///                 <tr className={`${darkmode ? "bg-gray-800" : "bg-gray-50"}`}>
///                   <th className="p-3 text-left">
///                     <input
///                       type="checkbox"
///                       checked={
///                         selectedColumns.size === filteredAndSortedColumns.length
///                       }
///                       onChange={() =>
///                         selectedColumns.size === filteredAndSortedColumns.length
///                           ? deselectAllColumns()
///                           : selectAllColumns()
///                       }
///                       className="rounded"
///                     />
///                   </th>
///                   {[
///                     "ordinal_position",
///                     "name",
///                     "type",
///                     "nullable",
///                     "default",
///                     "is_primary_key",
///                   ].map((key) => (
///                     <th
///                       key={key}
///                       className="p-3 text-left cursor-pointer hover:bg-opacity-80 transition-colors"
///                       onClick={() => handleSort(key)}
///                     >
///                       <div className="flex items-center space-x-1">
///                         <span className="font-medium">
///                           {key === "ordinal_position"
///                             ? "#"
///                             : key === "name"
///                             ? "Name"
///                             : key === "type"
///                             ? "Type"
///                             : key === "nullable"
///                             ? "Nullable"
///                             : key === "default"
///                             ? "Default"
///                             : "Primary Key"}
///                         </span>
///                         {sortConfig.key === key &&
///                           (sortConfig.direction === "asc" ? (
///                             <SortAsc className="w-4 h-4" />
///                           ) : (
///                             <SortDesc className="w-4 h-4" />
///                           ))}
///                       </div>
///                     </th>
///                   ))}
///                 </tr>
///               </thead>
///               <tbody>
///                 {filteredAndSortedColumns.map((col) => (
///                   <tr
///                     key={col.name}
///                     className={`border-t transition-colors ${
///                       darkmode
///                         ? "border-gray-700 hover:bg-gray-800"
///                         : "border-gray-200 hover:bg-gray-50"
///                     } ${
///                       selectedColumns.has(col.name)
///                         ? darkmode
///                           ? "bg-blue-900/20"
///                           : "bg-blue-50"
///                         : ""
///                     }`}
///                   >
///                     <td className="p-3">
///                       <input
///                         type="checkbox"
///                         checked={selectedColumns.has(col.name)}
///                         onChange={() => toggleColumnSelection(col.name)}
///                         className="rounded"
///                       />
///                     </td>
///                     <td className="p-3 font-mono text-sm">
///                       {col.ordinal_position}
///                     </td>
///                     <td className="p-3">
///                       <div className="flex items-center space-x-2">
///                         <span className="font-mono font-medium">
///                           {col.name}
///                         </span>
///                         <button
///                           onClick={() =>
///                             handleCopyToClipboard(col.name, `name-${col.name}`)
///                           }
///                           className="opacity-0 group-hover:opacity-100 transition-opacity"
///                           title="Copy column name"
///                         >
///                           {copiedField === `name-${col.name}` ? (
///                             <Check className="w-3 h-3 text-green-500" />
///                           ) : (
///                             <Copy className="w-3 h-3 text-gray-400 hover:text-gray-600" />
///                           )}
///                         </button>
///                       </div>
///                     </td>
///                     <td className="p-3">
///                       <span
///                         className={`px-2 py-1 rounded text-xs font-medium ${
///                           darkmode
///                             ? "bg-gray-700 text-gray-300"
///                             : getTypeColor(col.type)
///                         }`}
///                       >
///                         {col.type}
///                       </span>
///                     </td>
///                     <td className="p-3">
///                       <span
///                         className={`px-2 py-1 rounded text-xs font-medium ${
///                           col.nullable === "YES"
///                             ? darkmode
///                               ? "bg-yellow-900 text-yellow-300"
///                               : "bg-yellow-100 text-yellow-800"
///                             : darkmode
///                             ? "bg-gray-900 text-gray-300"
///                             : "bg-gray-100 text-gray-800"
///                         }`}
///                       >
///                         {col.nullable === "YES" ? "Nullable" : "Required"}
///                       </span>
///                     </td>
///                     <td className="p-3">
///                       {col.default !== null && showSensitiveData ? (
///                         <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
///                           {col.default}
///                         </span>
///                       ) : (
///                         <span className="italic text-gray-400 text-sm">
///                           {col.default !== null ? "•••" : "–"}
///                         </span>
///                       )}
///                     </td>
///                     <td className="p-3">
///                       {col.is_primary_key ? (
///                         <span
///                           className={`px-2 py-1 rounded text-xs font-bold ${
///                             darkmode
///                               ? "bg-green-900 text-green-200"
///                               : "bg-green-100 text-green-800"
///                           }`}
///                         >
///                           🔑 Primary
///                         </span>
///                       ) : (
///                         <span className="text-gray-400 text-sm">–</span>
///                       )}
///                     </td>
///                   </tr>
///                 ))}
///               </tbody>
///             </table>
///           </div>
///         ) : (
///           <div className="text-center py-12">
///             <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
///             <p className="text-lg font-medium mb-2">No columns found</p>
///             <p className="text-sm opacity-75">
///               {searchTerm
///                 ? "Try adjusting your search terms"
///                 : "This table has no columns"}
///             </p>
///           </div>
///         )}
///       </div>
///     </div>
///   );
/// };

export default TableOverview;
