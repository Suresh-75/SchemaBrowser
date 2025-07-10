import React, { useState, useEffect } from "react";
import ErDiagram from "../ErDiagram";
import axios from "axios";
import DatabaseOverview from "./DatabaseOverview";
import TableOverview from "./TableOverview";

const DatabaseTabs = ({
  setSelectedTable,
  selectedTable,
  selectedPath,
  darkmode,
  nodes,
  edges,
  setNodes,
  setEdges,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [profilingHtml, setProfilingHtml] = useState("");
  const [profilingLoading, setProfilingLoading] = useState(false);
  const [profilingError, setProfilingError] = useState("");

  // Update active tab when table is selected/deselected
  useEffect(() => {
    if (selectedPath?.table && activeTab !== "profiling") {
      setActiveTab("overview");
    } else if (!selectedPath?.table && activeTab === "profiling") {
      setActiveTab("overview");
    }
  }, [selectedPath?.table]);

  // Fetch profiling data when table is selected
  useEffect(() => {
    if (
      selectedPath?.table &&
      selectedPath?.database &&
      activeTab === "profiling"
    ) {
      fetchProfilingData();
    }
  }, [selectedPath?.table, selectedPath?.database, activeTab]);

  const fetchProfilingData = async () => {
    if (!selectedPath?.table || !selectedPath?.database) return;

    setProfilingLoading(true);
    setProfilingError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/profile",
        {
          schema: selectedPath.database,
          table: selectedPath.table,
        },
        {
          responseType: "text",
        }
      );

      // Response data is already HTML text
      setProfilingHtml(response.data);
    } catch (error) {
      console.error("Error fetching profiling data:", error);
      setProfilingError(
        error.response?.data?.error || "Failed to generate profile"
      );
    } finally {
      setProfilingLoading(false);
    }
  };

  const baseTabs = [
    { id: "overview", label: "Overview", icon: "chart" },
    { id: "erdiagram", label: "ER Diagram", icon: "diagram" },
  ];

  // Add profiling tab only when table is selected
  const tabs = selectedPath?.table
    ? [
      ...baseTabs,
      { id: "profiling", label: "Data Profiling", icon: "analytics" },
    ]
    : baseTabs;

  const renderTabIcon = (iconType) => {
    if (iconType === "chart") {
      return (
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      );
    }
    if (iconType === "analytics") {
      return (
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
            d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      );
    }
    return (
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
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tab Headers */}
      <div
        className={`border-b ${darkmode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
          }`}
      >
        <div className="flex space-x-1 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${activeTab === tab.id
                  ? darkmode
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-blue-500 text-white shadow-sm"
                  : darkmode
                    ? "text-gray-300 hover:text-white hover:bg-gray-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
            >
              {renderTabIcon(tab.icon)}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "overview" && selectedPath?.database && selectedPath?.table ? (
          <TableOverview schema={selectedPath.database} table={selectedPath.table} darkmode={darkmode} />
        ) : activeTab === "overview" && selectedPath?.database && !selectedPath?.table ? (
          <DatabaseOverview schemaName={selectedPath.database} darkmode={darkmode} />
        ) : activeTab === "overview" ? (
          <div
            className={`h-full flex items-center justify-center ${darkmode
                ? "bg-gray-900 text-gray-300"
                : "bg-gray-50 text-gray-600"
              }`}
          >
            <div className="text-center">
              <div
                className={`p-4 rounded-lg ${darkmode ? "bg-gray-800" : "bg-white"
                  } shadow-lg`}
              >
                <svg
                  className="w-12 h-12 mx-auto mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <h3 className="text-lg font-semibold mb-2">Overview Tab</h3>
                <p className="text-sm">
                  Content will be implemented by another team member
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "erdiagram" && (
          <ErDiagram
            setSelectedTable={setSelectedTable}
            selectedTable={selectedTable}
            selectedPath={selectedPath}
            darkmode={darkmode}
            nodes={nodes}
            edges={edges}
            setNodes={setNodes}
            setEdges={setEdges}
          />
        )}

        {activeTab === "profiling" && (
          <div className={`h-full ${darkmode ? "bg-gray-900" : "bg-gray-50"}`}>
            {profilingLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p
                    className={`text-sm ${darkmode ? "text-gray-300" : "text-gray-600"
                      }`}
                  >
                    Generating data profile for {selectedPath?.table}...
                  </p>
                </div>
              </div>
            ) : profilingError ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div
                    className={`p-4 rounded-lg ${darkmode
                        ? "bg-red-900 border-red-700"
                        : "bg-red-50 border-red-200"
                      } border`}
                  >
                    <svg
                      className="w-12 h-12 mx-auto mb-4 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      />
                    </svg>
                    <h3
                      className={`text-lg font-semibold mb-2 ${darkmode ? "text-red-200" : "text-red-800"
                        }`}
                    >
                      Profiling Error
                    </h3>
                    <p
                      className={`text-sm ${darkmode ? "text-red-300" : "text-red-600"
                        }`}
                    >
                      {profilingError}
                    </p>
                    <button
                      onClick={fetchProfilingData}
                      className={`mt-3 px-4 py-2 rounded-lg text-sm transition-colors ${darkmode
                          ? "bg-red-700 hover:bg-red-600 text-red-100"
                          : "bg-red-600 hover:bg-red-700 text-white"
                        }`}
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            ) : profilingHtml ? (
              <div className="h-full">
                <iframe
                  srcDoc={profilingHtml}
                  className="w-full h-full border-0"
                  title={`Data Profile for ${selectedPath?.table}`}
                  sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-modals allow-top-navigation-by-user-activation"
                  style={{ backgroundColor: darkmode ? "#1f2937" : "#ffffff" }}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div
                    className={`p-4 rounded-lg ${darkmode ? "bg-gray-800" : "bg-white"
                      } shadow-lg`}
                  >
                    <svg
                      className="w-12 h-12 mx-auto mb-4 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <h3
                      className={`text-lg font-semibold mb-2 ${darkmode ? "text-gray-200" : "text-gray-800"
                        }`}
                    >
                      Select a Table
                    </h3>
                    <p
                      className={`text-sm ${darkmode ? "text-gray-400" : "text-gray-600"
                        }`}
                    >
                      Choose a table to view its data profile
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseTabs;
