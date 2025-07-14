App.jsx;
import React, { useState } from "react";
import {
  Database,
  GitBranch,
  MessageSquare,
  Settings,
  Box,
  Network,
  Eye,
  User,
  Table,
  ArrowBigLeft,
  LogOutIcon,
} from "lucide-react";
import DatabaseTabs from "./Components/DatabaseTabs";
import { useNavigate } from "react-router-dom";
import SidebarComponent from "./Components/SidebarComponent";
import SearchBar from "./Components/SearchBar";
import FilterBar from "./Components/FilterBar";
import AddEntityComponent from "./Components/AddEntity";
import AddRel from "./Components/AddRel";
import { useLocation } from "react-router-dom";
import { ReactFlowProvider } from "@xyflow/react";
import AddErDiagram from "./Components/AddErDiagram";

export default function App() {
  const location = useLocation();
  const { user } = location.state || {};
  const [activeTab, setActiveTab] = useState("overview");
  const [create, setCreate] = useState("");
  const [showTables, setShowTables] = useState(false);
  const [darkmode, setDarkmode] = useState(true);
  const [erLoading, setErLoading] = useState(false);
  const navigate = useNavigate();
  //er diagram state
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedErDiagram, setSelectedErDiagram] = useState("");
  const [selectedTable, setSelectedTable] = useState();
  const [selectedPath, setSelectedPath] = useState({
    lob: null,
    subject: null,
    database: null,
    table: null,
  });

  // Centralized selection logic for both FilterBar and SearchBar
  const handleSelection = (path) => {
    setSelectedPath(path);
    setActiveTab("overview");
  };

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Eye },
    { id: "entities", label: "Entities", icon: Box },
    { id: "relationships", label: "Relationships", icon: Network },
    // { id: "versions", label: "Version Control", icon: GitBranch },
    // { id: "annotations", label: "Annotations", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div
      className={`min-h-screen min-w-screen font-sans overflow-hidden flex flex-col ${
        darkmode
          ? "bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-black"
      }`}
    >
      {create == "Entity" && (
        <>
          <div className="fixed inset-0 bg-black/40 z-20 pointer-events-auto"></div>
          <AddEntityComponent
            selectedPath={selectedPath}
            setCreate={setCreate}
            darkmode={darkmode}
          />
        </>
      )}
      {create == "Relationship" && (
        <>
          <div className="fixed inset-0 bg-black/40 z-20 pointer-events-auto"></div>
          <AddRel
            edges={edges}
            setCreate={setCreate}
            setNodes={setNodes}
            setEdges={setEdges}
            darkmode={darkmode}
            selectedPath={selectedPath}
          />
        </>
      )}
      {create == "erdiagram" && (
        <>
          <div className="fixed inset-0 bg-black/40 z-20 pointer-events-auto"></div>
          <AddErDiagram
            edges={edges}
            setCreate={setCreate}
            setNodes={setNodes}
            setEdges={setEdges}
            darkmode={darkmode}
            selectedPath={selectedPath}
          />
        </>
      )}
      <nav
        className={`w-full h-20 ${
          darkmode
            ? "bg-slate-900/90 border-indigo-900"
            : "bg-white/90 border-indigo-100"
        } backdrop-blur-lg shadow-lg flex items-center justify-between px-10 rounded-b-3xl border-b z-10`}
      >
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                darkmode ? "bg-blue-800" : "bg-blue-400"
              }`}
            >
              <Database className="text-white" size={28} />
            </div>
            <h1
              className={`text-2xl md:text-3xl font-extrabold bg-clip-text tracking-wide drop-shadow ${
                darkmode
                  ? "bg-blue-300 text-transparent"
                  : "bg-blue-400 text-transparent"
              }`}
              style={{
                backgroundImage: darkmode
                  ? "linear-gradient(to right, #60a5fa, #818cf8)"
                  : "linear-gradient(to right, #60a5fa, #818cf8)",
              }}
            >
              DATABEE
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            className={`px-4 py-2 text-base border rounded-xl transition-all flex items-center gap-2 shadow-sm font-semibold ${
              darkmode
                ? "bg-slate-900 border-gray-700 text-white hover:bg-blue-950 hover:border-blue-800"
                : "bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-300"
            }`}
          >
            <User size={18} />
            {user == "admin" ? "Modeler" : "Analyst"}
          </button>
          <button
            className={` px-3 py-2 rounded-lg font-semibold transition-all ${
              darkmode
                ? "bg-slate-800 text-blue-200 hover:bg-blue-900"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
            onClick={() => setDarkmode((d) => !d)}
            title="Toggle dark mode"
          >
            {darkmode ? "🌙" : "☀️"}
          </button>
          <button
            className={`transition-all cursor-pointer ${
              darkmode
                ? "hover:text-red-400 text-blue-300"
                : "hover:text-red-600 text-blue-600"
            }`}
            onClick={() => navigate("/")}
          >
            <LogOutIcon />
          </button>
        </div>
      </nav>
      {/* FilterBar */}
      <div className="flex-shrink-0 px-5 py-3 flex-wrap">
        <FilterBar
          setSelectedTable={setSelectedTable}
          user={user}
          selectedPath={selectedPath}
          onSelect={handleSelection}
          setSelectedPath={setSelectedPath}
          darkmode={darkmode}
        />
      </div>

      <div
        className={`flex flex-1 px-4 pb-4 gap-4 ${
          create == "Entity" ? "pointer-events-none" : ""
        }`}
      >
        {/* Sidebar */}
        <div
          className={`min-w-[23rem] max-w-xs backdrop-blur-sm rounded-3xl flex flex-col border shadow-xl ${
            darkmode
              ? "bg-slate-900/90 border-indigo-900"
              : "bg-white/90 border-indigo-100"
          }`}
        >
          <div
            className={`border-b p-3 ${
              darkmode ? "border-gray-800" : "border-gray-200"
            }`}
          >
            <div
              className={`grid grid-cols-3 gap-1 rounded-lg p-1 ${
                darkmode ? "bg-slate-800" : "bg-gray-100"
              }`}
            >
              {sidebarItems.slice(0, 3).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-2 py-2 rounded-md text-xs font-medium transition-all flex flex-col items-center justify-center gap-1 ${
                      activeTab === item.id
                        ? darkmode
                          ? "bg-slate-900 text-blue-300 shadow-sm"
                          : "bg-white text-blue-700 shadow-sm"
                        : darkmode
                        ? "text-gray-300 hover:text-white"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    style={{ minWidth: 0 }}
                  >
                    <Icon size={16} />
                    <span className="max-w-[4.5rem]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div
            className={`px-3 py-2 border-b ${
              darkmode ? "border-gray-800" : "border-gray-200"
            }`}
          >
            <div className="space-y-1">
              {sidebarItems.slice(3).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full px-2 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${
                      activeTab === item.id
                        ? darkmode
                          ? "bg-blue-950 text-blue-300 border border-blue-900"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                        : darkmode
                        ? "text-gray-300 hover:text-white hover:bg-slate-800"
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
          <div className="flex-1 p-3 overflow-y-auto min-h-0">
            <SidebarComponent
              setSelectedPath={setSelectedPath}
              edges={edges}
              setEdges={setEdges}
              user={user}
              activeTab={activeTab}
              setSelectedPath={setSelectedPath}
              setSelectedTable={setSelectedTable}
              setActiveTab={setActiveTab}
              selectedPath={selectedPath}
              create={create}
              setDarkmode={setDarkmode}
              setCreate={setCreate}
              darkmode={darkmode}
              setNodes={setNodes}
              selectedTable={selectedTable}
              setSelectedTable={setSelectedTable}
              setSelectedErDiagram={setSelectedErDiagram}
              setErLoading={setErLoading}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center p-0 min-h-0">
          <div className="w-full max-w-[1600px] mb-2 shrink-0">
            <SearchBar onSelect={handleSelection} darkmode={darkmode} />
          </div>
          {selectedErDiagram ? (
            <div
              className={`w-full flex-1 backdrop-blur-sm rounded-2xl shadow-xl border overflow-auto flex flex-col ${
                darkmode
                  ? "bg-slate-900/90 border-gray-800"
                  : "bg-white/90 border-gray-200"
              }`}
              style={{ minHeight: 0, minWidth: 0 }}
            >
              <ReactFlowProvider>
                <DatabaseTabs
                  setSelectedTable={setSelectedTable}
                  selectedTable={selectedTable}
                  setSelectedPath={setSelectedPath}
                  selectedPath={selectedPath}
                  darkmode={darkmode}
                  nodes={nodes}
                  edges={edges}
                  setNodes={setNodes}
                  setEdges={setEdges}
                  setErLoading={setErLoading}
                  erLoading={erLoading}
                />
              </ReactFlowProvider>
            </div>
          ) : (
            <div
              className={`w-full h-full items-center text-2xl font-bold justify-center backdrop-blur-sm rounded-2xl shadow-xl border overflow-auto flex flex-col ${
                darkmode
                  ? "bg-slate-900/90 border-gray-800 text-blue-300"
                  : "bg-white/90 border-gray-200 text-blue-400"
              }`}
              style={{ minHeight: 0, minWidth: 0 }}
            >
              Select an er diagram to view
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
