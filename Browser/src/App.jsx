import React, { useState } from "react";
import {
  Database,
  GitBranch,
  MessageSquare,
  Settings,
  Box,
  Network,
  Eye,
  Save,
  Download,
  Upload,
  Plus,
  Tag,
  Zap,
  RefreshCcw,
  User,
} from "lucide-react";
import ErDiagram from "./ErDiagram";
import { useNavigate } from "react-router-dom";
const VersionControlPanel = () => {
  const [versions] = useState([
    {
      id: 1,
      name: "v1.0.0",
      date: "2024-06-15",
      author: "Kavya",
      current: false,
    },
    {
      id: 2,
      name: "v1.0.1",
      date: "2024-06-17",
      author: "Ananya",
      current: false,
    },
    {
      id: 3,
      name: "v1.1.0",
      date: "2024-06-18",
      author: "Andrew",
      current: false,
    },
    { id: 4, name: "v1.2.0", date: "2024-06-20", author: "You", current: true },
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="text-green-600" size={20} />
        <h3 className="font-semibold text-gray-800">Version Control</h3>
      </div>

      <div className="space-y-2">
        {versions.map((version) => (
          <div
            key={version.id}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              version.current
                ? "bg-green-50 border-green-200 shadow-sm"
                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag
                  size={14}
                  className={
                    version.current ? "text-green-600" : "text-gray-500"
                  }
                />
                <span
                  className={`font-medium ${
                    version.current ? "text-green-800" : "text-gray-700"
                  }`}
                >
                  {version.name}
                </span>
                {version.current && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Current
                  </span>
                )}
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {version.date} • {version.author}
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
        <Save size={16} />
        Save Version
      </button>
    </div>
  );
};

const AnnotationsPanel = () => {
  const [annotations] = useState([
    {
      id: 1,
      type: "entity",
      target: "User",
      note: "Primary entity for authentication",
      color: "blue",
    },
    {
      id: 2,
      type: "relationship",
      target: "User-Order",
      note: "One-to-many relationship",
      color: "green",
    },
    {
      id: 3,
      type: "attribute",
      target: "email",
      note: "Unique constraint required",
      color: "orange",
    },
  ]);

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-50 border-blue-200 text-blue-800",
      green: "bg-green-50 border-green-200 text-green-800",
      orange: "bg-orange-50 border-orange-200 text-orange-800",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="text-purple-600" size={20} />
        <h3 className="font-semibold text-gray-800">Annotations</h3>
      </div>

      <div className="space-y-3">
        {annotations.map((annotation) => (
          <div
            key={annotation.id}
            className={`p-3 rounded-lg border ${getColorClasses(
              annotation.color
            )}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium uppercase tracking-wide">
                {annotation.type}
              </span>
              <span className="text-sm font-semibold">{annotation.target}</span>
            </div>
            <p className="text-sm">{annotation.note}</p>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
        <Plus size={16} />
        Add Annotation
      </button>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Eye },
    { id: "entities", label: "Entities", icon: Box },
    { id: "relationships", label: "Relationships", icon: Network },
    { id: "versions", label: "Version Control", icon: GitBranch },
    { id: "annotations", label: "Annotations", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const renderSidebarContent = () => {
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
            <div className="space-y-2">
              {[
                "customers",
                "accounts",
                "transactions",
                "branches",
                "employees",
              ].map((entity) => (
                <div
                  key={entity}
                  className="p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 cursor-pointer"
                >
                  <div className="font-medium text-gray-800 capitalize">
                    {entity}
                  </div>
                  <div className="text-sm text-gray-500">Click to edit</div>
                </div>
              ))}
            </div>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
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
            <div className="space-y-2">
              {[
                "accounts.customer_id → customers.customer_id",
                "accounts.branch_id → branches.branch_id",
                "transactions.account_id → accounts.account_id",
                "branches.manager_id → employees.employee_id",
                "employees.branch_id → branches.branch_id",
              ].map((rel) => (
                <div
                  key={rel}
                  className="p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 cursor-pointer"
                >
                  <div className="font-medium text-gray-800">{rel}</div>
                  <div className="text-sm text-gray-500">Foreign Key</div>
                </div>
              ))}
            </div>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
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
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans">
      <nav className="w-full h-16 bg-white/80 backdrop-blur-md shadow-lg mb-2 flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Database className="text-white" size={20} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
              DATABEE
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* <button className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Upload size={16} />
            Import
          </button> */}
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <User size={16} />
            Logout
          </button>
          <button className="px-6 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2">
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>
      </nav>

      <div className="w-full h-[calc(100%-4rem)] flex ">
        {/* Enhanced Sidebar */}
        <div className="w-80 h-full bg-white/90 backdrop-blur-sm shadow-xl  mr-4 ml-2 rounded-3xl flex flex-col ">
          {/* Sidebar Navigation */}
          <div className="border-b border-gray-200 p-4 b">
            <div className="grid grid-cols-3 gap-1 bg-gray-100 rounded-lg p-1">
              {sidebarItems.slice(0, 3).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-3 py-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                      activeTab === item.id
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <Icon size={14} />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Sidebar Items */}
          <div className="px-4 py-2 border-b border-gray-200">
            <div className="space-y-1">
              {sidebarItems.slice(3).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${
                      activeTab === item.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            {renderSidebarContent()}
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1">
          <div className="w-full h-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="w-full h-full p-6">
              <ErDiagram />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
