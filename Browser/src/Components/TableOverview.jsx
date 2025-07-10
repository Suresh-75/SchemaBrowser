import React, { useEffect, useState } from "react";
import axios from "axios";

const TableOverview = ({ schema, table, darkmode }) => {
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        if (!schema || !table) return;
        setLoading(true);
        setErr("");
        axios
            .get(`http://localhost:5000/api/table-overview/${schema}/${table}`)
            .then((res) => {
                setInfo(res.data);
                setLoading(false);
            })
            .catch((e) => {
                setErr(e.response?.data?.error || "Failed to fetch table info");
                setLoading(false);
            });
    }, [schema, table]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <span className={darkmode ? "text-blue-200" : "text-blue-700"}>
                    Loading table overview...
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
    if (!info) return null;

    return (
        <div className={`p-6 ${darkmode ? "bg-gray-900 text-blue-100" : "bg-white text-gray-800"} rounded-lg shadow`}>
            <h2 className="text-xl font-bold mb-2">
                Table: <span className="font-mono">{info.schema}.{info.table}</span>
            </h2>
            <div className="mb-2">
                <span className="font-semibold">Owner:</span> {info.owner || <span className="italic text-gray-400">N/A</span>}
            </div>
            <div className="mb-2">
                <span className="font-semibold">Row Count (estimate):</span> {info.row_count !== null ? info.row_count : <span className="italic text-gray-400">N/A</span>}
            </div>
            <div className="mb-2">
                <span className="font-semibold">Column Count:</span> {info.column_count !== null ? info.column_count : <span className="italic text-gray-400">N/A</span>}
            </div>
            <div className="mb-2">
                <span className="font-semibold">Partitioned:</span> {info.is_partition ? "Yes" : "No"}
            </div>
            <div className="mb-2">
                <span className="font-semibold">Last Modified:</span> {info.last_modified ? new Date(info.last_modified).toLocaleString() : <span className="italic text-gray-400">N/A</span>}
            </div>
            <div className="mb-4">
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
                                </tr>
                            </thead>
                            <tbody>
                                {info.columns.map((col, idx) => (
                                    <tr key={col.name} className={darkmode ? "hover:bg-blue-900" : "hover:bg-blue-50"}>
                                        <td className="px-3 py-2">{col.ordinal_position}</td>
                                        <td className="px-3 py-2 font-mono">{col.name}</td>
                                        <td className="px-3 py-2">{col.type}</td>
                                        <td className="px-3 py-2">{col.nullable}</td>
                                        <td className="px-3 py-2">{col.default !== null ? col.default : <span className="italic text-gray-400">-</span>}</td>
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
