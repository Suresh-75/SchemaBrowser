import { useState, useEffect, useCallback } from "react";
import { X, Database, Link, AlertCircle, CheckCircle } from "lucide-react";
import endpoints from "../api";
import axios from "axios";

export default function AddErDiagram({
  setCreate,
  selectedPath,
  darkmode,
  setEntities,
}) {
  const [tables, setTables] = useState([]);
  const [fromTableId, setFromTableId] = useState("");
  const [erDiagramName, setErDiagramName] = useState("");
  const [fromColumn, setFromColumn] = useState("");
  const [toTableId, setToTableId] = useState("");
  const [toColumn, setToColumn] = useState("");
  const [cardinality, setCardinality] = useState("one-to-many");
  const [relationshipType, setRelationshipType] = useState("foreign_key");
  const [fromTableColumns, setFromTableColumns] = useState([]);
  const [toTableColumns, setToTableColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingColumns, setIsLoadingColumns] = useState({
    from: false,
    to: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch tables on component mount
  useEffect(() => {
    fetchTables();
  }, [selectedPath]);

  const fetchTables = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await axios.get(`http://localhost:5000/api/tables`);
      setTables(response.data || []);
    } catch (err) {
      setError("Failed to fetch tables. Please try again.");
      console.error("Error fetching tables:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch table columns with proper loading states
  const fetchTableColumns = useCallback(async (tableId, type) => {
    try {
      setIsLoadingColumns((prev) => ({ ...prev, [type]: true }));
      const response = await axios.get(
        `http://localhost:5000/api/tables/${tableId}/attributes`
      );

      if (response?.data?.attributes) {
        const columns = response.data.attributes;
        if (type === "from") {
          setFromTableColumns(columns);
        } else {
          setToTableColumns(columns);
        }
      }
    } catch (err) {
      console.error(`Error fetching ${type} table columns:`, err);
      setError(`Failed to fetch columns for selected table`);
    } finally {
      setIsLoadingColumns((prev) => ({ ...prev, [type]: false }));
    }
  }, []);

  useEffect(() => {
    if (fromTableId) {
      setFromColumn("");
      fetchTableColumns(fromTableId, "from");
    } else {
      setFromTableColumns([]);
    }
  }, [fromTableId, fetchTableColumns]);

  useEffect(() => {
    if (toTableId) {
      setToColumn("");
      fetchTableColumns(toTableId, "to");
    } else {
      setToTableColumns([]);
    }
  }, [toTableId, fetchTableColumns]);

  // Form validation
  const isFormValid = () => {
    return (
      erDiagramName &&
      fromTableId &&
      fromColumn &&
      toTableId &&
      toColumn &&
      cardinality &&
      relationshipType &&
      fromTableId !== toTableId
    );
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!isFormValid()) {
      setError("Please fill in all fields correctly");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const relationshipData = {
        erDiagramName,
        lob: selectedPath.lob,
        fromTableId,
        fromColumn,
        toTableId,
        toColumn,
        cardinality,
        relationshipType,
      };
      const response = await endpoints.createDiagram(relationshipData);
      setEntities((entities) => {
        const newEntity = {
          created_at: response.data.created_at,
          id: response.data.id,
          lob_name: selectedPath.lob,
          entity_name: erDiagramName,
        };
        return [...entities, newEntity];
      });
      setSuccess("ER diagram created successfully!");
      setTimeout(() => {
        setSuccess("");
        setCreate("");
        window.location.reload(); // Reload to update ER Diagrams in the LOB tab
      }, 1200);
    } catch (err) {
      setError("Failed to create relationship. Please try again.");
      console.error("Error creating relationship:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle table selection with validation
  const handleTableSelection = (tableId, type) => {
    if (type === "from") {
      if (tableId === toTableId) {
        setError("Cannot select the same table for both sides");
        return;
      }
      setFromTableId(tableId);
      setFromColumn("");
    } else {
      if (tableId === fromTableId) {
        setError("Cannot select the same table for both sides");
        return;
      }
      setToTableId(tableId);
      setToColumn("");
    }
    setError("");
  };

  const themeClasses = {
    container: darkmode
      ? "bg-gray-800 border-gray-700"
      : "bg-white border-gray-200",
    text: darkmode ? "text-gray-200" : "text-gray-800",
    subText: darkmode ? "text-gray-300" : "text-gray-700",
    input: darkmode
      ? "bg-gray-700 border-gray-600 text-white disabled:bg-gray-800 disabled:text-gray-500"
      : "bg-white border-gray-300 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500",
    button: darkmode
      ? "bg-blue-600 hover:bg-blue-700 text-white"
      : "bg-blue-500 hover:bg-blue-600 text-white",
    closeButton: darkmode
      ? "text-gray-400 hover:text-gray-200"
      : "text-gray-500 hover:text-gray-700",
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`w-full max-w-4xl mx-auto rounded-lg border shadow-lg ${themeClasses.container} max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Database className="h-6 w-6 text-blue-500" />
            <div>
              <h2 className={`text-xl font-semibold ${themeClasses.text}`}>
                Create ER Diagram
              </h2>
              {selectedPath?.lob && (
                <p className={`text-sm ${themeClasses.subText}`}>
                  LOB: {selectedPath.lob}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setCreate("")}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${themeClasses.closeButton}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error/Success Messages */}
        {(error || success) && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <CheckCircle className="h-5 w-5" />
                <span>{success}</span>
              </div>
            )}
          </div>
        )}

        <div className="p-6 space-y-8">
          <div>
            <label className={`block text-md font-medium mb-2`}>Name</label>
            <input
              placeholder="ER diagram name"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.input}`}
              type="text"
              value={erDiagramName}
              onChange={(e) => setErDiagramName(e.target.value)}
            />
          </div>
          {/* Table Selection Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* From Table */}
            <div className="space-y-4">
              <h3
                className={`text-lg font-semibold ${themeClasses.text} flex items-center gap-2`}
              >
                {/* <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                  1
                </span> */}
                From Table
              </h3>

              <div className="space-y-3">
                <div>
                  <label
                    className={`block text-sm font-medium ${themeClasses.subText} mb-2`}
                  >
                    Table *
                  </label>
                  <select
                    value={fromTableId}
                    onChange={(e) =>
                      handleTableSelection(e.target.value, "from")
                    }
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.input}`}
                    required
                    disabled={isLoading}
                  >
                    <option value="">Select a table</option>
                    {tables.map((table) => (
                      <option key={table.id} value={table.id}>
                        {table.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${themeClasses.subText} mb-2`}
                  >
                    Column *
                  </label>
                  <select
                    value={fromColumn}
                    onChange={(e) => setFromColumn(e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.input}`}
                    required
                    disabled={!fromTableId || isLoadingColumns.from}
                  >
                    <option value="">
                      {isLoadingColumns.from
                        ? "Loading columns..."
                        : "Select a column"}
                    </option>
                    {fromTableColumns.map((column) => (
                      <option key={column} value={column}>
                        {column}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* To Table */}
            <div className="space-y-4">
              <h3
                className={`text-lg font-semibold ${themeClasses.text} flex items-center gap-2`}
              >
                {/* <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">
                  2
                </span> */}
                To Table
              </h3>

              <div className="space-y-3">
                <div>
                  <label
                    className={`block text-sm font-medium ${themeClasses.subText} mb-2`}
                  >
                    Table *
                  </label>
                  <select
                    value={toTableId}
                    onChange={(e) => handleTableSelection(e.target.value, "to")}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.input}`}
                    required
                    disabled={isLoading}
                  >
                    <option value="">Select a table</option>
                    {tables.map((table) => (
                      <option key={table.id} value={table.id}>
                        {table.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${themeClasses.subText} mb-2`}
                  >
                    Column *
                  </label>
                  <select
                    value={toColumn}
                    onChange={(e) => setToColumn(e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.input}`}
                    required
                    disabled={!toTableId || isLoadingColumns.to}
                  >
                    <option value="">
                      {isLoadingColumns.to
                        ? "Loading columns..."
                        : "Select a column"}
                    </option>
                    {toTableColumns.map((column) => (
                      <option key={column} value={column}>
                        {column}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Relationship Configuration */}
          <div className="space-y-4">
            <h3
              className={`text-lg font-semibold ${themeClasses.text} flex items-center gap-2`}
            >
              <Link className="h-5 w-5" />
              Relationship Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium ${themeClasses.subText} mb-2`}
                >
                  Cardinality *
                </label>
                <select
                  value={cardinality}
                  onChange={(e) => setCardinality(e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.input}`}
                  required
                >
                  <option value="one-to-one">One to One (1:1)</option>
                  <option value="one-to-many">One to Many (1:N)</option>
                  <option value="many-to-one">Many to One (N:1)</option>
                  <option value="many-to-many">Many to Many (N:N)</option>
                </select>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium ${themeClasses.subText} mb-2`}
                >
                  Relationship Type *
                </label>
                <select
                  value={relationshipType}
                  onChange={(e) => setRelationshipType(e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${themeClasses.input}`}
                  required
                >
                  <option value="foreign_key">Foreign Key</option>
                  <option value="reference">Reference</option>
                  <option value="association">Association</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setCreate("")}
              className={`px-6 py-3 border rounded-lg font-medium transition-colors ${
                darkmode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
              disabled={isLoading}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid() || isLoading}
              className={`px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${themeClasses.button}`}
            >
              {isLoading ? "Creating..." : "Create ER diagram"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
