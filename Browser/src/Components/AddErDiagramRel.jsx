import { useState, useEffect, useCallback } from "react";
import {
  X,
  Database,
  Link,
  AlertCircle,
  CheckCircle,
  Loader,
} from "lucide-react";
import axios from "axios";
import endpoints from "../api";

export default function AddErDiagramRel({
  setCreate,
  selectedPath,
  darkmode,
  selectedErDiagram,
}) {
  const [tables, setTables] = useState([]);
  const [fromTableId, setFromTableId] = useState("");
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

  // Enhanced state management for messages
  const [notification, setNotification] = useState({
    type: "", // 'success', 'error', 'info'
    message: "",
    isVisible: false,
    autoClose: true,
  });

  // Clear notification after timeout
  useEffect(() => {
    if (notification.isVisible && notification.autoClose) {
      const timer = setTimeout(() => {
        setNotification((prev) => ({ ...prev, isVisible: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.isVisible, notification.autoClose]);

  // Helper function to show notifications
  const showNotification = (type, message, autoClose = true) => {
    setNotification({
      type,
      message,
      isVisible: true,
      autoClose,
    });
  };

  // Clear notification
  const clearNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  // Fetch tables on component mount
  useEffect(() => {
    fetchTables();
  }, [selectedPath]);

  const fetchTables = async () => {
    try {
      setIsLoading(true);
      // setError("");
      const response = await axios.get(`http://localhost:5000/api/tables`);
      const unique = [];
      const ts = [];
      response.data.forEach((table) => {
        if (unique.includes(table.name) === false) {
          unique.push(table.name);
          ts.push(table);
        }
      });
      setTables(ts || []);
    } catch (err) {
      showNotification("error", "Failed to fetch tables. Please try again.");
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
      showNotification("error", `Failed to fetch columns for selected table`);
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
      fromTableId &&
      fromColumn &&
      toTableId &&
      toColumn &&
      cardinality &&
      relationshipType &&
      fromTableId !== toTableId
    );
  };

  // Enhanced form submission with better error handling
  const handleSubmit = async () => {
    // Clear any existing notifications
    clearNotification();

    // Validate form
    if (!isFormValid()) {
      showNotification(
        "error",
        "Please fill in all fields correctly and ensure different tables are selected."
      );
      return;
    }

    setIsLoading(true);

    try {
      const relationshipData = {
        er_entity_id: selectedErDiagram,
        lob: selectedPath.lob,
        fromTableId,
        fromColumn,
        toTableId,
        toColumn,
        cardinality,
        relationshipType,
      };
      // console.log("Submitting relationship data:", relationshipData);
      const response = await endpoints.createER(relationshipData);
      if (response.data.success)
        showNotification("success", "ER relationship created successfully!");

      setTimeout(() => {
        resetForm();
        setCreate("");
      }, 2000);
    } catch (err) {
      // Enhanced error handling
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 409) {
        errorMessage =
          "A relationship already exists between these tables and columns.";
      } else if (err.response?.status === 400) {
        errorMessage = "Invalid data provided. Please check your inputs.";
      } else if (err.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      showNotification("error", errorMessage, false); // Don't auto-close error messages
      console.error("Error creating relationship:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form function
  const resetForm = () => {
    setFromTableId("");
    setFromColumn("");
    setToTableId("");
    setToColumn("");
    setCardinality("one-to-many");
    setRelationshipType("foreign_key");
    setFromTableColumns([]);
    setToTableColumns([]);
  };

  // Handle table selection with validation
  const handleTableSelection = (tableId, type) => {
    clearNotification(); // Clear any existing notifications

    if (type === "from") {
      if (tableId === toTableId) {
        showNotification(
          "error",
          "Cannot select the same table for both sides"
        );
        return;
      }
      setFromTableId(tableId);
      setFromColumn("");
    } else {
      if (tableId === fromTableId) {
        showNotification(
          "error",
          "Cannot select the same table for both sides"
        );
        return;
      }
      setToTableId(tableId);
      setToColumn("");
    }
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

  // Notification component
  const NotificationBanner = () => {
    if (!notification.isVisible) return null;

    const notificationStyles = {
      success: {
        bg: darkmode
          ? "bg-green-900/20 border-green-800"
          : "bg-green-50 border-green-200",
        text: "text-green-600",
        icon: CheckCircle,
      },
      error: {
        bg: darkmode
          ? "bg-red-900/20 border-red-800"
          : "bg-red-50 border-red-200",
        text: "text-red-600",
        icon: AlertCircle,
      },
      info: {
        bg: darkmode
          ? "bg-blue-900/20 border-blue-800"
          : "bg-blue-50 border-blue-200",
        text: "text-blue-600",
        icon: AlertCircle,
      },
    };

    const style =
      notificationStyles[notification.type] || notificationStyles.info;
    const IconComponent = style.icon;

    return (
      <div className={`p-4 border-b border-gray-200 dark:border-gray-700`}>
        <div
          className={`flex items-center justify-between p-3 rounded-lg border ${style.bg} ${style.text}`}
        >
          <div className="flex items-center gap-2">
            <IconComponent className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
          {!notification.autoClose && (
            <button
              onClick={clearNotification}
              className={`ml-4 p-1 rounded-full hover:bg-opacity-20 hover:bg-gray-500 ${style.text}`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`w-full max-w-4xl mx-auto rounded-lg border shadow-lg ${themeClasses.container} max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Database className="h-6 w-6 text-blue-500" />
            <div>
              <h2 className={`text-xl font-semibold ${themeClasses.text}`}>
                Add relationship
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

        {/* Notification Banner */}
        <NotificationBanner />

        <div className="p-6 space-y-8">
          {/* Table Selection Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* From Table */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${themeClasses.text}`}>
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
              <h3 className={`text-lg font-semibold ${themeClasses.text}`}>
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
              className={`px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${themeClasses.button} flex items-center gap-2`}
            >
              {isLoading && <Loader className="h-4 w-4 animate-spin" />}
              {isLoading ? "Creating..." : "Create ER Relationship"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
