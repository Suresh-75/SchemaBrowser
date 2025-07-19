import React, { useEffect, useState } from "react";
import { endpoints } from '../api';

const TableOverview = ({ table, darkmode }) => {
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        if (!table) return;
        setLoading(true);
        setErr("");
        endpoints.getTableOverview(table)
            .then((res) => {
                console.log('API Response:', res.data);

                if (!res.data || !res.data.columns) {
                    throw new Error('Invalid response format: missing columns data');
                }
            
            // No need for complex transformation, just use the data as is
                setInfo(res.data);
                setLoading(false);
            })
            .catch((e) => {
                console.error('Error fetching table info:', e);
                setErr(e.response?.data?.error || "Failed to fetch table info");
                setLoading(false);
             });
    }, [table]);


    const handleDownloadCSV = () => {
        if (!info || !info.columns) return;

        // Convert columns data to CSV format with enhanced metadata
        const headers = ['Position', 'Name', 'Data Type', 'Length', 'Precision', 'Scale', 'Nullable', 'Default', 'Comment'];
        const rows = info.columns.map(col => [
            col.position,
            col.name,
            col.data_type,
            col.length,
            col.precision,
            col.scale,
            col.nullable,
            col.default || '',
            col.comment || ''
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${info.table.table_name}_overview.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <span className={darkmode ? "text-blue-200" : "text-blue-700"}>
                Loading table overview...
            </span>
        </div>
    );

    if (err) return (
        <div className="flex items-center justify-center h-full">
            <span className={darkmode ? "text-red-300" : "text-red-700"}>
                {err}
            </span>
        </div>
    );

    if (!info) return null;

    return (
        <div className={`p-6 ${darkmode ? "bg-gray-900 text-blue-100" : "bg-white text-gray-800"} rounded-lg shadow`}>
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
                    className={`px-4 py-2 rounded ${darkmode
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
                    <span className="font-semibold">Row Count:</span> {info.table.num_rows || 'N/A'}
                </div>
                {info.size_info && (
                    <div key="size">
                        <span className="font-semibold">Size:</span> {(info.size_info.size_kb/1024).toFixed(2)} MB
                    </div>
                )}
                <div key="tablespace">
                    <span className="font-semibold">Tablespace:</span> {info.table.tablespace || 'N/A'}
                </div>
                <div key="last-analyzed">
                    <span className="font-semibold">Last Analyzed:</span> {info.table.last_analyzed || 'N/A'}
                </div>
            </div>

            {/* Columns section with enhanced metadata */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Columns</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm">
                        <thead>
                            <tr className={darkmode ? "bg-blue-950" : "bg-blue-100"}>
                                <th className="px-3 py-2 text-left">Position</th>
                                <th className="px-3 py-2 text-left">Name</th>
                                <th className="px-3 py-2 text-left">Data Type</th>
                                <th className="px-3 py-2 text-left">Length/Precision</th>
                                <th className="px-3 py-2 text-left">Nullable</th>
                                <th className="px-3 py-2 text-left">Default</th>
                                <th className="px-3 py-2 text-left">Comment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {info.columns.map((col) => (
                                <tr key={`${info.table.table_name}-${col.name}`} 
                                    className={darkmode ? "hover:bg-blue-900" : "hover:bg-blue-50"}>
                                    <td className="px-3 py-2">{col.position}</td>
                                    <td className="px-3 py-2 font-mono">{col.name}</td>
                                    <td className="px-3 py-2">{col.data_type}</td>
                                    <td className="px-3 py-2">
                                        {col.precision ? `${col.precision}${col.scale ? `,${col.scale}` : ''}` : col.length || '-'}
                                    </td>
                                    <td className="px-3 py-2">{col.nullable}</td>
                                    <td className="px-3 py-2">{col.default || '-'}</td>
                                    <td className="px-3 py-2">{col.comment || '-'}</td>
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
                                    <tr key={`${info.table.table_name}-${constraint.name}`} 
                                        className={darkmode ? "hover:bg-blue-900" : "hover:bg-blue-50"}>
                                        <td className="px-3 py-2">{constraint.name}</td>
                                        <td className="px-3 py-2">{constraint.type}</td>
                                        <td className="px-3 py-2">{constraint.column}</td>
                                        <td className="px-3 py-2">{constraint.status}</td>
                                        <td className="px-3 py-2">{constraint.condition || '-'}</td>
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

export default TableOverview;