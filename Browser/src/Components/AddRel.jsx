import React, { useState, useEffect, useMemo } from "react";
import { Plus, Save, X, Database, Link } from "lucide-react";
import axios from "axios";
import CustomEdge from "./CustomEdge";
const AddRel = ({
  selectedPath,
  setCreate,
  darkmode,
  setEdges,
  setNodes,
  edges,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [databaseName, setDatabaseName] = useState(
    selectedPath?.database || "public"
  );
  const [tables, setTables] = useState([]);
  const [fromTableId, setFromTableId] = useState("");
  const [fromColumn, setFromColumn] = useState("");
  const [toTableId, setToTableId] = useState("");
  const [toColumn, setToColumn] = useState("");
  const [cardinality, setCardinality] = useState("one-to-many");
  const [relationshipType, setRelationshipType] = useState("foreign_key");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fromTableColumns, setFromTableColumns] = useState([]);
  const [toTableColumns, setToTableColumns] = useState([]);

  async function fetchTableInfo(tableId) {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/tables/${tableId}/attributes`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching table info for table ${tableId}:`, error);
      return null;
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setError("");
    }, 7000);
    return () => clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    fetchTables();
  }, [selectedPath, databaseName]);

  // Fetch columns when tables are selected
  useEffect(() => {
    if (fromTableId) {
      fetchTableColumns(fromTableId, "from");
    }
  }, [fromTableId]);

  useEffect(() => {
    if (toTableId) {
      fetchTableColumns(toTableId, "to");
    }
  }, [toTableId]);

  const fetchTables = async () => {
    try {
      console.log("Fetching tables for database:", databaseName);
      const response = await axios.get(
        `http://localhost:5000/api/tables/${databaseName}`
      );
      console.log("tables ", response.data);
      setTables(response.data || []);
    } catch (err) {
      setError("Error fetching tables: " + err.message);
      console.error("Error details:", err);
    }
  };

  const fetchTableColumns = async (tableId, type) => {
    try {
      const response = await fetchTableInfo(tableId);
      if (response) {
        const { attributes } = response;
        console.log("Columns for table:", tableId, attributes);
        if (type === "from") {
          setFromTableColumns(attributes || []);
        } else {
          setToTableColumns(attributes || []);
        }
      }
    } catch (err) {
      console.error("Error fetching table columns:", err);
    }
  };

  const checkRelationshipExists = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/er_relationships/${databaseName}`
      );
      console.log(response.data);
      if (response?.data) {
        const existingRelationships = response.data || [];

        // Check if relationship already exists
        const exists = existingRelationships.some(
          (rel) =>
            (rel.from_table_id == fromTableId &&
              rel.to_table_id == toTableId &&
              rel.from_column == fromColumn &&
              rel.to_column == toColumn) ||
            (rel.from_table_id == toTableId &&
              rel.to_table_id == fromTableId &&
              rel.from_column == toColumn &&
              rel.to_column == fromColumn)
        );
        return exists;
      }
      return false;
    } catch (err) {
      console.error("Error checking relationship existence:", err);
      return false;
    }
  };
  const edgeTypes = useMemo(
    () => ({
      custom: CustomEdge,
    }),
    []
  );

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (!fromTableId || !fromColumn || !toTableId || !toColumn) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    if (fromTableId === toTableId && fromColumn === toColumn) {
      setError("Cannot create relationship between the same table and column");
      setIsLoading(false);
      return;
    }

    try {
      // Check if relationship already exists
      const exists = await checkRelationshipExists();
      if (exists) {
        setError(
          "A relationship between these tables and columns already exists"
        );
        setIsLoading(false);
        return;
      }

      // Create relationship data
      const relationshipData = {
        from_table_id: fromTableId,
        from_column: fromColumn,
        to_table_id: toTableId,
        to_column: toColumn,
        cardinality: cardinality,
        relationship_type: relationshipType,
        database_name: databaseName,
      };

      // Create the relationship in the backend first
      const response = await axios.post(
        "http://localhost:5000/api/er_relationships",
        relationshipData
      );

      console.log("Response from server:", response);

      if (response.status === 200 || response.status === 201) {
        // Get the created relationship ID from the response
        const createdRelationship = response.data;

        // Fetch table data for nodes
        const fromTabledata = await fetchTableInfo(fromTableId);
        const toTabledata = await fetchTableInfo(toTableId);

        // Create new edge with the actual relationship ID
        const newEdge = {
          id: `e${relationshipData.from_table_id}-${
            relationshipData.to_table_id
          }-${createdRelationship.id || Date.now()}`,
          source: relationshipData.from_table_id.toString(),
          target: relationshipData.to_table_id.toString(),
          type: "custom",
          label: `${relationshipData.from_column} → ${relationshipData.to_column} (${relationshipData.cardinality})`,
          style: { stroke: "#666", strokeWidth: 1 },
          labelStyle: {
            fontSize: "16px",
            fontFamily: "monospace",
            fill: darkmode ? "#E5E7EB" : "#374151",
            lineHeight: "1.5em",
            whiteSpace: "pre",
          },
          labelBgStyle: {
            fill: darkmode ? "#374151" : "#FFFFFF",
            fillOpacity: 0.95,
            stroke: darkmode ? "#4B5563" : "#E5E7EB",
            strokeWidth: 1,
          },
          animated: false,
          data: {
            cardinality: relationshipData.cardinality,
            relationshipType: relationshipData.relationship_type,
            from_table_id: fromTableId,
            to_table_id: toTableId,
          },
        };
        let existingEdge = null;
        const remEdges = edges.filter((edge) => {
          const isMatchingEdge =
            (edge.source == fromTableId && edge.target == toTableId) ||
            (edge.source == toTableId && edge.target == fromTableId);

          if (isMatchingEdge) {
            existingEdge = edge;
            console.log("Found existing edge:", edge);
            return null;
          }
          return edge;
        });

        if (existingEdge?.label) {
          newEdge.label = [existingEdge.label, newEdge.label].join("\n");
        }
        console.log(remEdges);
        setEdges([...remEdges, newEdge]);
        setNodes((prevNodes) => {
          const existingNodeIds = new Set(prevNodes.map((node) => node.id));
          const updatedNodes = [...prevNodes];

          if (!existingNodeIds.has(fromTableId)) {
            updatedNodes.push({
              id: fromTableId,
              type: "schemaCard",
              data: {
                label: fromTabledata?.table_name || `Table ${fromTableId}`,
                table: fromTabledata,
                darkmode,
              },
              position: {
                x: 100 + Math.random() * 300,
                y: 100 + Math.random() * 300,
              },
            });
          }

          if (!existingNodeIds.has(toTableId)) {
            updatedNodes.push({
              id: toTableId,
              type: "schemaCard",
              data: {
                label: toTabledata?.table_name || `Table ${toTableId}`,
                table: toTabledata,
                darkmode,
              },
              position: {
                x: 400 + Math.random() * 300,
                y: 100 + Math.random() * 300,
              },
            });
          }

          return updatedNodes;
        });

        setSuccess("Relationship created successfully!");

        setTimeout(() => {
          setCreate("");
        }, 1500);
      } else {
        setError("Failed to create relationship");
      }
    } catch (err) {
      setError(
        "Error creating relationship: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCreate("");
  };

  return (
    <div className="w-[50%] mx-auto p-6 absolute top-1/6 left-1/2 transform -translate-x-1/2 z-50">
      <div
        className={`${
          darkmode ? "bg-gray-800" : "bg-white"
        } rounded-lg shadow-xl border ${
          darkmode ? "border-gray-600" : "border-gray-200"
        }`}
      >
        <div
          className={`${
            darkmode
              ? "bg-gradient-to-r from-blue-700 to-blue-800"
              : "bg-gradient-to-r from-blue-600 to-blue-700"
          } text-white p-6 rounded-t-lg`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link size={24} />
              <h2 className="text-xl font-bold">Create Table Relationship</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="text-white hover:text-blue-600 hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div
            className={`${
              darkmode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-700"
            } p-4`}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold">Error:</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div
            className={`${
              darkmode
                ? "bg-green-900 text-green-200"
                : "bg-green-100 text-green-700"
            } p-4`}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold">Success:</span>
              <span>{success}</span>
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="mb-6">
            <label
              className={`block text-sm font-medium ${
                darkmode ? "text-gray-300" : "text-gray-700"
              } mb-2`}
            >
              Database Name
            </label>
            <input
              type="text"
              value={databaseName}
              readOnly
              className={`w-full p-3 border rounded-lg ${
                darkmode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-50 border-gray-300 text-gray-700"
              }`}
              placeholder="e.g., public"
              required
            />
          </div>

          <div className="flex justify-between items-start gap-6">
            {/* From Table Section */}
            <div className="mb-6 flex-1">
              <h3
                className={`text-lg font-semibold ${
                  darkmode ? "text-gray-200" : "text-gray-800"
                } mb-4`}
              >
                From Table
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      darkmode ? "text-gray-300" : "text-gray-700"
                    } mb-2`}
                  >
                    Table
                  </label>
                  <select
                    value={fromTableId}
                    onChange={(e) => {
                      if (
                        e.target.value !== "" &&
                        e.target.value === toTableId
                      ) {
                        setError("Cannot select the same table for both sides");
                        return;
                      }
                      setFromTableId(e.target.value);
                      setFromColumn(""); // Reset column selection
                    }}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkmode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                    required
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
                    className={`block text-sm font-medium ${
                      darkmode ? "text-gray-300" : "text-gray-700"
                    } mb-2`}
                  >
                    Column
                  </label>
                  <select
                    value={fromColumn}
                    onChange={(e) => setFromColumn(e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkmode
                        ? "bg-gray-700 border-gray-600 text-white disabled:bg-gray-800 disabled:text-gray-500"
                        : "bg-white border-gray-300 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                    }`}
                    required
                    disabled={!fromTableId}
                  >
                    <option value="">Select a column</option>
                    {fromTableColumns.map((column) => (
                      <option key={column} value={column}>
                        {column}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* To Table Section */}
            <div className="mb-6 flex-1">
              <h3
                className={`text-lg font-semibold ${
                  darkmode ? "text-gray-200" : "text-gray-800"
                } mb-4`}
              >
                To Table
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      darkmode ? "text-gray-300" : "text-gray-700"
                    } mb-2`}
                  >
                    Table
                  </label>
                  <select
                    value={toTableId}
                    onChange={(e) => {
                      if (
                        e.target.value !== "" &&
                        e.target.value === fromTableId
                      ) {
                        setError("Cannot select the same table for both sides");
                        return;
                      }
                      setToTableId(e.target.value);
                      setToColumn(""); // Reset column selection
                    }}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkmode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                    required
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
                    className={`block text-sm font-medium ${
                      darkmode ? "text-gray-300" : "text-gray-700"
                    } mb-2`}
                  >
                    Column
                  </label>
                  <select
                    value={toColumn}
                    onChange={(e) => setToColumn(e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkmode
                        ? "bg-gray-700 border-gray-600 text-white disabled:bg-gray-800 disabled:text-gray-500"
                        : "bg-white border-gray-300 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                    }`}
                    required
                    disabled={!toTableId}
                  >
                    <option value="">Select a column</option>
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
          <div className="mb-6">
            <h3
              className={`text-lg font-semibold ${
                darkmode ? "text-gray-200" : "text-gray-800"
              } mb-4`}
            >
              Relationship Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium ${
                    darkmode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
                >
                  Cardinality
                </label>
                <select
                  value={cardinality}
                  onChange={(e) => setCardinality(e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkmode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="one-to-one">One to One</option>
                  <option value="one-to-many">One to Many</option>
                  <option value="many-to-one">Many to One</option>
                  <option value="many-to-many">Many to Many</option>
                </select>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium ${
                    darkmode ? "text-gray-300" : "text-gray-700"
                  } mb-2`}
                >
                  Relationship Type
                </label>
                <select
                  value={relationshipType}
                  onChange={(e) => setRelationshipType(e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    darkmode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="foreign_key">Foreign Key</option>
                  <option value="reference">Reference</option>
                  <option value="association">Association</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className={`px-6 py-2 border rounded-lg transition-colors ${
                darkmode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                isLoading ||
                !fromTableId ||
                !fromColumn ||
                !toTableId ||
                !toColumn
              }
              className={`inline-flex items-center gap-2 font-semibold py-2 px-6 rounded-lg transition-colors ${
                darkmode
                  ? "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white"
                  : "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Create Relationship
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRel;
