import React, { useState, useEffect } from "react";
import { Plus, Save, X, Database } from "lucide-react";
import endpoints from "../api";
const AddEntityComponent = ({ selectedPath, setCreate, darkmode }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [entityName, setEntityName] = useState("");
  const [schemaName, setSchemaName] = useState("");
  const [databaseId, setDatabaseId] = useState(null);
  const [fields, setFields] = useState([
    {
      name: "ID",
      type: "INTEGER",
      isPrimary: true,
      isRequired: true,
      autoIncrement: true,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Update schema name when selectedPath changes
useEffect(() => {
  console.log('selectedPath:', selectedPath);
  if (selectedPath?.database) {
    setSchemaName(selectedPath.database.toUpperCase());
    // Fetch database ID based on database name
    fetch(`http://localhost:5000/api/logical-databases/${selectedPath.database.toUpperCase()}`)
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setDatabaseId(data.id);
        }
      })
      .catch(err => {
        console.error('Error fetching database ID:', err);
        setError('Failed to get database information');
      });
  }
}, [selectedPath]);


  const dataTypes = [
    "INTEGER",
    "VARCHAR(255)",
    "DATE",
    "TIMESTAMP",
    "DECIMAL(10,2)",
    "FLOAT",
    "BOOLEAN",
    "TEXT"
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
    if (
      field.autoIncrement &&
      (field.type === "INTEGER" || field.type === "BIGINT")
    ) {
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
      auto_increment: field.autoIncrement,
    };
  };
  const handleSubmit = async () => {
    if (!entityName.trim()) {
      setError("Entity name is required");
      return;
    }
    // console.log('Selected Path:', selectedPath);
    if (!selectedPath?.database) {
      setError("Please select a database first");
      return;
    }

    // Validate that all fields have names
    const hasEmptyFields = fields.some((field) => !field.name.trim());
    if (hasEmptyFields) {
      setError("All fields must have names");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const mappedFields = fields.map(field => {
        const oracleType = mapToOracleType(field.type);
        return {
          name: field.name.toUpperCase(),
          type: oracleType,
          primary: field.isPrimary,
          required: field.isRequired,
          auto_increment: field.autoIncrement,
          default_value: field.autoIncrement ? `${entityName.toUpperCase()}_SEQ.NEXTVAL` : null
        };
      });

      const payload = {
        table_name: entityName.toUpperCase(),
        schema_name: schemaName,
        database_id: parseInt(databaseId, 10),
        columns: mappedFields
      };

      console.log('Sending payload:', payload);

      const response = await fetch("http://localhost:5000/api/tables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(`Table "${entityName.toUpperCase()}" created successfully!`);
        setTimeout(() => {
          setIsOpen(false);
          setTimeout(() => {
            resetForm();
            setCreate(false);
          }, 500);
        }, 1500);
      } else {
        setError(result.error || result.message || "Failed to create table");
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        `Network error: ${err.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const mapToOracleType = (type) => {
    const typeMap = {
      'INTEGER': 'NUMBER',
      'VARCHAR(255)': 'VARCHAR2(255)',
      'TEXT': 'CLOB',
      'BOOLEAN': 'NUMBER(1)',
      'FLOAT': 'FLOAT',
      'DECIMAL(10,2)': 'NUMBER(10,2)',
      'DATE': 'DATE',
      'TIMESTAMP': 'TIMESTAMP'
    };
    return typeMap[type] || type;
  };

  const resetForm = () => {
    setEntityName("");
    setSchemaName(selectedPath?.database?.toUpperCase() || "");
    setFields([
      {
        name: "ID",
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
    setCreate(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={`max-w-4xl mx-auto p-6 absolute top-1/6 left-1/2 transform -translate-x-1/2 z-50 ${darkmode ? "text-gray-100" : "text-gray-900"
        }`}
    >
      <div
        className={`rounded-lg shadow-xl border ${darkmode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
      >
        <div
          className={`p-6 rounded-t-lg
         bg-gradient-to-r from-blue-600 to-blue-700 text-white
         `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database size={24} />
              <h2 className="text-xl font-bold">Create New Entity</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors hover:text-blue-600"
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
          {/* Entity Name */}
          <div className="mb-6">
            <label
              className={`block text-sm font-medium mb-2 ${darkmode ? "text-gray-300" : "text-gray-700"
                }`}
            >
              Entity/Table Name
            </label>
            <input
              type="text"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkmode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              placeholder="e.g., users, products, orders"
              required
            />
          </div>

          {/* Fields */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label
                className={`block text-sm font-medium ${darkmode ? "text-gray-300" : "text-gray-700"
                  }`}
              >
                Fields/Columns
              </label>
              <button
                type="button"
                onClick={addField}
                className={`inline-flex items-center gap-1 font-medium text-sm ${darkmode
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-700"
                  }`}
              >
                <Plus size={16} />
                Add Field
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-12 gap-3 items-center p-4 rounded-lg ${darkmode ? "bg-gray-700" : "bg-gray-50"
                    }`}
                >
                  {/* Field Name */}
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) =>
                        updateField(index, "name", e.target.value)
                      }
                      className={`w-full p-2 border rounded text-sm ${darkmode
                          ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900"
                        }`}
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
                      className={`w-full p-2 border rounded text-sm ${darkmode
                          ? "bg-gray-600 border-gray-500 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                        }`}
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
                    <label
                      className={`flex items-center text-sm ${darkmode ? "text-gray-300" : "text-gray-700"
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={field.isPrimary}
                        onChange={(e) =>
                          updateField(index, "isPrimary", e.target.checked)
                        }
                        className={`mr-1 ${darkmode
                            ? "form-checkbox text-blue-400 bg-gray-600 border-gray-500"
                            : "form-checkbox text-blue-600"
                          }`}
                      />
                      Primary
                    </label>
                    <label
                      className={`flex items-center text-sm ${darkmode ? "text-gray-300" : "text-gray-700"
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={field.isRequired}
                        onChange={(e) =>
                          updateField(index, "isRequired", e.target.checked)
                        }
                        className={`mr-1 ${darkmode
                            ? "form-checkbox text-blue-400 bg-gray-600 border-gray-500"
                            : "form-checkbox text-blue-600"
                          }`}
                      />
                      Required
                    </label>
                    <label
                      className={`flex items-center text-sm ${darkmode ? "text-gray-300" : "text-gray-700"
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={field.autoIncrement}
                        onChange={(e) =>
                          updateField(index, "autoIncrement", e.target.checked)
                        }
                        disabled={
                          field.type !== "INTEGER" && field.type !== "BIGINT"
                        }
                        className={`mr-1 ${darkmode
                            ? "form-checkbox text-blue-400 bg-gray-600 border-gray-500 disabled:opacity-50"
                            : "form-checkbox text-blue-600 disabled:opacity-50"
                          }`}
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
                        className={`p-1 ${darkmode
                            ? "text-red-400 hover:text-red-300"
                            : "text-red-500 hover:text-red-700"
                          }`}
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
              className={`px-6 py-2 border rounded-lg transition-colors ${darkmode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !entityName.trim()}
              className={`inline-flex items-center gap-2 font-semibold py-2 px-6 rounded-lg transition-colors ${isLoading || !entityName.trim()
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
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
