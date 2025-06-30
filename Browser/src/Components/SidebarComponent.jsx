import React from "react";
import { Box, Eye, Network, Plus, Settings, Zap } from "lucide-react";
import VersionControlPanel from "./VersionControlPanel";
import AnnotationsPanel from "./Annotations";

// Enhanced: Returns entities and relationships for the current selection
function getEntitiesAndRelationships(selectedPath, businessData) {
  if (!selectedPath || !selectedPath.lob) {
    return { entities: [], relationships: [] };
  }
  // Database selected
  if (
    selectedPath.lob &&
    selectedPath.subject &&
    selectedPath.database &&
    businessData[selectedPath.lob] &&
    businessData[selectedPath.lob][selectedPath.subject] &&
    businessData[selectedPath.lob][selectedPath.subject].databases &&
    businessData[selectedPath.lob][selectedPath.subject].databases[
      selectedPath.database
    ]
  ) {
    const db =
      businessData[selectedPath.lob][selectedPath.subject].databases[
        selectedPath.database
      ];
    return {
      entities: db.entities || [],
      relationships: db.relationships || [],
    };
  }
  // Subject selected: aggregate all entities/relationships in all databases
  if (
    selectedPath.lob &&
    selectedPath.subject &&
    businessData[selectedPath.lob] &&
    businessData[selectedPath.lob][selectedPath.subject]
  ) {
    const dbs = businessData[selectedPath.lob][selectedPath.subject].databases;
    return {
      entities: Object.values(dbs).flatMap((db) => db.entities || []),
      relationships: Object.values(dbs).flatMap((db) => db.relationships || []),
    };
  }
  // LOB selected: aggregate all entities/relationships in all subjects/databases
  if (selectedPath.lob && businessData[selectedPath.lob]) {
    let entities = [];
    let relationships = [];
    Object.values(businessData[selectedPath.lob]).forEach((subjectObj) => {
      const dbs = subjectObj.databases;
      entities = entities.concat(
        ...Object.values(dbs).flatMap((db) => db.entities || [])
      );
      relationships = relationships.concat(
        ...Object.values(dbs).flatMap((db) => db.relationships || [])
      );
    });
    return { entities, relationships };
  }
  return { entities: [], relationships: [] };
}

// Enhanced: Returns entities (tables) for the current selection, supporting both database-object and array structures
function getTablesForSelection(selectedPath, businessData) {
  if (
    selectedPath.lob &&
    selectedPath.subject &&
    selectedPath.database &&
    businessData[selectedPath.lob] &&
    businessData[selectedPath.lob][selectedPath.subject]
  ) {
    const subjectObj = businessData[selectedPath.lob][selectedPath.subject];
    // If databases is an object (db: [tables...])
    if (
      subjectObj.databases &&
      !Array.isArray(subjectObj.databases) &&
      subjectObj.databases[selectedPath.database]
    ) {
      return subjectObj.databases[selectedPath.database];
    }
    // If databases is an array and tables is an array
    if (
      Array.isArray(subjectObj.databases) &&
      Array.isArray(subjectObj.tables)
    ) {
      return subjectObj.tables;
    }
  }
  // Subject selected: aggregate all tables in all databases or tables array
  if (
    selectedPath.lob &&
    selectedPath.subject &&
    businessData[selectedPath.lob] &&
    businessData[selectedPath.lob][selectedPath.subject]
  ) {
    const subjectObj = businessData[selectedPath.lob][selectedPath.subject];
    let tables = [];
    if (subjectObj.databases && !Array.isArray(subjectObj.databases)) {
      tables = Object.values(subjectObj.databases).flat();
    }
    if (Array.isArray(subjectObj.tables)) {
      tables = tables.concat(subjectObj.tables);
    }
    return tables;
  }
  // LOB selected: aggregate all tables in all subjects
  if (selectedPath.lob && businessData[selectedPath.lob]) {
    let tables = [];
    Object.values(businessData[selectedPath.lob]).forEach((subjectObj) => {
      if (subjectObj.databases && !Array.isArray(subjectObj.databases)) {
        tables = tables.concat(...Object.values(subjectObj.databases).flat());
      }
      if (Array.isArray(subjectObj.tables)) {
        tables = tables.concat(subjectObj.tables);
      }
    });
    return tables;
  }
  return [];
}

// Helper to count all tables for a given selection (LOB, Subject, or Database)
function countTables(selectedPath, businessData) {
  // Database selected
  if (
    selectedPath.lob &&
    selectedPath.subject &&
    selectedPath.database &&
    businessData[selectedPath.lob] &&
    businessData[selectedPath.lob][selectedPath.subject]
  ) {
    const subjectObj = businessData[selectedPath.lob][selectedPath.subject];
    if (
      subjectObj.databases &&
      !Array.isArray(subjectObj.databases) &&
      subjectObj.databases[selectedPath.database]
    ) {
      return subjectObj.databases[selectedPath.database].length;
    }
    if (
      Array.isArray(subjectObj.databases) &&
      Array.isArray(subjectObj.tables)
    ) {
      return subjectObj.tables.length;
    }
  }
  // Subject selected
  if (
    selectedPath.lob &&
    selectedPath.subject &&
    businessData[selectedPath.lob] &&
    businessData[selectedPath.lob][selectedPath.subject]
  ) {
    const subjectObj = businessData[selectedPath.lob][selectedPath.subject];
    let tables = [];
    if (subjectObj.databases && !Array.isArray(subjectObj.databases)) {
      tables = Object.values(subjectObj.databases).flat();
    }
    if (Array.isArray(subjectObj.tables)) {
      tables = tables.concat(subjectObj.tables);
    }
    return tables.length;
  }
  // LOB selected
  if (selectedPath.lob && businessData[selectedPath.lob]) {
    let tables = [];
    Object.values(businessData[selectedPath.lob]).forEach((subjectObj) => {
      if (subjectObj.databases && !Array.isArray(subjectObj.databases)) {
        tables = tables.concat(...Object.values(subjectObj.databases).flat());
      }
      if (Array.isArray(subjectObj.tables)) {
        tables = tables.concat(subjectObj.tables);
      }
    });
    return tables.length;
  }
  return 0;
}

// // Helper to count all relationships for a given selection
// function countRelationships(selectedPath, businessData) {
//   // Database selected
//   if (
//     selectedPath.lob &&
//     selectedPath.subject &&
//     selectedPath.database &&
//     businessData[selectedPath.lob] &&
//     businessData[selectedPath.lob][selectedPath.subject] &&
//     businessData[selectedPath.lob][selectedPath.subject].databases &&
//     businessData[selectedPath.lob][selectedPath.subject].databases[
//       selectedPath.database
//     ]
//   ) {
//     const db =
//       businessData[selectedPath.lob][selectedPath.subject].databases[
//         selectedPath.database
//       ];
//     return (db.relationships && db.relationships.length) || 0;
//   }
//   // Subject selected
//   if (
//     selectedPath.lob &&
//     selectedPath.subject &&
//     businessData[selectedPath.lob] &&
//     businessData[selectedPath.lob][selectedPath.subject]
//   ) {
//     const dbs = businessData[selectedPath.lob][selectedPath.subject].databases;
//     if (dbs && !Array.isArray(dbs)) {
//       return Object.values(dbs).flatMap((db) =>
//         db.relationships ? db.relationships : []
//       ).length;
//     }
//     return 0;
//   }
//   // LOB selected
//   if (selectedPath.lob && businessData[selectedPath.lob]) {
//     let relationships = [];
//     Object.values(businessData[selectedPath.lob]).forEach((subjectObj) => {
//       const dbs = subjectObj.databases;
//       if (dbs && !Array.isArray(dbs)) {
//         relationships = relationships.concat(
//           ...Object.values(dbs).flatMap((db) => db.relationships || [])
//         );
//       }
//     });
//     return relationships.length;
//   }
//   return 0;
// }

const SidebarComponent = ({
  activeTab = "overview",
  selectedPath,
  setCreate,
  businessData,
}) => {
  const data = businessData;

  let lineage = [];
  if (selectedPath?.lob) lineage.push(selectedPath.lob);
  if (selectedPath?.subject) lineage.push(selectedPath.subject);
  if (selectedPath?.database) lineage.push(selectedPath.database);
  if (selectedPath?.table) lineage.push(selectedPath.table);

  const tables = getTablesForSelection(selectedPath, data);
  const { entities, relationships } = getEntitiesAndRelationships(
    selectedPath,
    data
  );

  switch (activeTab) {
    case "versions":
      return <VersionControlPanel />;
    case "annotations":
      return <AnnotationsPanel />;
    case "entities":
      return (
        <div
          className=" flex flex-col space-y-4  max-h-[25rem]"
          aria-label="Entities Panel"
        >
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
            <Box className="text-blue-600" size={20} />
            Entities
          </h3>
          <div className="flex-1 overflow-y-scroll   space-y-2 pr-1">
            {tables.length > 0 ? (
              tables.map((entity) => (
                <div
                  key={entity}
                  className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 shadow hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-3"
                  tabIndex={0}
                  aria-label={`Entity: ${entity}`}
                >
                  <Box className="text-blue-500" size={20} />
                  <div>
                    <div className="font-semibold text-gray-800 capitalize text-base">
                      {entity}
                    </div>
                    <div className="text-xs text-gray-500">Click to edit</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-sm">
                No entities found for this selection.
              </div>
            )}
          </div>
          {selectedPath?.database ? (
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
          )}
        </div>
      );
    case "relationships":
      return (
        <div
          className=" h-[25rem]flex flex-col space-y-4"
          aria-label="Relationships Panel"
        >
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
            <Network className="text-blue-600" size={20} />
            Relationships
          </h3>
          <div className="flex-1 min-h-0 overflow-y-scroll space-y-3 pr-1">
            {relationships.length > 0 ? (
              relationships.map((rel) => (
                <div
                  key={rel}
                  className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100 shadow hover:shadow-md transition-all cursor-pointer flex items-center gap-3"
                  tabIndex={0}
                  aria-label={`Relationship: ${rel}`}
                >
                  <Network className="text-green-500" size={20} />
                  <div>
                    <div className="font-semibold text-gray-800 text-base">
                      {rel}
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
          {selectedPath?.database ? (
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
                  <div className="font-semibold text-gray-800">
                    {countTables(selectedPath, data)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Relationships</div>
                  <div className="font-semibold text-gray-800">
                    {/* {countRelationships(selectedPath, data)} */}0
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
