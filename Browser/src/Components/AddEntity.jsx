import React, { useState } from "react";
import { Plus, Save, X, Database } from "lucide-react";

const AddEntityComponent = ({ setCreate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [entityName, setEntityName] = useState("");
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

  const dataTypes = [
    "STRING",
    "INT",
    "BIGINT",
    "FLOAT",
    "DOUBLE",
    "BOOLEAN",
    "DATE",
    "TIMESTAMP",
    "DECIMAL(10,2)",
    "BINARY",
    "ARRAY<type>",
    "MAP<key_type,value_type>",
    "STRUCT<col:type,...>",
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

  const generateSQL = () => {
    const fieldDefinitions = fields
      .map((field) => {
        let definition = `${field.name} ${field.type}`;
        if (field.isRequired) definition += " NOT NULL";
        return definition;
      })
      .join(",\n  ");

    // Hive does not support AUTO_INCREMENT or PRIMARY KEY in the same way as RDBMS
    // We'll just show NOT NULL and the field types
    return `CREATE TABLE ${entityName} (\n  ${fieldDefinitions}\n);`;
  };

  const handleSubmit = async () => {
    if (!entityName.trim()) return;

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const sqlQuery = generateSQL();
    console.log("Generated SQL:", sqlQuery);

    // Here you would typically make an API call to your backend
    // const response = await fetch('/api/create-table', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ sql: sqlQuery, entityName })
    // });

    setIsLoading(false);
    alert(
      `Table "${entityName}" would be created successfully!\n\nSQL Query:\n${sqlQuery}`
    );
    resetForm();
  };

  const resetForm = () => {
    setEntityName("");
    setFields([
      {
        name: "id",
        type: "INTEGER",
        isPrimary: true,
        isRequired: true,
        autoIncrement: true,
      },
    ]);
    setCreate("");
    setIsOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 absolute top-1/6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database size={24} />
              <h2 className="text-xl font-bold">Create New Entity</h2>
            </div>
            <button
              onClick={resetForm}
              className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
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

          {/* SQL Preview */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Generated SQL
            </label>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
              {entityName
                ? generateSQL()
                : "Enter entity name and fields to see SQL preview"}
            </pre>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !entityName.trim()}
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
