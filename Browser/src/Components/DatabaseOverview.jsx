import React, { useEffect, useState } from "react";
import axios from "axios";

const formatBytes = (bytes) => {
    if (bytes === null || bytes === undefined) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const DatabaseOverview = ({ schemaName, darkmode }) => {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        if (!schemaName) return;
        setLoading(true);
        setErr("");
        axios
            .get(`http://localhost:5000/api/schema-overview/${schemaName}`)
            .then((res) => {
                setOverview(res.data);
                setLoading(false);
            })
            .catch((e) => {
                setErr(e.response?.data?.error || "Failed to fetch schema info");
                setLoading(false);
            });
    }, [schemaName]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <span className={darkmode ? "text-blue-200" : "text-blue-700"}>
                    Loading database overview...
                </span>
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
    if (!overview) return null;

    return (
        <div className={`p-6 ${darkmode ? "bg-gray-900 text-blue-100" : "bg-white text-gray-800"} rounded-lg shadow`}>
            <h2 className="text-xl font-bold mb-2">
                Database: <span className="font-mono">{overview.schema}</span>
            </h2>
            <div className="mb-2">
                <span className="font-semibold">Total Tables:</span> {overview.table_count}
            </div>
            <div className="mb-2">
                <span className="font-semibold">Schema Size:</span>{" "}
                <span title={overview.schema_size_bytes ? `${overview.schema_size_bytes} bytes` : ""}>
                    {overview.schema_size_pretty || "N/A"}
                </span>
            </div>
            <div className="mb-4">
                <span className="font-semibold">Tablespace:</span> {overview.tablespace || "N/A"}
            </div>
            <div>
                <h3 className="font-semibold mb-2">Tables</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm">
                        <thead>
                            <tr className={darkmode ? "bg-blue-950" : "bg-blue-100"}>
                                <th className="px-3 py-2 text-left">Table Name</th>
                                <th className="px-3 py-2 text-left">Owner</th>
                                <th className="px-3 py-2 text-left">Row Count</th>
                                <th className="px-3 py-2 text-left">Size</th>
                            </tr>
                        </thead>
                        <tbody>
                            {overview.tables.map((t) => (
                                <tr key={t.table} className={darkmode ? "hover:bg-blue-900" : "hover:bg-blue-50"}>
                                    <td className="px-3 py-2 font-mono">{t.table}</td>
                                    <td className="px-3 py-2">{t.owner}</td>
                                    <td className="px-3 py-2">{t.row_count !== null ? t.row_count : <span className="italic text-gray-400">N/A</span>}</td>
                                    <td className="px-3 py-2">{formatBytes(t.size_bytes)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DatabaseOverview;
