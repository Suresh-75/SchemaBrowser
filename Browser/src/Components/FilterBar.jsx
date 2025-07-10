import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Database,
  Table,
  Building2,
  Target,
  Plus,
} from "lucide-react";
import { endpoints } from "../api";

const FilterBar = ({
  user,
  selectedPath,
  onSelect,
  setSelectedPath,
  darkmode,
  setSelectedTable,
}) => {
  const [businessData, setBusinessData] = useState({});
  const [hoveredLob, setHoveredLob] = useState(null);
  const [hoveredSubject, setHoveredSubject] = useState(null);
  const [hoveredDatabase, setHoveredDatabase] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLobName, setNewLobName] = useState("");
  const [showSubjectModal, setShowSubjectModal] = useState(null);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [showDatabaseModal, setShowDatabaseModal] = useState(null);
  const [newDatabaseName, setNewDatabaseName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const response = await endpoints.getHierarchy();
        const hierarchy = response.data;
        const transformedData = {};
        Object.values(hierarchy).forEach((lob) => {
          transformedData[lob.name] = { id: lob.id, subjects: {} };
          Object.values(lob.subject_areas).forEach((subjectArea) => {
            transformedData[lob.name].subjects[subjectArea.name] = {
              id: subjectArea.id,
              databases: {},
            };
            Object.values(subjectArea.databases).forEach((database) => {
              // console.log(database);
              transformedData[lob.name].subjects[subjectArea.name].databases[
                database.name
              ] = Object.entries(database.tables).map(([id, name]) => ({
                id: Number(id),
                name,
              }));
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
  const showMessage = (message, type = "success") => {
    if (type === "error") {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(""), 3000);
    } else {
      setSuccessMessage(message);
      setTimeout(() => setShowAddModal(false), 7000); // Delay close
    }
  };

  const handleAddLob = async () => {
    if (!newLobName.trim()) return;
    if (businessData[newLobName]) {
      setShowAddModal(false);
      showMessage("LOB with this name already exists.", "error");
      return;
    }
    try {
      await endpoints.createLob({ name: newLobName });
      setNewLobName("");
      setShowAddModal(false);
      showMessage("LOB created successfully.");
      window.location.reload();
    } catch (error) {
      setShowAddModal(false);
      showMessage(error.response?.data?.error || "Failed to add LOB.", "error");
    }
  };

  const handleAddSubject = async (lobName) => {
    if (!newSubjectName.trim()) return;
    if (businessData[lobName]?.subjects[newSubjectName]) {
      setShowSubjectModal(null);
      showMessage("Subject Area already exists under this LOB.", "error");
      return;
    }
    try {
      await endpoints.createSubjectArea({
        name: newSubjectName,
        lob_name: lobName,
      });
      setNewSubjectName("");
      setShowSubjectModal(null);
      showMessage("Subject Area created successfully.");
      window.location.reload();
    } catch (error) {
      setShowSubjectModal(null);
      showMessage(
        error.response?.data?.error || "Failed to add Subject Area.",
        "error"
      );
    }
  };

  const handleAddDatabase = async (lobName, subjectName) => {
    if (!newDatabaseName.trim()) return;
    try {
      await endpoints.createLogicalDatabase({
        name: newDatabaseName,
        lob_name: lobName,
        subject_name: subjectName,
      });
      setNewDatabaseName("");
      setShowDatabaseModal(null);
      showMessage("Logical Database created successfully.");
      window.location.reload();
    } catch (error) {
      setShowDatabaseModal(null);
      showMessage(
        error.response?.data?.error || "Failed to add Logical Database.",
        "error"
      );
    }
  };

  const handleLobSelect = (lob) => {
    onSelect({ lob, subject: null, database: null, table: null });
  };

  const handleSubjectSelect = (lob, subject) => {
    onSelect({ lob, subject, database: null, table: null });
  };

  const handleDatabaseSelect = (lob, subject, database) => {
    onSelect({ lob, subject, database, table: null });
  };

  const handleTableSelect = (lob, subject, database, table) => {
    setSelectedPath({
      lob,
      subject,
      database,
      table,
    });
  };

  const renderBreadcrumb = () => {
    const breadcrumbItems = [];

    if (selectedPath.lob) {
      breadcrumbItems.push({
        type: "lob",
        name: selectedPath.lob,
        icon: Building2,
      });
    }

    if (selectedPath.subject) {
      breadcrumbItems.push({
        type: "subject",
        name: selectedPath.subject,
        icon: Target,
      });
    }

    if (selectedPath.database) {
      breadcrumbItems.push({
        type: "database",
        name: selectedPath.database,
        icon: Database,
      });
    }

    if (selectedPath.table) {
      breadcrumbItems.push({
        type: "table",
        name: selectedPath.table,
        icon: Table,
      });
    }

    return breadcrumbItems.length > 0 ? (
      <div className="flex items-center space-x-2 px-4 py-2">
        {/* <span
          className={`text-sm font-medium ${
            darkmode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Current Path:
        </span> */}
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            <div
              className={`flex items-center px-2 py-1 rounded ${
                darkmode
                  ? "bg-gray-700 text-gray-200"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              <item.icon className="w-3 h-3 mr-1" />
              <span className="text-sm">{item.name}</span>
            </div>
            {index < breadcrumbItems.length - 1 && (
              <ChevronRight
                className={`w-4 h-4 ${
                  darkmode ? "text-gray-400" : "text-gray-500"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    ) : null;
  };

  return (
    <div className={`w-full `}>
      {errorMessage && (
        <div className="absolute top-2 right-2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow z-50">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="absolute top-14 right-2 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded shadow z-50">
          {successMessage}
        </div>
      )}
      {renderBreadcrumb()}
      {/* Main navigation */}
      <div
        // className={``}
        className={`flex items-center px-6 py-3 space-x-8 flex-wrap  rounded-2xl ${
          darkmode
            ? "bg-gradient-to-r from-slate-900 to-blue-950"
            : "bg-gray-50 border-gray-200"
        }`}
      >
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
                  ? "bg-blue-600 text-white shadow-md"
                  : hoveredLob === lob
                  ? darkmode
                    ? "bg-blue-900 text-blue-200"
                    : "bg-blue-100 text-blue-700"
                  : darkmode
                  ? "text-gray-300 hover:text-gray-100 hover:bg-gray-700"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              <Building2 className="w-4 h-4 mr-2" />
              {lob}
              <ChevronDown className="w-4 h-4 ml-2" />
            </button>

            {hoveredLob === lob && (
              <div
                className={`absolute top-full left-0 w-64 rounded-lg shadow-xl border z-50 ${
                  darkmode
                    ? "bg-gray-800 border-gray-600"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="py-2">
                  <div
                    className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                      darkmode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Subject Areas
                  </div>
                  {Object.keys(businessData[lob].subjects).map((subject) => (
                    <div key={subject} className="relative">
                      <button
                        onClick={() => handleSubjectSelect(lob, subject)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors ${
                          selectedPath.subject === subject
                            ? darkmode
                              ? "bg-blue-900 text-blue-200 border-r-2 border-blue-400"
                              : "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                            : hoveredSubject === subject
                            ? darkmode
                              ? "bg-gray-700 text-gray-200"
                              : "bg-gray-50 text-gray-900"
                            : darkmode
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                        onMouseEnter={() => setHoveredSubject(subject)}
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

                      {/* Database dropdown */}
                      {hoveredSubject === subject && (
                        <div
                          className={`absolute left-full -top-10 w-56 rounded-lg shadow-xl border z-50 ${
                            darkmode
                              ? "bg-gray-800 border-gray-600"
                              : "bg-white border-gray-200"
                          }`}
                          onMouseEnter={() => setHoveredSubject(subject)}
                          onMouseLeave={() => setHoveredSubject(null)}
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
                              businessData[lob].subjects[subject].databases
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
                                    handleDatabaseSelect(lob, subject, database)
                                  }
                                  className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors ${
                                    selectedPath.database === database
                                      ? darkmode
                                        ? "bg-blue-900 text-blue-200 shadow-md"
                                        : "bg-blue-50 text-blue-700 shadow-md"
                                      : darkmode
                                      ? "text-gray-300 hover:bg-gray-700"
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

                                {hoveredDatabase === database && (
                                  <div
                                    className={`absolute left-full -top-10 w-56 rounded-lg shadow-xl border z-50 ${
                                      darkmode
                                        ? "bg-gray-800 border-gray-600"
                                        : "bg-white border-gray-200"
                                    }`}
                                    onMouseEnter={() => {
                                      console.log(
                                        businessData[lob].subjects[subject]
                                          .databases[database]
                                      );
                                      setHoveredDatabase(database);
                                    }}
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

                                      {businessData[lob].subjects[
                                        subject
                                      ].databases[database]?.map((obj) => (
                                        <button
                                          key={obj.id}
                                          onClick={() => {
                                            console.log(obj.id);
                                            setSelectedTable(Number(obj.id)); // store the ID
                                            handleTableSelect(
                                              lob,
                                              subject,
                                              database,
                                              obj.name
                                            );
                                          }}
                                          className={`w-full flex items-center px-4 py-2 text-sm text-left transition-colors ${
                                            selectedPath.table === obj.name
                                              ? darkmode
                                                ? "bg-blue-900 text-blue-200"
                                                : "bg-blue-50 text-blue-700"
                                              : darkmode
                                              ? "text-gray-400 hover:bg-gray-700"
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
                                          {obj.name}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                            {user == "admin" && (
                              <div className="px-4 mt-2">
                                <button
                                  className={`text-sm transition-colors ${
                                    darkmode
                                      ? "text-blue-400 hover:text-blue-300"
                                      : "text-blue-600 hover:text-blue-800"
                                  }`}
                                  onClick={() =>
                                    setShowDatabaseModal({ lob, subject })
                                  }
                                >
                                  + Add Database
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {user == "admin" && (
                    <div className="px-4 mt-2">
                      <button
                        className={`text-sm transition-colors ${
                          darkmode
                            ? "text-blue-400 hover:text-blue-300"
                            : "text-blue-600 hover:text-blue-800"
                        }`}
                        onClick={() => setShowSubjectModal(lob)}
                      >
                        + Add Subject Area
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {user == "admin" && (
          <button
            className={`text-sm flex items-center border-2 border-dashed rounded px-3 py-2 transition-colors mt-2 ${
              darkmode
                ? "text-gray-300 hover:text-gray-100 hover:bg-gray-700 border-gray-500"
                : "text-gray-600 hover:text-blue-700 hover:bg-gray-100 border-gray-400"
            }`}
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add LOB
          </button>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <Modal
          title="Add New LOB"
          value={newLobName}
          onChange={setNewLobName}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddLob}
          darkmode={darkmode}
        />
      )}

      {showSubjectModal && (
        <Modal
          title={`Add New Subject Area in "${showSubjectModal}"`}
          value={newSubjectName}
          onChange={setNewSubjectName}
          onClose={() => setShowSubjectModal(null)}
          onSubmit={() => handleAddSubject(showSubjectModal)}
          darkmode={darkmode}
        />
      )}

      {showDatabaseModal && (
        <Modal
          title="Add New Database"
          value={newDatabaseName}
          onChange={setNewDatabaseName}
          onClose={() => setShowDatabaseModal(null)}
          onSubmit={() =>
            handleAddDatabase(showDatabaseModal.lob, showDatabaseModal.subject)
          }
          darkmode={darkmode}
        />
      )}
    </div>
  );
};

const Modal = ({ title, value, onChange, onClose, onSubmit, darkmode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm">
    <div
      className={`rounded-lg shadow-xl p-6 w-96 ${
        darkmode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <h2
        className={`text-lg font-semibold mb-4 text-center ${
          darkmode ? "text-gray-100" : "text-gray-900"
        }`}
      >
        {title}
      </h2>
      <input
        type="text"
        placeholder="Name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring transition-colors ${
          darkmode
            ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500"
            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-200"
        }`}
      />
      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          className={`px-4 py-2 rounded transition-colors ${
            darkmode
              ? "bg-gray-600 hover:bg-gray-500 text-gray-100"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          className={`px-4 py-2 rounded border-2 border-dashed transition-colors ${
            darkmode
              ? "border-gray-500 text-gray-200 hover:border-gray-400"
              : "border-gray-400 text-gray-700 hover:border-gray-500"
          }`}
        >
          Add
        </button>
      </div>
    </div>
  </div>
);

export default FilterBar;
