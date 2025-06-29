import React, { useState } from "react";
import {
  Database,
  GitBranch,
  MessageSquare,
  Settings,
  Box,
  Network,
  Eye,
  RefreshCcw,
  User,
} from "lucide-react";
import ErDiagram from "./ErDiagram";
import { useNavigate } from "react-router-dom";
import SidebarComponent from "./Components/SidebarComponent";
import FilterBar from "./Components/FilterBar";
import AddEntityComponent from "./Components/AddEntity";
export default function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [create, setCreate] = useState("");
  const navigate = useNavigate();
  const [selectedPath, setSelectedPath] = useState({
    lob: null,
    subject: null,
    database: null,
    table: null,
  });
  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Eye },
    { id: "entities", label: "Entities", icon: Box },
    { id: "relationships", label: "Relationships", icon: Network },
    { id: "versions", label: "Version Control", icon: GitBranch },
    { id: "annotations", label: "Annotations", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div
      className={` min-h-screen min-w-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans overflow-hidden flex flex-col`}
    >
      {create == "Entity" && (
        <>
          <div className="fixed inset-0 bg-black/40 z-10 pointer-events-auto"></div>
          <AddEntityComponent setCreate={setCreate} />
        </>
      )}
      {create == "Relationship" && (
        <>
          <div className="fixed inset-0 bg-black/40 z-10 pointer-events-auto"></div>
          <AddEntityComponent setCreate={setCreate} />
        </>
      )}
      <nav className="w-full h-20 bg-white/90 backdrop-blur-lg shadow-lg flex items-center justify-between px-10 rounded-b-3xl border-b border-indigo-100 z-10">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Database className="text-white" size={28} />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent tracking-wide drop-shadow">
              DATABEE
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 text-base bg-white border border-gray-300 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center gap-2 shadow-sm font-semibold"
          >
            <User size={18} />
            Logout
          </button>
          <button className="px-6 py-2 text-base bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2 font-semibold">
            <RefreshCcw size={18} />
            Refresh
          </button>
        </div>
      </nav>
      {/* FilterBar */}
      <div className="flex-shrink-0 px-6 py-3">
        <FilterBar
          selectedPath={selectedPath}
          setSelectedPath={setSelectedPath}
        />
      </div>

      <div
        className={`flex flex-1  px-4 pb-4 gap-4 ${
          create == "Entity" ? "pointer-events-none" : ""
        } `}
      >
        {/* Sidebar */}
        <div className=" min-w-[20rem] max-w-xs  bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl flex flex-col border border-indigo-100">
          <div className="border-b border-gray-200 p-3">
            <div className="grid grid-cols-3 gap-1 bg-gray-100 rounded-lg p-1">
              {sidebarItems.slice(0, 3).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-2 py-2 rounded-md text-xs font-medium transition-all flex flex-col items-center justify-center gap-1 ${
                      activeTab === item.id
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    style={{ minWidth: 0 }}
                  >
                    <Icon size={16} />
                    <span className=" max-w-[4.5rem]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="px-3 py-2 border-b border-gray-200">
            <div className="space-y-1">
              {sidebarItems.slice(3).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full px-2 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${
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
          <div className="flex-1 p-3 overflow-y-auto min-h-0">
            <SidebarComponent
              activeTab={activeTab}
              selectedPath={selectedPath}
              create={create}
              setCreate={setCreate}
            />
          </div>
        </div>
        <main className="flex-1 flex flex-col">
          <div className="w-full h-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex-1 flex flex-col">
            <div className="w-full h-full p-4 flex-1 min-h-0">
              <ErDiagram />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
