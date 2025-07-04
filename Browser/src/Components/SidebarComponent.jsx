import React, { useEffect, useState } from "react";
import { Box, Eye, Network, Plus, Settings, Zap } from "lucide-react";
import VersionControlPanel from "./VersionControlPanel";
import AnnotationsPanel from "./Annotations";
import axios from "axios";

const SidebarComponent = ({
  user,
  activeTab = "overview",
  selectedPath,
  setCreate,
  setDarkmode,
  darkmode, // <-- add darkmode prop
}) => {
  const [data, setData] = useState([]);
  const [rels, setRels] = useState([]);

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
        setData(tablesResponse.data);
        const relationshipsResponse = await axios.get(
          `http://localhost:5000/api/er_relationships/${selectedPath.database}`
        );
        const relsData = relationshipsResponse.data;
        const processedRels = relsData.map((rel) => ({
          id: rel.id,
          display: `${rel.from_column} --> ${rel.to_column}`,
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
  }, [selectedPath]);

  let lineage = [];
  if (selectedPath?.lob) lineage.push(selectedPath.lob);
  if (selectedPath?.subject) lineage.push(selectedPath.subject);
  if (selectedPath?.database) lineage.push(selectedPath.database);
  if (selectedPath?.table) lineage.push(selectedPath.table);

  // Render content based on the activeTab prop
  switch (activeTab) {
    case "versions":
      return <VersionControlPanel />;
    case "annotations":
      return <AnnotationsPanel />;
    case "entities":
      return (
        <div
          className={`flex flex-col space-y-4 ${
            user === "admin" ? "max-h-[25rem]" : "max-h-[30rem]"
          }`}
          aria-label="Entities Panel"
        >
          <h3
            className={`font-semibold flex items-center gap-2 mb-2 ${
              darkmode ? "text-blue-200" : "text-gray-800"
            }`}
          >
            <Box
              className={darkmode ? "text-blue-400" : "text-blue-600"}
              size={20}
            />
            Entities
          </h3>
          <div className="flex-1 overflow-y-scroll space-y-2 pr-1">
            {data.length > 0 ? (
              data.map((entity) => (
                <div
                  key={entity.id}
                  className={`p-4 rounded-xl border shadow hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-3 ${
                    darkmode
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
                  <div>
                    <div
                      className={`font-semibold capitalize text-base ${
                        darkmode ? "text-blue-100" : "text-gray-800"
                      }`}
                    >
                      {entity.name}
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
                No entities found for this selection.
              </div>
            )}
          </div>
          {user === "admin" ? (
            selectedPath?.database ? (
              <button
                onClick={() => setCreate("Entity")}
                className={`w-full mt-4 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 shadow ${
                  darkmode
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
                className={`text-center w-full rounded-lg py-2 mt-2 text-sm font-medium border ${
                  darkmode
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
      );
    case "relationships":
      return (
        <div
          className="flex flex-col space-y-4"
          aria-label="Relationships Panel"
        >
          <h3
            className={`font-semibold flex items-center gap-2 mb-2 ${
              darkmode ? "text-blue-200" : "text-gray-800"
            }`}
          >
            <Network
              className={darkmode ? "text-blue-400" : "text-blue-600"}
              size={20}
            />
            Relationships
          </h3>
          <div className="flex-1 min-h-0 overflow-y-scroll space-y-3 pr-1">
            {rels.length > 0 ? (
              rels.map((relItem) => (
                <div
                  key={relItem.id}
                  className={`p-4 rounded-xl border shadow hover:shadow-md transition-all cursor-pointer flex items-center gap-3 ${
                    darkmode
                      ? "bg-gradient-to-r from-blue-950 to-blue-950 border-blue-900"
                      : "bg-gradient-to-r from-blue-200 to-green-50 border-green-100"
                  }`}
                  tabIndex={0}
                  aria-label={`Relationship: ${relItem.display}`}
                >
                  <Network
                    className={darkmode ? "text-blue-300" : "text-blue-600"}
                    size={20}
                  />
                  <div>
                    <div
                      className={`font-semibold text-base ${
                        darkmode ? "text-blue-100" : "text-gray-800"
                      }`}
                    >
                      {relItem.display}
                    </div>
                    <div
                      className={
                        darkmode
                          ? "text-xs text-gray-400"
                          : "text-xs text-gray-500"
                      }
                    >
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
                className={`w-full mt-4 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 shadow ${
                  darkmode
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
                className={`text-center w-full rounded-lg py-2 mt-2 text-sm font-medium border ${
                  darkmode
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
      );
    case "settings":
      return (
        <div className="space-y-4" aria-label="Settings Panel">
          <h3
            className={`font-semibold flex items-center gap-2 ${
              darkmode ? "text-blue-200" : "text-gray-800"
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
                className={`block text-sm font-medium mb-2 ${
                  darkmode ? "text-blue-200" : "text-gray-700"
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
                className={`relative inline-flex h-7 w-16 items-center rounded-full transition-colors focus:outline-none border-2 ${
                  darkmode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-gray-300 border-gray-400"
                }`}
                aria-label="Toggle dark mode"
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                    darkmode ? "translate-x-9" : "translate-x-0"
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
              className={`text-lg font-semibold mb-2 ${
                darkmode ? "text-gray-300" : "text-gray-600"
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
            className={`font-semibold flex items-center gap-2 ${
              darkmode ? "text-blue-200" : "text-gray-800"
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
              className={`p-4 rounded-lg border ${
                darkmode
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
                  className={`font-medium ${
                    darkmode ? "text-blue-200" : "text-blue-800"
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
                    className={`font-semibold ${
                      darkmode ? "text-blue-100" : "text-gray-800"
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
                    className={`font-semibold ${
                      darkmode ? "text-blue-100" : "text-gray-800"
                    }`}
                  >
                    {lineage.join(" > ")}
                  </div>
                </div>
              </div>
              <div
                className={`mt-2 text-xs space-y-1 ${
                  darkmode ? "text-blue-300" : "text-gray-500"
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
