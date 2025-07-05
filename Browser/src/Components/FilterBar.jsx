import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios directly
import {
  ChevronDown,
  ChevronRight,
  Database,
  Table,
  Building2,
  Target,
} from "lucide-react";

const FilterBar = ({ selectedPath, onSelect, setSelectedPath, darkmode }) => {
  const [businessData, setBusinessData] = useState({});
  const [hoveredLob, setHoveredLob] = useState(null);
  const [hoveredSubject, setHoveredSubject] = useState(null);
  const [hoveredDatabase, setHoveredDatabase] = useState(null);

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/hierarchy");
        const hierarchy = response.data;

        const transformedData = {};
        Object.values(hierarchy).forEach((lob) => {
          transformedData[lob.name] = {};
          Object.values(lob.subject_areas).forEach((subjectArea) => {
            transformedData[lob.name][subjectArea.name] = {
              databases: {},
            };
            Object.values(subjectArea.databases).forEach((database) => {
              transformedData[lob.name][subjectArea.name].databases[
                database.name
              ] = Object.values(database.tables);
            });
          });
        });

        setBusinessData(transformedData);
      } catch (error) {
        console.error("Failed to fetch hierarchy:", error);
      }
    };

    fetchHierarchy();
  }, []);

  const handleLobSelect = (lob) => {
    onSelect({ lob, subject: null, database: null, table: null });
    setHoveredLob(null);
    setHoveredSubject(null);
    setHoveredDatabase(null);
  };

  const handleSubjectSelect = (lob, subject) => {
    onSelect({ lob, subject, database: null, table: null });
    setHoveredSubject(subject);
    setHoveredDatabase(null);
  };

  const handleDatabaseSelect = (lob, subject, database) => {
    onSelect({ lob, subject, database, table: null });
    setHoveredDatabase(database);
  };

  const handleTableSelect = (lob, subject, database, table) => {
    setSelectedPath({
      lob,
      subject,
      database,
      table,
    });
  };

  return (
    <div
      className={`w-full border-b ${
        darkmode ? "bg-slate-900 border-gray-800" : "bg-gray-50 border-gray-200"
      }`}
    >
      {/* Breadcrumb showing current selection */}
      {selectedPath.lob && (
        <div
          className={`px-6 py-2 border-b ${
            darkmode
              ? "bg-blue-950 border-blue-900"
              : "bg-blue-50 border-blue-100"
          }`}
        >
          <div
            className={`flex items-center text-sm ${
              darkmode ? "text-blue-200" : "text-blue-700"
            }`}
          >
            <Building2 className="w-4 h-4 mr-2" />
            <span className="font-medium">{selectedPath.lob}</span>
            {selectedPath.subject && (
              <>
                <ChevronRight className="w-4 h-4 mx-2" />
                <Target className="w-4 h-4 mr-2" />
                <span className="font-medium">{selectedPath.subject}</span>
              </>
            )}
            {selectedPath.database && (
              <>
                <ChevronRight className="w-4 h-4 mx-2" />
                <Database className="w-4 h-4 mr-2" />
                <span className="font-medium">{selectedPath.database}</span>
              </>
            )}
            {selectedPath.table && (
              <>
                <ChevronRight className="w-4 h-4 mx-2" />
                <Table className="w-4 h-4 mr-2" />
                <span className="font-medium">{selectedPath.table}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="relative">
        <div className="flex items-center px-6 py-3 space-x-8">
          {Object.keys(businessData).map((lob) => (
            <div
              key={lob}
              className="relative"
              onMouseEnter={() => setHoveredLob(lob)}
              onMouseLeave={() => {
                setHoveredLob(null);
                setHoveredSubject(null);
                setHoveredDatabase(null);
              }}
            >
              <button
                onClick={() => handleLobSelect(lob)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedPath.lob === lob
                    ? darkmode
                      ? "bg-blue-900 text-white shadow-md"
                      : "bg-blue-600 text-white shadow-md"
                    : hoveredLob === lob
                    ? darkmode
                      ? "bg-blue-950 text-blue-200"
                      : "bg-blue-100 text-blue-700"
                    : darkmode
                    ? "text-gray-300 hover:text-white hover:bg-slate-800"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                <Building2 className="w-4 h-4 mr-2" />
                {lob}
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>

              {/* Subject Area Dropdown */}
              {hoveredLob === lob && (
                <div
                  className={`absolute top-full left-0 w-64 rounded-lg shadow-xl border z-50 ${
                    darkmode
                      ? "bg-slate-900 border-gray-800"
                      : "bg-white border-gray-200"
                  }`}
                  onMouseEnter={() => setHoveredLob(lob)}
                  onMouseLeave={() => {
                    setHoveredLob(null);
                    setHoveredSubject(null);
                    setHoveredDatabase(null);
                  }}
                >
                  <div className="py-2">
                    <div
                      className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                        darkmode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Subject Areas
                    </div>
                    {Object.keys(businessData[lob]).map((subject) => (
                      <div
                        key={subject}
                        className="relative"
                        onMouseEnter={() => setHoveredSubject(subject)}
                      >
                        <button
                          onClick={() => handleSubjectSelect(lob, subject)}
                          className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors ${
                            selectedPath.lob === lob &&
                            selectedPath.subject === subject
                              ? darkmode
                                ? "bg-blue-950 text-blue-200 border-r-2 border-blue-900"
                                : "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                              : hoveredSubject === subject
                              ? darkmode
                                ? "bg-slate-800 text-gray-100"
                                : "bg-gray-50 text-gray-900"
                              : darkmode
                              ? "text-gray-300 hover:bg-slate-800 hover:text-white"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center">
                            <Target
                              className={`w-4 h-4 mr-3 ${
                                darkmode ? "text-gray-500" : "text-gray-400"
                              }`}
                            />
                            {subject}
                          </div>
                          <ChevronRight
                            className={`w-4 h-4 ${
                              darkmode ? "text-gray-500" : "text-gray-400"
                            }`}
                          />
                        </button>

                        {/* Database Dropdown */}
                        {hoveredSubject === subject && (
                          <div
                            className={`absolute left-full -top-10 w-56 rounded-lg shadow-xl border z-50 ${
                              darkmode
                                ? "bg-slate-900 border-gray-800"
                                : "bg-white border-gray-200"
                            }`}
                            onMouseEnter={() => setHoveredSubject(subject)}
                            onMouseLeave={() => {
                              setHoveredSubject(null);
                              setHoveredDatabase(null);
                            }}
                          >
                            <div className="py-2">
                              <div
                                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                                  darkmode ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                Databases
                              </div>
                              {Object.keys(
                                businessData[lob][subject].databases
                              ).map((database) => (
                                <div
                                  key={database}
                                  className="relative"
                                  onMouseEnter={() =>
                                    setHoveredDatabase(database)
                                  }
                                >
                                  <button
                                    onClick={() =>
                                      handleDatabaseSelect(
                                        lob,
                                        subject,
                                        database
                                      )
                                    }
                                    className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors ${
                                      selectedPath.database === database
                                        ? darkmode
                                          ? "bg-blue-950 text-blue-200 shadow-md"
                                          : "bg-blue-50 text-blue-700 shadow-md"
                                        : hoveredDatabase === database
                                        ? darkmode
                                          ? "bg-slate-800 text-gray-100"
                                          : "bg-gray-50 text-gray-900"
                                        : darkmode
                                        ? "text-gray-300 hover:bg-slate-800 hover:text-white"
                                        : "text-gray-700 hover:bg-gray-50"
                                    }`}
                                  >
                                    <div className="flex items-center">
                                      <Database
                                        className={`w-4 h-4 mr-3 ${
                                          darkmode
                                            ? "text-gray-500"
                                            : "text-gray-400"
                                        }`}
                                      />
                                      {database}
                                    </div>
                                    <ChevronRight
                                      className={`w-4 h-4 ${
                                        darkmode
                                          ? "text-gray-500"
                                          : "text-gray-400"
                                      }`}
                                    />
                                  </button>

                                  {/* Tables Dropdown */}
                                  {hoveredDatabase === database && (
                                    <div
                                      className={`absolute left-full -top-10 w-56 rounded-lg shadow-xl border z-50 ${
                                        darkmode
                                          ? "bg-slate-900 border-gray-800"
                                          : "bg-white border-gray-200"
                                      }`}
                                      onMouseEnter={() =>
                                        setHoveredDatabase(database)
                                      }
                                      onMouseLeave={() =>
                                        setHoveredDatabase(null)
                                      }
                                    >
                                      <div className="py-2">
                                        <div
                                          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                                            darkmode
                                              ? "text-gray-400"
                                              : "text-gray-500"
                                          }`}
                                        >
                                          Tables
                                        </div>
                                        {businessData[lob][subject].databases[
                                          database
                                        ].map((table) => (
                                          <button
                                            key={table}
                                            onClick={() =>
                                              handleTableSelect(
                                                lob,
                                                subject,
                                                database,
                                                table
                                              )
                                            }
                                            className={`w-full flex items-center px-4 py-2 text-sm text-left transition-colors ${
                                              selectedPath.table === table
                                                ? darkmode
                                                  ? "bg-blue-950 text-blue-200"
                                                  : "bg-blue-50 text-blue-700"
                                                : darkmode
                                                ? "text-gray-300 hover:bg-slate-800 hover:text-white"
                                                : "text-gray-600 hover:bg-gray-50"
                                            }`}
                                          >
                                            <Table
                                              className={`w-4 h-4 mr-3 ${
                                                darkmode
                                                  ? "text-gray-500"
                                                  : "text-gray-400"
                                              }`}
                                            />
                                            {table}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
