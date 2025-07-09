import React, { useEffect, useState } from "react";
import { Box, Eye, Network, Plus, Settings, Zap, Trash2 } from "lucide-react";
import VersionControlPanel from "./VersionControlPanel";
import AnnotationsPanel from "./Annotations";
import axios from "axios";

const SidebarComponent = ({
  user,
  activeTab = "overview",
  selectedPath,
  setCreate,
  create,
  setDarkmode,
  darkmode,
  setNodes,
}) => {
  const [data, setData] = useState([]);
  const [rels, setRels] = useState([]);
  async function fetchTableInfo(tableId) {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/tables/${tableId}/attributes`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching table info for table ${tableId}:`, error);
      return null;
    }
  }
  useEffect(() => {
    const fetchAllData = async () => {
      if (!selectedPath || !selectedPath.database) {
        setData([]);
        setRels([]);
        return;
      }

      try {
        const tablesResponse = await axios.get(
          `http://localhost:5000/api/tables/${selectedPath.database}`
        );
        console.log(tablesResponse.data);
        setData(tablesResponse.data);

        const relationshipsResponse = await axios.get(
          `http://localhost:5000/api/er_relationships/${selectedPath.database}`
        );
        const relsData = relationshipsResponse.data;

        const processedRels = relsData.map((rel) => ({
          id: rel.id,
          display: rel.display,
        }));
        setRels(processedRels);
      } catch (error) {
        setData([]);
        setRels([]);
        console.error(
          `Error fetching data for database ${selectedPath.database}:`,
          error
        );
      }
    };

    fetchAllData();
  }, [selectedPath, create]);

  let lineage = [];
  if (selectedPath?.lob) lineage.push(selectedPath.lob);
  if (selectedPath?.subject) lineage.push(selectedPath.subject);
  if (selectedPath?.database) lineage.push(selectedPath.database);
  if (selectedPath?.table) lineage.push(selectedPath.table);

  const handleDeleteTable = async (tableId, tableName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete table "${tableName}"? This action cannot be undone and will also remove all associated relationships.`
      )
    ) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:5000/api/tables/${tableId}`);

      if (response.status === 200) {
        // Remove the deleted table from the data state
        setData((prevData) => prevData.filter((entity) => entity.id !== tableId));
        // Trigger refresh of relationships as well
        setCreate((prev) => (prev ? prev + "_refresh" : "refresh"));
        alert(`Table "${tableName}" deleted successfully`);
      }
    } catch (error) {
      console.error("Error deleting table:", error);
      alert(`Failed to delete table: ${error.response?.data?.error || error.message}`);
    }
  };

  // Render content based on the activeTab prop
  switch (activeTab) {
    case "versions":
      return <VersionControlPanel />;
    case "annotations":
      return <AnnotationsPanel />;
    case "entities":
      return (
        <>
          <style jsx>{`
            /* Light mode custom scrollbar */
            .custom-scrollbar-light::-webkit-scrollbar {
              width: 8px;
            }

            .custom-scrollbar-light::-webkit-scrollbar-track {
              background: #f1f5f9;
              border-radius: 8px;
            }

            .custom-scrollbar-light::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 8px;
              border: 2px solid #f1f5f9;
            }

            .custom-scrollbar-light::-webkit-scrollbar-thumb:hover {
              background: #94a3b8;
            }

            /* Dark mode custom scrollbar */
            .custom-scrollbar-dark::-webkit-scrollbar {
              width: 8px;
            }

            .custom-scrollbar-dark::-webkit-scrollbar-track {
              background: #1e293b;
              border-radius: 8px;
            }

            .custom-scrollbar-dark::-webkit-scrollbar-thumb {
              background: #475569;
              border-radius: 8px;
              border: 2px solid #1e293b;
            }

            .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
              background: #64748b;
            }

            /* Firefox scrollbar support */
            .custom-scrollbar-light {
              scrollbar-width: thin;
              scrollbar-color: #cbd5e1 #f1f5f9;
            }

            .custom-scrollbar-dark {
              scrollbar-width: thin;
              scrollbar-color: #475569 #1e293b;
            }
          `}</style>
          <div
            className={`flex flex-col space-y-4 ${user === "admin" ? "max-h-[30rem]" : "max-h-[35rem]"
              }`}
            aria-label="Entities Panel"
          >
            <h3
              className={`font-semibold flex items-center gap-2 mb-2 ${darkmode ? "text-blue-200" : "text-gray-800"
                }`}
            >
              <Box
                className={darkmode ? "text-blue-400" : "text-blue-600"}
                size={20}
              />
              Entities
            </h3>
            <div
              className={`flex-1 overflow-y-scroll space-y-2 pr-1 ${darkmode ? "custom-scrollbar-dark" : "custom-scrollbar-light"
                }`}
            >
              {data.length > 0 ? (
                data.map((entity) => (
                  <div
                    key={entity.id}
                    className={`p-4 rounded-xl border shadow hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-3 ${darkmode
                        ? "bg-gradient-to-r from-blue-950 to-blue-950 border-blue-900"
                        : "bg-blue-100 to-white border-blue-100"
                      }`}
                    tabIndex={0}
                    aria-label={`Entity: ${entity.name}`}
                  >
                    <Box
                      className={darkmode ? "text-blue-300" : "text-blue-500"}
                      size={20}
                    />
                    <div
                      className="flex-1"
                      onClick={async () => {
                        const data = await fetchTableInfo(entity.id);
                        setNodes((prevNodes) => [
                          ...prevNodes,
                          {
                            id: entity.id.toString(),
                            type: "schemaCard",
                            data: {
                              table: data,
                              darkmode: darkmode,
                            },
                            position: {
                              x: Math.random() * 500,
                              y: Math.random() * 500,
                            },
                          },
                        ]);
                      }}
                    >
                      <div
                        className={`font-semibold capitalize text-base ${darkmode ? "text-blue-100" : "text-gray-800"
                          }`}
                      >
                        {entity.name}
                      </div>
                    </div>
                    {user === "admin" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTable(entity.id, entity.name);
                        }}
                        className={`p-2 rounded-lg transition-colors hover:scale-110 ${darkmode
                            ? "text-red-400 hover:bg-red-900 hover:text-red-300"
                            : "text-red-500 hover:bg-red-100 hover:text-red-700"
                          }`}
                        aria-label={`Delete table ${entity.name}`}
                        title={`Delete table ${entity.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div
                  className={
                    darkmode ? "text-gray-400 text-sm" : "text-gray-500 text-sm"
                  }
                >
                  No entities found for this selection.
                </div>
              )}
            </div>
            {user === "admin" ? (
              selectedPath?.database ? (
                <button
                  onClick={() => setCreate("Entity")}
                  className={`w-full mt-4 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 shadow ${darkmode
                      ? "bg-blue-800 text-white hover:bg-blue-900"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  aria-label="Add Entity"
                >
                  <Plus size={16} />
                  Add Entity
                </button>
              ) : (
                <div
                  className={`text-center w-full rounded-lg py-2 mt-2 text-sm font-medium border ${darkmode
                      ? "text-blue-200 bg-blue-950 border-blue-900"
                      : "text-blue-700 bg-blue-50 border-blue-100"
                    }`}
                >
                  Choose a database to add entities
                </div>
              )
            ) : (
              <></>
            )}
          </div>
        </>
      );
    case "relationships":
      return (
        <>
          <div
            className="flex flex-col space-y-4 "
            aria-label="Relationships Panel"
          >
            <h3
              className={`font-semibold flex items-center gap-2 mb-2 ${darkmode ? "text-blue-200" : "text-gray-800"
                }`}
            >
              <Network
                className={darkmode ? "text-blue-400" : "text-blue-600"}
                size={20}
              />
              Relationships
            </h3>
            <div
              className={`flex-1 min-h-0 overflow-y-scroll space-y-3 pr-1 overflow-x-hidden ${darkmode ? "custom-scrollbar-dark" : "custom-scrollbar-light"
                } ${user === "admin" ? "max-h-[25rem]" : "max-h-[30rem]"}`}
            >
              {rels.length > 0 ? (
                rels.map((relItem) => (
                  <div
                    key={relItem.id}
                    className={`p-4  rounded-xl border shadow hover:shadow-md transition-all cursor-pointer flex items-center gap-3 ${darkmode
                        ? "bg-gradient-to-r from-blue-950 to-blue-950 border-blue-900"
                        : "bg-gradient-to-r from-blue-200 to-green-50 border-green-100"
                      }`}
                    tabIndex={0}
                    aria-label={`Relationship: ${relItem.display}`}
                  >
                    <div>
                      <div
                        className={`font-semibold text-base ${darkmode ? "text-blue-100" : "text-gray-800"
                          }`}
                      >
                        {relItem.display}
                      </div>
                      <div
                        className={
                          darkmode
                            ? "text-xs text-gray-400 mt-1 flex items-center"
                            : "text-xs text-gray-500 mt-1 flex items-center"
                        }
                      >
                        {" "}
                        <Network
                          className={
                            darkmode
                              ? "text-blue-300 mr-2"
                              : "text-blue-600 mr-2"
                          }
                          size={20}
                        />
                        Foreign Key
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className={
                    darkmode ? "text-gray-400 text-sm" : "text-gray-500 text-sm"
                  }
                >
                  No relationships found for this selection.
                </div>
              )}
            </div>
            {user === "admin" ? (
              selectedPath?.database ? (
                <button
                  onClick={() => setCreate("Relationship")}
                  className={`w-full mt-4 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 shadow ${darkmode
                      ? "bg-blue-800 text-white hover:bg-blue-900"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  aria-label="Add Relationship"
                >
                  <Plus size={16} />
                  Add Relationship
                </button>
              ) : (
                <div
                  className={`text-center w-full rounded-lg py-2 mt-2 text-sm font-medium border ${darkmode
                      ? "text-blue-200 bg-blue-950 border-blue-900"
                      : "text-blue-700 bg-blue-50 border-blue-100"
                    }`}
                >
                  Choose a database to add relationships
                </div>
              )
            ) : (
              <></>
            )}
          </div>

          <style jsx>{`
            /* Light mode custom scrollbar */
            .custom-scrollbar-light::-webkit-scrollbar {
              width: 8px;
            }

            .custom-scrollbar-light::-webkit-scrollbar-track {
              background: #f1f5f9;
              border-radius: 8px;
            }

            .custom-scrollbar-light::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 8px;
              border: 2px solid #f1f5f9;
            }

            .custom-scrollbar-light::-webkit-scrollbar-thumb:hover {
              background: #94a3b8;
            }

            /* Dark mode custom scrollbar */
            .custom-scrollbar-dark::-webkit-scrollbar {
              width: 8px;
            }

            .custom-scrollbar-dark::-webkit-scrollbar-track {
              background: #1e293b;
              border-radius: 8px;
            }

            .custom-scrollbar-dark::-webkit-scrollbar-thumb {
              background: #475569;
              border-radius: 8px;
              border: 2px solid #1e293b;
            }

            .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
              background: #64748b;
            }

            /* Firefox scrollbar support */
            .custom-scrollbar-light {
              scrollbar-width: thin;
              scrollbar-color: #cbd5e1 #f1f5f9;
            }

            .custom-scrollbar-dark {
              scrollbar-width: thin;
              scrollbar-color: #475569 #1e293b;
            }
          `}</style>
        </>
      );
    case "settings":
      return (
        <div className="space-y-4" aria-label="Settings Panel">
          <h3
            className={`font-semibold flex items-center gap-2 ${darkmode ? "text-blue-200" : "text-gray-800"
              }`}
          >
            <Settings
              className={darkmode ? "text-blue-400" : "text-gray-600"}
              size={20}
            />
            Settings
          </h3>
          <div className="space-y-4 ">
            <div className="w-full flex justify-between items-center px-7">
              <label
                className={`block text-sm font-medium mb-2 ${darkmode ? "text-blue-200" : "text-gray-700"
                  }`}
                htmlFor="darkmode-toggle"
              >
                Theme
              </label>
              <button
                id="darkmode-toggle"
                type="button"
                role="switch"
                aria-checked={
                  typeof window !== "undefined" &&
                  document.documentElement.classList.contains("dark")
                }
                onClick={() => {
                  if (typeof window !== "undefined") {
                    const isDark =
                      document.documentElement.classList.contains("dark");
                    if (isDark) {
                      document.documentElement.classList.remove("dark");
                    } else {
                      document.documentElement.classList.add("dark");
                    }
                  }
                  setDarkmode((prev) => !prev);
                }}
                className={`relative inline-flex h-7 w-16 items-center rounded-full transition-colors focus:outline-none border-2 ${darkmode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-gray-300 border-gray-400"
                  }`}
                aria-label="Toggle dark mode"
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${darkmode ? "translate-x-9" : "translate-x-0"
                    }`}
                />
                <span className="absolute left-1 text-yellow-400 text-xs pointer-events-none select-none">
                  <svg
                    width="18"
                    height="18"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15a5 5 0 100-10 5 5 0 000 10z" />
                  </svg>
                </span>
                <span className="absolute right-1 text-gray-600 text-xs pointer-events-none select-none">
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      );
    default:
      if (
        !selectedPath ||
        (!selectedPath.lob && !selectedPath.subject && !selectedPath.database)
      ) {
        return (
          <div
            className="flex flex-col items-center justify-center h-full py-16"
            aria-label="Nothing Selected"
          >
            <Eye
              className={darkmode ? "text-gray-600 mb-4" : "text-gray-400 mb-4"}
              size={48}
            />
            <div
              className={`text-lg font-semibold mb-2 ${darkmode ? "text-gray-300" : "text-gray-600"
                }`}
            >
              Nothing Selected
            </div>
            <div
              className={
                darkmode
                  ? "text-gray-500 text-sm text-center"
                  : "text-gray-400 text-sm text-center"
              }
            >
              Please select a Line of Business, Subject Area, and Database to
              view details.
            </div>
          </div>
        );
      }
      return (
        <div className="space-y-4" aria-label="Overview Panel">
          <h3
            className={`font-semibold flex items-center gap-2 ${darkmode ? "text-blue-200" : "text-gray-800"
              }`}
          >
            <Eye
              className={darkmode ? "text-indigo-400" : "text-indigo-600"}
              size={20}
            />
            Overview
          </h3>
          <div className="space-y-3">
            <div
              className={`p-4 rounded-lg border ${darkmode
                  ? "bg-gradient-to-r from-blue-950 to-blue-850 border-blue-900"
                  : "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100"
                }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap
                  className={darkmode ? "text-blue-400" : "text-blue-600"}
                  size={16}
                />
                <span
                  className={`font-medium ${darkmode ? "text-blue-200" : "text-blue-800"
                    }`}
                >
                  Quick Stats
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className={darkmode ? "text-blue-200" : "text-gray-600"}>
                    Entities
                  </div>
                  {data.length}
                </div>
                <div>
                  <div className={darkmode ? "text-blue-200" : "text-gray-600"}>
                    Relationships
                  </div>
                  <div
                    className={`font-semibold ${darkmode ? "text-blue-100" : "text-gray-800"
                      }`}
                  >
                    {rels.length}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className={darkmode ? "text-blue-200" : "text-gray-600"}>
                    Source Lineage
                  </div>
                  <div
                    className={`font-semibold ${darkmode ? "text-blue-100" : "text-gray-800"
                      }`}
                  >
                    {lineage.join(" > ")}
                  </div>
                </div>
              </div>
              <div
                className={`mt-2 text-xs space-y-1 ${darkmode ? "text-blue-300" : "text-gray-500"
                  }`}
              >
                {selectedPath?.lob && (
                  <div>
                    <span className="font-semibold">LOB:</span>{" "}
                    {selectedPath.lob}
                  </div>
                )}
                {selectedPath?.subject && (
                  <div>
                    <span className="font-semibold">Subject:</span>{" "}
                    {selectedPath.subject}
                  </div>
                )}
                {selectedPath?.database && (
                  <div>
                    <span className="font-semibold">Database:</span>{" "}
                    {selectedPath.database}
                  </div>
                )}
                {selectedPath?.table && (
                  <div>
                    <span className="font-semibold">Table:</span>{" "}
                    {selectedPath.table}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
  }
};

export default SidebarComponent;
