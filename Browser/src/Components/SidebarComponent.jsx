import { Box, Eye, Network, Plus, Settings, Zap } from "lucide-react";
import VersionControlPanel from "./VersionControlPanel";
import AnnotationsPanel from "./Annotations";

function SidebarComponent({ activeTab = "overview" }) {
  console.log("Active Tab:", activeTab);
  switch (activeTab) {
    case "versions":
      return <VersionControlPanel />;
    case "annotations":
      return <AnnotationsPanel />;
    case "entities":
      return (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Box className="text-blue-600" size={20} />
            Entities
          </h3>
          <div className="space-y-3">
            {[
              "customers",
              "accounts",
              "transactions",
              "branches",
              "employees",
            ].map((entity) => (
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
            ))}
          </div>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow">
            <Plus size={16} />
            Add Entity
          </button>
        </div>
      );
    case "relationships":
      return (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Network className="text-green-600" size={20} />
            Relationships
          </h3>
          <div className="space-y-3">
            {[
              "accounts.customer_id → customers.customer_id",
              "accounts.branch_id → branches.branch_id",
              "transactions.account_id → accounts.account_id",
              "branches.manager_id → employees.employee_id",
              "employees.branch_id → branches.branch_id",
            ].map((rel) => (
              <div
                key={rel}
                className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100 shadow hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-3"
              >
                <Network className="text-green-500" size={20} />
                <div>
                  <div className="font-semibold text-gray-800 text-base">
                    {rel}
                  </div>
                  <div className="text-xs text-gray-500">Foreign Key</div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow">
            <Plus size={16} />
            Add Relationship
          </button>
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
                  <div className="font-semibold text-gray-800">5</div>
                </div>
                <div>
                  <div className="text-gray-600">Relations</div>
                  <div className="font-semibold text-gray-800">5</div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">
                Recent Activity
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div>• Added employees entity</div>
                <div>• Added branches entity</div>
                <div>• Linked accounts to customers</div>
                <div>• Linked transactions to accounts</div>
                <div>• Linked employees to branches</div>
              </div>
            </div>
          </div>
        </div>
      );
  }
}

export default SidebarComponent;
