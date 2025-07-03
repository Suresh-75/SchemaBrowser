import React, { useState } from "react";
import { Plus, Save, X, Database} from "lucide-react";

const AddEntityComponent = ({ selectedPath, setCreate }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [entityName, setEntityName] = useState("");
  const [schemaName, setSchemaName] = useState(selectedPath?.database || "public");
  const [databaseId, setDatabaseId] = useState(""); // Will need to be set based on selectedPath
  const [fields, setFields] = useState([
    {
      name: "id",
      type: "INTEGER",
      isPrimary: true,
      isRequired: true,
      autoIncrement: true,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const dataTypes = [
    "STRING",
    "INTEGER",
    "BIGINT",
    "FLOAT",
    "DOUBLE",
    "BOOLEAN",
    "DATE",
    "TIMESTAMP",
    "DECIMAL(10,2)",
    "BINARY",
    "VARCHAR(255)",
    "TEXT",
  ];

  const addField = () => {
    setFields([
      ...fields,
      {
        name: "",
        type: "VARCHAR(255)",
        isPrimary: false,
        isRequired: false,
        autoIncrement: false,
      },
    ]);
  };

  const updateField = (index, property, value) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [property]: value };
    setFields(newFields);
  };

  const removeField = (index) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  const mapFieldToBackend = (field) => {
    let type = field.type;
    
    // Handle auto increment
    if (field.autoIncrement && (field.type === "INTEGER" || field.type === "BIGINT")) {
      type = field.type === "INTEGER" ? "SERIAL" : "BIGSERIAL";
    }
    
    // Handle required fields
    if (field.isRequired && !field.isPrimary) {
      type += " NOT NULL";
    }

    return {
      name: field.name,
      type: type,
      primary: field.isPrimary,
      required: field.isRequired,
      auto_increment: field.autoIncrement
    };
  };

  const handleSubmit = async () => {
    if (!entityName.trim()) {
      setError("Entity name is required");
      return;
    }

    if (!databaseId.trim()) {
      setError("Database ID is required");
      return;
    }

    // Validate that all fields have names
    const hasEmptyFields = fields.some(field => !field.name.trim());
    if (hasEmptyFields) {
      setError("All fields must have names");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        table_name: entityName,
        schema_name: schemaName,
        database_id: databaseId,
        columns: fields.map(mapFieldToBackend)
      };

      const response = await fetch('http://localhost:5000/api/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(result.message || `Table "${entityName}" created successfully!`);
        // Minimize the component after successful creation
        setTimeout(() => {
          setIsOpen(false)
          // Reset form after minimizing
          setTimeout(() => {
            resetForm();
          }, 500);
        }, 1500);
      } else {
        setError(result.message || 'Failed to create table');
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEntityName("");
    setSchemaName("public");
    setDatabaseId("");
    setFields([
      {
        name: "id",
        type: "INTEGER",
        isPrimary: true,
        isRequired: true,
        autoIncrement: true,
      },
    ]);
    setError("");
    setSuccess("");
  };

  const handleClose = () => {
    setIsOpen(false);
    
    if (onClose) {
      onClose();
    }
  };


  if (!isOpen) {
    setCreate("")
  }


  return (
    <div className="max-w-4xl mx-auto p-6 absolute top-1/6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database size={24} />
              <h2 className="text-xl font-bold">Create New Entity</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          {/* Database Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Database ID
              </label>
              <input
                type="text"
                value={databaseId}
                onChange={(e) => setDatabaseId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., database_001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schema Name
              </label>
              <input
                type="text"
                value={schemaName}
                onChange={(e) => setSchemaName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., public"
                required
              />
            </div>
          </div>

          {/* Entity Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entity/Table Name
            </label>
            <input
              type="text"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., users, products, orders"
              required
            />
          </div>

          {/* Fields */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Fields/Columns
              </label>
              <button
                type="button"
                onClick={addField}
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                <Plus size={16} />
                Add Field
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-3 items-center p-4 bg-gray-50 rounded-lg"
                >
                  {/* Field Name */}
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) =>
                        updateField(index, "name", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      placeholder="Field name"
                      required
                    />
                  </div>

                  {/* Data Type */}
                  <div className="col-span-3">
                    <select
                      value={field.type}
                      onChange={(e) =>
                        updateField(index, "type", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    >
                      {dataTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Checkboxes */}
                  <div className="col-span-5 flex gap-4">
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={field.isPrimary}
                        onChange={(e) =>
                          updateField(index, "isPrimary", e.target.checked)
                        }
                        className="mr-1"
                      />
                      Primary
                    </label>
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={field.isRequired}
                        onChange={(e) =>
                          updateField(index, "isRequired", e.target.checked)
                        }
                        className="mr-1"
                      />
                      Required
                    </label>
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={field.autoIncrement}
                        onChange={(e) =>
                          updateField(index, "autoIncrement", e.target.checked)
                        }
                        disabled={
                          field.type !== "INTEGER" && field.type !== "BIGINT"
                        }
                        className="mr-1"
                      />
                      Auto Inc
                    </label>
                  </div>

                  {/* Remove Button */}
                  <div className="col-span-1">
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeField(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !entityName.trim() || !databaseId.trim()}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Create Entity
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEntityComponent;