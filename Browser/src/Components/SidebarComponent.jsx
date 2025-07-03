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
}) => {
  // Initialize 'data' as an empty array since it will hold a list of tables
  const [data, setData] = useState([]);
  // 'rels' will hold the processed relationship strings with their original IDs
  const [rels, setRels] = useState([]);

  useEffect(() => {
    // Define an async function to fetch all necessary data
    const fetchAllData = async () => {
      if (!selectedPath || !selectedPath.database) {
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
          } `}
          aria-label="Entities Panel"
        >
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
            <Box className="text-blue-600" size={20} />
            Entities
          </h3>
          <div className="flex-1 overflow-y-scroll space-y-2 pr-1">
            {data.length > 0 ? (
              data.map((entity) => (
                <div
                  // Use entity.id as the key for stable list rendering
                  key={entity.id}
                  className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 shadow hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-3"
                  tabIndex={0}
                  aria-label={`Entity: ${entity.name}`}
                >
                  <Box className="text-blue-500" size={20} />
                  <div>
                    <div className="font-semibold text-gray-800 capitalize text-base">
                      {entity.name}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-sm">
                No entities found for this selection.
              </div>
            )}
          </div>
          {user === "admin" ? (
            selectedPath?.database ? (
              <button
                onClick={() => setCreate("Entity")}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow"
                aria-label="Add Entity"
              >
                <Plus size={16} />
                Add Entity
              </button>
            ) : (
              <div className="text-center w-full text-blue-700 bg-blue-50 rounded-lg py-2 mt-2 text-sm font-medium border border-blue-100">
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
          className=" flex flex-col space-y-4"
          aria-label="Relationships Panel"
        >
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
            <Network className="text-blue-600" size={20} />
            Relationships
          </h3>
          <div className="flex-1 min-h-0 overflow-y-scroll space-y-3 pr-1">
            {rels.length > 0 ? (
              rels.map((relItem) => (
                <div
                  key={relItem.id}
                  className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100 shadow hover:shadow-md transition-all cursor-pointer flex items-center gap-3"
                  tabIndex={0}
                  aria-label={`Relationship: ${relItem.display}`}
                >
                  <Network className="text-green-500" size={20} />
                  <div>
                    <div className="font-semibold text-gray-800 text-base">
                      {relItem.display} {/* Display the processed string */}
                    </div>
                    <div className="text-xs text-gray-500">Foreign Key</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-sm">
                No relationships found for this selection.
              </div>
            )}
          </div>
          {user === "admin" ? (
            selectedPath?.database ? (
              <button
                onClick={() => setCreate("Relationship")}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow"
                aria-label="Add Relationship"
              >
                <Plus size={16} />
                Add Relationship
              </button>
            ) : (
              <div className="text-center w-full text-blue-700 bg-blue-50 rounded-lg py-2 mt-2 text-sm font-medium border border-blue-100">
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
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Settings className="text-gray-600" size={20} />
            Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-lg"
                aria-label="Theme Selector"
              >
                <option>Light</option>
                <option>Dark</option>
                <option>Auto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-save
              </label>
              <input
                type="checkbox"
                className="rounded"
                defaultChecked
                aria-label="Enable auto-save"
              />
              <span className="ml-2 text-sm text-gray-600">
                Enable auto-save
              </span>
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
            <Eye className="text-gray-400 mb-4" size={48} />
            <div className="text-lg font-semibold text-gray-600 mb-2">
              Nothing Selected
            </div>
            <div className="text-gray-400 text-sm text-center">
              Please select a Line of Business, Subject Area, and Database to
              view details.
            </div>
          </div>
        );
      }
      return (
        <div className="space-y-4" aria-label="Overview Panel">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Eye className="text-indigo-600" size={20} />
            Overview
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="text-blue-600" size={16} />
                <span className="font-medium text-blue-800">Quick Stats</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-gray-600">Entities</div>
                  {data.length}
                </div>
                <div>
                  <div className="text-gray-600">Relationships</div>
                  <div className="font-semibold text-gray-800">
                    {rels.length}{" "}
                    {/* Display relationships count using rels.length */}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-gray-600">Source Lineage</div>
                  <div className="font-semibold text-gray-800">
                    {lineage.join(" > ")}
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 space-y-1">
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
