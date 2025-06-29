import React from "react";
import { Eye, Zap, Box, Network, Settings, Plus } from "lucide-react";

// Helper to get tables for the current selection
function getTablesForSelection(selectedPath, businessData) {
  if (
    selectedPath.lob &&
    selectedPath.subject &&
    selectedPath.database &&
    businessData[selectedPath.lob] &&
    businessData[selectedPath.lob][selectedPath.subject] &&
    businessData[selectedPath.lob][selectedPath.subject].databases &&
    Array.isArray(businessData[selectedPath.lob][selectedPath.subject].databases[selectedPath.database])
  ) {
    // Specific database selected
    return businessData[selectedPath.lob][selectedPath.subject].databases[selectedPath.database];
  }
  if (
    selectedPath.lob &&
    selectedPath.subject &&
    businessData[selectedPath.lob] &&
    businessData[selectedPath.lob][selectedPath.subject]
  ) {
    // Subject selected, show all tables in all databases under this subject
    const dbs = businessData[selectedPath.lob][selectedPath.subject].databases;
    return Object.values(dbs).flat();
  }
  if (
    selectedPath.lob &&
    businessData[selectedPath.lob]
  ) {
    // LOB selected, show all tables in all subjects and databases under this LOB
    let tables = [];
    Object.values(businessData[selectedPath.lob]).forEach(subjectObj => {
      const dbs = subjectObj.databases;
      tables = tables.concat(...Object.values(dbs));
    });
    return tables;
  }
  return [];
}

const SidebarComponent = ({
  activeTab,
  selectedPath,
  create,
  setCreate,
  businessData,
}) => {
  // Build lineage up to table
  let lineage = [];
  if (selectedPath.lob) lineage.push(selectedPath.lob);
  if (selectedPath.subject) lineage.push(selectedPath.subject);
  if (selectedPath.database) lineage.push(selectedPath.database);
  if (selectedPath.table) lineage.push(selectedPath.table);

  // Get tables for the current selection
  const tables = getTablesForSelection(selectedPath, businessData);

  // Overview panel
  if (activeTab === "overview") {
    return (
      <div className="space-y-4">
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
                <div className="text-gray-600">Tables</div>
                <div className="font-semibold text-gray-800">
                  {tables.length}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Lineage</div>
                <div className="font-semibold text-gray-800">
                  {lineage.join(" > ")}
                </div>
              </div>
            </div>
            {/* Removed the grey lineage and tables list */}
          </div>
        </div>
      </div>
    );
  }

  // Entities tab
  if (activeTab === "entities") {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Box className="text-blue-600" size={20} />
          Tables
        </h3>
        <div className="space-y-3">
          {tables.length > 0 ? (
            tables.map((table) => (
              <div
                key={table}
                className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 shadow hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-3"
              >
                <Box className="text-blue-500" size={20} />
                <div>
                  <div className="font-semibold text-gray-800 capitalize text-base">
                    {table}
                  </div>
                  <div className="text-xs text-gray-500">Table</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-sm">
              No tables found for this selection.
            </div>
          )}
        </div>
        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow"
          onClick={() => setCreate && setCreate("Entity")}
        >
          <Plus size={16} />
          Add Table
        </button>
      </div>
    );
  }

  // Relationships tab (placeholder)
  if (activeTab === "relationships") {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Network className="text-green-600" size={20} />
          Relationships
        </h3>
        <div className="space-y-3">
          <div className="text-gray-500 text-sm">
            Relationships are not defined in this structure.
          </div>
        </div>
        <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow"
          onClick={() => setCreate && setCreate("Relationship")}
        >
          <Plus size={16} />
          Add Relationship
        </button>
      </div>
    );
  }

  // Settings tab (placeholder)
  if (activeTab === "settings") {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Settings className="text-gray-600" size={20} />
          Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <select className="w-full p-2 border border-gray-300 rounded-lg">
              <option>Light</option>
              <option>Dark</option>
              <option>Auto</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auto-save
            </label>
            <input type="checkbox" className="rounded" defaultChecked />
            <span className="ml-2 text-sm text-gray-600">
              Enable auto-save
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="flex flex-col items-center justify-center h-full py-16">
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
};

export default SidebarComponent;
