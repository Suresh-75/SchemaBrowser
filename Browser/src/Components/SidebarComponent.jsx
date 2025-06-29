import React from "react";
import { Box, Eye, Network, Plus, Settings, Zap } from "lucide-react";
import VersionControlPanel from "./VersionControlPanel";
import AnnotationsPanel from "./Annotations";

// businessData should be passed as a prop or imported as needed

const businessData = {
  "Branded Cards": {
    Accounts: {
      databases: {
        card_accounts_db: {
          entities: ["card_accounts", "card_holders", "card_limits"],
          relationships: [
            "card_accounts.customer_id → customers.customer_id",
            "card_accounts.account_id → card_limits.account_id",
          ],
        },
        card_profile_db: {
          entities: ["profile", "profile_limits"],
          relationships: ["profile.profile_id → card_holders.profile_id"],
        },
      },
    },
    Payments: {
      databases: {
        card_payments_db: {
          entities: ["card_transactions", "payments", "authorizations"],
          relationships: [
            "card_transactions.account_id → card_accounts.account_id",
          ],
        },
        transaction_db: {
          entities: ["transactions", "payments"],
          relationships: ["transactions.payment_id → payments.payment_id"],
        },
      },
    },
  },
  // ... Add other LOBs and subject areas as needed
};

function getEntitiesAndRelationships(selectedPath) {
  // Add a null/undefined check for selectedPath
  if (!selectedPath || !selectedPath.lob) {
    return {
      entities: [],
      relationships: [],
    };
  }
  // Implement logic as per your businessData structure
  // Placeholder: return empty arrays
  return {
    entities: [],
    relationships: [],
  };
}

// Helper to get tables for the current selection
function getTablesForSelection(selectedPath, businessData) {
  if (
    selectedPath.lob &&
    selectedPath.subject &&
    selectedPath.database &&
    businessData[selectedPath.lob] &&
    businessData[selectedPath.lob][selectedPath.subject] &&
    businessData[selectedPath.lob][selectedPath.subject].databases &&
    businessData[selectedPath.lob][selectedPath.subject].databases[
      selectedPath.database
    ] &&
    businessData[selectedPath.lob][selectedPath.subject].databases[
      selectedPath.database
    ].entities
  ) {
    // Specific database selected
    return businessData[selectedPath.lob][selectedPath.subject].databases[
      selectedPath.database
    ].entities;
  }
  if (
    selectedPath.lob &&
    selectedPath.subject &&
    businessData[selectedPath.lob] &&
    businessData[selectedPath.lob][selectedPath.subject]
  ) {
    // Subject selected, show all tables in all databases under this subject
    const dbs = businessData[selectedPath.lob][selectedPath.subject].databases;
    return Object.values(dbs).flatMap((db) => db.entities || []);
  }
  if (selectedPath.lob && businessData[selectedPath.lob]) {
    // LOB selected, show all tables in all subjects and databases under this LOB
    let tables = [];
    Object.values(businessData[selectedPath.lob]).forEach((subjectObj) => {
      const dbs = subjectObj.databases;
      tables = tables.concat(
        ...Object.values(dbs).flatMap((db) => db.entities || [])
      );
    });
    return tables;
  }
  return [];
}

const SidebarComponent = ({
  activeTab = "overview",
  selectedPath,
  setCreate,
  businessData: propBusinessData,
}) => {
  // Use prop businessData if provided, else fallback to local
  const data = propBusinessData || businessData;

  // Build lineage up to table
  let lineage = [];
  if (selectedPath?.lob) lineage.push(selectedPath.lob);
  if (selectedPath?.subject) lineage.push(selectedPath.subject);
  if (selectedPath?.database) lineage.push(selectedPath.database);
  if (selectedPath?.table) lineage.push(selectedPath.table);

  // Get tables/entities for the current selection
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
        <div className="h-full flex flex-col space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
            <Box className="text-blue-600" size={20} />
            Entities
          </h3>
          {/* Scrollable entities list */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
            {tables.length > 0 ? (
              tables.map((entity) => (
                <div
                  key={entity}
                  className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 shadow hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-3"
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
        <div className="h-full flex flex-col space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
            <Network className="text-green-600" size={20} />
            Relationships
          </h3>
          <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
            {relationships.length > 0 ? (
              relationships.map((rel) => (
                <div
                  key={rel}
                  className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100 shadow hover:shadow-md transition-all cursor-pointer flex items-center gap-3"
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
              className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow"
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
    default:
      // Overview: show stats for current selection
      if (
        !selectedPath ||
        (!selectedPath.lob && !selectedPath.subject && !selectedPath.database)
      ) {
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
      }
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
                  <div className="text-gray-600">Entities</div>
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
              <div className="mt-2 text-xs text-gray-500">
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
              </div>
            </div>
          </div>
        </div>
      );
  }
};

export default SidebarComponent;
