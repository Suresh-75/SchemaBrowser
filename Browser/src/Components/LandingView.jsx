import React, { useState, useEffect } from 'react';
import { Building2, FolderTree, ArrowBigLeft, Database, Target } from 'lucide-react';
import axios from 'axios';

const LandingView = ({ darkmode, onSelect, selectedPath }) => {
  const [hierarchy, setHierarchy] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/hierarchy');
        setHierarchy(response.data);
      } catch (error) {
        console.error('Failed to fetch hierarchy:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHierarchy();
  }, []);

  if (loading) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${
        darkmode ? "bg-slate-900/90" : "bg-white/90"
      }`}>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-current border-t-transparent text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full h-full flex items-center justify-center p-4 ${
        darkmode ? "bg-slate-900/90 text-red-400" : "bg-white/90 text-red-600"
      }`}>
        <p>Error loading LOBs: {error}</p>
      </div>
    );
  }

  // Render databases view when subject is selected
  if (selectedPath?.subject) {
    const lobData = Object.entries(hierarchy).find(([_, data]) => data.name === selectedPath.lob)?.[1];
    const subjectData = Object.entries(lobData?.subject_areas || {}).find(
      ([_, data]) => data.name === selectedPath.subject
    )?.[1];
    
    const databases = Object.entries(subjectData?.databases || {}).map(([id, data]) => ({
      id: parseInt(id),
      name: data.name,
      tableCount: Object.keys(data.tables || {}).length
    }));

    return (
      <div className={`w-full h-full backdrop-blur-sm rounded-2xl shadow-xl border ${
        darkmode ? "bg-slate-900/90 border-gray-800" : "bg-white/90 border-gray-200 shadow-lg"
      }`}>
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onSelect({ lob: selectedPath.lob })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    darkmode 
                      ? "bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-white border border-slate-700 hover:border-blue-500/50" 
                      : "bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md"
                  }`}
                >
                  <ArrowBigLeft className={`w-5 h-5 transition-transform group-hover:-translate-x-1 ${
                    darkmode ? "text-blue-400" : "text-blue-500"
                  }`} />
                  <span>Back to {selectedPath.lob}</span>
                </button>
                <h1 className={`text-2xl font-bold ${
                  darkmode 
                    ? "text-blue-300" 
                    : "text-blue-600 drop-shadow-sm"
                }`}>
                  {selectedPath.subject}
                </h1>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full ${
                darkmode 
                  ? "text-gray-400" 
                  : "text-gray-600 bg-gray-100 shadow-inner"
              }`}>
                {databases.length} Database{databases.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {databases.map((db) => (
                <button
                  key={db.id}
                  onClick={() => onSelect({ 
                    lob: selectedPath.lob,
                    subject: selectedPath.subject,
                    database: db.name 
                  })}
                  className={`p-6 rounded-xl border transition-all hover:scale-[1.02] ${
                    darkmode 
                      ? "bg-slate-800 border-slate-700 hover:bg-slate-700/90 hover:border-blue-500/50" 
                      : "bg-white border-gray-200 hover:bg-blue-50/50 hover:border-blue-200 shadow-md hover:shadow-xl"
                  } text-left group relative overflow-hidden`}
                >
                  <div className={`absolute inset-0 transition-opacity duration-200 ${
                    darkmode
                      ? "bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/10 group-hover:to-blue-500/5"
                      : "bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/10 group-hover:to-blue-500/5"
                  }`} />
                  <div className="flex items-center gap-3">
                    <Database className={`w-5 h-5 ${
                      darkmode ? "text-blue-400" : "text-blue-600"
                    }`} />
                    <div className="flex-1">
                      <h3 className={`font-medium ${
                        darkmode ? "text-gray-200" : "text-gray-800"
                      }`}>
                        {db.name}
                      </h3>
                      <p className={`text-sm mt-1 ${
                        darkmode ? "text-gray-400" : "text-gray-600"
                      }`}>
                        {db.tableCount} Table{db.tableCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className={`absolute right-6 transform transition-all duration-200 ${
                      darkmode 
                        ? "text-blue-400 group-hover:scale-125" 
                        : "text-blue-600 group-hover:scale-125"
                    } ${
                      "opacity-0 group-hover:opacity-100"
                    }`}>
                      →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render subject areas view when LOB is selected
  if (selectedPath?.lob) {
    const lobData = Object.entries(hierarchy).find(([_, data]) => data.name === selectedPath.lob)?.[1];
    const subjectAreas = Object.entries(lobData?.subject_areas || {}).map(([id, data]) => ({
      id: parseInt(id),
      name: data.name,
      databaseCount: Object.keys(data.databases || {}).length
    }));

    return (
      <div className={`w-full h-full backdrop-blur-sm rounded-2xl shadow-xl border ${
        darkmode ? "bg-slate-900/90 border-gray-800" : "bg-white/90 border-gray-200 shadow-lg"
      }`}>
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onSelect({ lob: null })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    darkmode 
                      ? "bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-white border border-slate-700 hover:border-blue-500/50" 
                      : "bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md"
                  }`}
                >
                  <ArrowBigLeft className={`w-5 h-5 transition-transform group-hover:-translate-x-1 ${
                    darkmode ? "text-blue-400" : "text-blue-500"
                  }`} />
                  <span>Back to LOBs</span>
                </button>
                <h1 className={`text-2xl font-bold ${
                  darkmode 
                    ? "text-blue-300" 
                    : "text-blue-600 drop-shadow-sm"
                }`}>
                  {selectedPath.lob}
                </h1>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full ${
                darkmode 
                  ? "text-gray-400" 
                  : "text-gray-600 bg-gray-100 shadow-inner"
              }`}>
                {subjectAreas.length} Subject Area{subjectAreas.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjectAreas.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => onSelect({ 
                    lob: selectedPath.lob, 
                    subject: subject.name 
                  })}
                  className={`p-6 rounded-xl border transition-all hover:scale-[1.02] ${
                    darkmode 
                      ? "bg-slate-800 border-slate-700 hover:bg-slate-700/90 hover:border-blue-500/50" 
                      : "bg-white border-gray-200 hover:bg-blue-50/50 hover:border-blue-200 shadow-md hover:shadow-xl"
                  } text-left group relative overflow-hidden`}
                >
                  <div className={`absolute inset-0 transition-opacity duration-200 ${
                    darkmode
                      ? "bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/10 group-hover:to-blue-500/5"
                      : "bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/10 group-hover:to-blue-500/5"
                  }`} />
                  <div className="flex items-center gap-3">
                    <Target className={`w-5 h-5 ${
                      darkmode ? "text-blue-400" : "text-blue-600"
                    }`} />
                    <div className="flex-1">
                      <h3 className={`font-medium ${
                        darkmode ? "text-gray-200" : "text-gray-800"
                      }`}>
                        {subject.name}
                      </h3>
                      <p className={`text-sm mt-1 ${
                        darkmode ? "text-gray-400" : "text-gray-600"
                      }`}>
                        {subject.databaseCount} Database{subject.databaseCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className={`absolute right-6 transform transition-all duration-200 ${
                      darkmode 
                        ? "text-blue-400 group-hover:scale-125" 
                        : "text-blue-600 group-hover:scale-125"
                    } ${
                      "opacity-0 group-hover:opacity-100"
                    }`}>
                      →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render LOBs view
  const lobs = Object.entries(hierarchy).map(([id, data]) => ({
    id: parseInt(id),
    name: data.name,
    subjectAreaCount: Object.keys(data.subject_areas || {}).length
  }));

  return (
    <div className={`w-full h-full backdrop-blur-sm rounded-2xl shadow-xl border ${
      darkmode ? "bg-slate-900/90 border-gray-800" : "bg-white/90 border-gray-200 shadow-lg"
    }`}>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <h1 className={`text-2xl font-bold ${
                darkmode ? "text-blue-300" : "text-blue-600 drop-shadow-sm"
              }`}>
                Lines of Business
              </h1>
            </div>
            <span className={`text-sm ${darkmode ? "text-gray-400" : "text-gray-600"}`}>
              {lobs.length} LOB{lobs.length !== 1 ? 's' : ''} Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lobs.map((lob) => (
              <button
                key={lob.id}
                onClick={() => onSelect({ lob: lob.name })}
                className={`p-6 rounded-xl border transition-all hover:scale-[1.02] ${
                  darkmode 
                    ? "bg-slate-800 border-slate-700 hover:bg-slate-700/90 hover:border-blue-500/50" 
                    : "bg-white border-gray-200 hover:bg-blue-50/50 hover:border-blue-200 shadow-md hover:shadow-xl"
                } text-left group relative overflow-hidden`}
              >
                <div className={`absolute inset-0 transition-opacity duration-200 ${
                  darkmode
                    ? "bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/10 group-hover:to-blue-500/5"
                    : "bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/10 group-hover:to-blue-500/5"
                }`} />
                <div className="flex items-center gap-3">
                  <Building2 className={`w-5 h-5 ${
                    darkmode ? "text-blue-400" : "text-blue-600"
                  }`} />
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      darkmode ? "text-gray-200" : "text-gray-800"
                    }`}>
                      {lob.name}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      darkmode ? "text-gray-400" : "text-gray-600"
                    }`}>
                      {lob.subjectAreaCount} Subject Area{lob.subjectAreaCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className={`absolute right-6 transform transition-all duration-200 ${
                    darkmode 
                      ? "text-blue-400 group-hover:scale-125" 
                      : "text-blue-600 group-hover:scale-125"
                  } ${
                    "opacity-0 group-hover:opacity-100"
                  }`}>
                    →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingView;
