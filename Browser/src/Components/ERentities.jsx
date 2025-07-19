import { useEffect, useState, useCallback } from "react";
import {
  Loader2,
  AlertTriangle,
  Database,
  X,
  Plus,
  Edit,
  Trash2,
  Network,
  ArrowBigLeft,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";
import endpoints from "../api";
export default function ErEntities({
  // getERdiagram,
  user,
  selectedTable,
  setSelectedTable,
  selectedPath,
  setSelectedPath,
  setCreate,
  setEdges,
  setNodes,
  setSelectedErDiagram,
  selectedErDiagram,
  setErLoading,
  create,
  darkmode,
  setEntities,
  entities,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rels, setRels] = useState([]);
  const [erDiagramName, setErDiagramName] = useState("");

  async function fetchTableInfo(tableId) {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/tables/${tableId}/attributes`
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching table info for table ${tableId}:`, error);
      return null;
    }
  }
  const deleteERfunc = async (
    id,
    from_column,
    to_column,
    to_table_id,
    from_table_id
  ) => {
    if (!confirm("Do you want to delete this relationship?")) {
      return;
    }

    const response = await endpoints.deleteER(id);
    const newRels = rels.filter((rel) => {
      return rel.id != id;
    });
    setRels(newRels);
    const newEdges = edges
      .map((edge) => {
        if (edge.source == from_table_id && edge.target == to_table_id) {
          const relationships = edge.label.split("\n");
          // console.log(relationships);
          const updatedRelationships = relationships.filter((rel) => {
            const parts = rel.split(" → ");
            if (parts.length === 2) {
              const fromCol = parts[0].trim();
              const toCol = parts[1].split(" ")[0].trim();
              return !(fromCol === from_column && toCol === to_column);
            }
            return true;
          });
          // console.log(updatedRelationships);
          if (updatedRelationships.length === 0) {
            return null;
          }

          return {
            ...edge,
            label: updatedRelationships.join("\n"),
          };
        }
        return edge;
      })
      .filter((edge) => edge !== null);

    if (newEdges?.length == 0) {
      setNodes([]);
    }
    setEdges(newEdges);
  };
  const createNodesAndEdges = useCallback(
    async (relationships = []) => {
      // Add default empty array
      if (!relationships || relationships.length === 0) {
        return { nodes: [], edges: [] };
      }

      const tableIds = Array.from(
        new Set(
          relationships.flatMap((rel) => [rel.from_table_id, rel.to_table_id])
        )
      );

      // Fetch all table info in parallel
      const tableInfos = [];
      for (const tableId of tableIds) {
        const info = await fetchTableInfo(tableId);
        tableInfos.push(info);
      }
      const tableMap = {};
      tableIds.forEach((tableId, index) => {
        tableMap[tableId] = tableInfos[index];
      });

      // Group relationships by source-target pair
      const edgeGroups = {};
      relationships.forEach((rel) => {
        const key = `${rel.from_table_id}-${rel.to_table_id}`;
        if (!edgeGroups[key]) {
          edgeGroups[key] = [];
        }
        // console.log(edgeGroups[key]);

        const exists = edgeGroups[key].some(
          (r) =>
            r.from_column === rel.from_column && r.to_column === rel.to_column
        );

        if (!exists) {
          edgeGroups[key].push(rel);
        }
      });

      const newNodes = tableIds.map((tableId, index) => ({
        id: tableId.toString(),
        type: "schemaCard",
        data: {
          label: tableMap[tableId]?.name || `Table ${tableId}`,
          table: tableMap[tableId],
          darkmode: darkmode,
          selectedDatabase: selectedPath?.database,
          setSelectedTable: setSelectedTable,
          setSelectedPath: setSelectedPath,
        },
        position: {
          x: (index % 3) * 600,
          y: Math.floor(index / 3) * 700,
        },
      }));

      const newEdges = Object.entries(edgeGroups).map(([key, rels]) => {
        const [fromId, toId] = key.split("-");
        return {
          id: `e${key}`,
          source: fromId.toString(),
          target: toId.toString(),
          type: "custom", // Use our custom edge
          label: rels
            .map(
              (rel) =>
                `${rel.from_table_name}.${rel.from_column} → ${rel.to_table_name}.${rel.to_column} (${rel.cardinality})`
            )
            .join("\n"),
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
          data: {
            relationships: rels,
          },
        };
      });

      return { nodes: newNodes, edges: newEdges };
    },
    [darkmode, selectedPath?.database]
  );

  async function fetchRelationships(er_entity_id) {
    try {
      setEdges([]);
      setNodes([]);
      if (selectedTable == null) {
        const response = await axios.get(
          `http://localhost:5000/api/er_relationships/${er_entity_id}`
        );
        return response.data;
      } else {
        const response = await axios.get(
          `http://localhost:5000/api/er_relationships/${er_entity_id}/${selectedTable}`
        );
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching relationships:", error);
      throw error;
    }
  }
  async function getERdiagram(diagram_id) {
    setErLoading(true);
    const relationships = await fetchRelationships(diagram_id);
    // console.log(relationships);
    setRels(relationships);
    if (!relationships) {
      setNodes([]);
      setEdges([]);
      return;
    }
    const { nodes: newNodes, edges: newEdges } = await createNodesAndEdges(
      relationships
    );
    setErLoading(false);
    setNodes(newNodes);
    setEdges(newEdges);
  }
  useEffect(() => {
    if (!selectedPath?.lob) return;

    let ignore = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const { data } = await endpoints.getErEntities(selectedPath.lob);
        console.log("ER Entities Data:", data);
        setEntities(data?.data ?? []);
      } catch (err) {
        if (!ignore) setError(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [selectedPath?.lob]);

  const handleEntityClick = (entity) => {
    getERdiagram(entity.id);
    setErDiagramName(entity.entity_name);
    setSelectedErDiagram(entity.id);
  };

  const handleEditEntity = (e, entityId) => {
    e.stopPropagation();
    setCreate("relationshipDiagram");
    // console.log("Edit entity:", entityId);
  };

  const handleDeleteEntity = (e, entityId) => {
    e.stopPropagation();
    // console.log("delete");
    try {
      if (confirm("Do you want to delete this ER diagram") == true) {
        setEntities((entities) => {
          return entities.filter((entity) => entity.id !== entityId);
        });
        const response = endpoints.deleteERdiagram(entityId);
      }
    } catch {}
  };

  if (!selectedPath?.lob) return null;

  return (
    <>
      {selectedErDiagram ? (
        <div
          className={`w-full max-w-md mx-auto ${
            darkmode ? "bg-gray-900" : "bg-white"
          } rounded-xl shadow-lg overflow-hidden`}
        >
          {/* Header */}
          <div
            className={`px-6 py-4 border-b ${
              darkmode
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    darkmode ? "bg-blue-900/50" : "bg-blue-100"
                  }`}
                >
                  <Network
                    className={darkmode ? "text-blue-400" : "text-blue-600"}
                    size={20}
                  />
                </div>
                <div>
                  <h3
                    className={`font-semibold text-lg ${
                      darkmode ? "text-blue-200" : "text-gray-800"
                    }`}
                  >
                    Relationships
                  </h3>
                  {selectedPath.lob && (
                    <span
                      className={`text-sm ${
                        darkmode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {erDiagramName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-3">
            <div
              className={`space-y-4 max-h-96 overflow-y-auto ${
                darkmode ? "custom-scrollbar-dark" : "custom-scrollbar-light"
              }`}
            >
              <div className="flex justify-start w-full  mb-4">
                <button
                  onClick={(e) => handleEditEntity(e, selectedErDiagram)}
                  className={`flex items-center justify-centers w-full gap-2 px-4 py-2 rounded-lg font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${
                      darkmode
                        ? "bg-blue-900/60 text-blue-200 hover:bg-blue-800 hover:text-white"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-900"
                    }`}
                  title="Add relationship"
                >
                  <Plus className="w-5 h-5" />
                  Add Relationship
                </button>
              </div>
              {/* <div className="flex items-center gap-3 ">
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {entity.name}
                    </span>
                  </div> */}

              {rels.length > 0 ? (
                rels.map((relItem) => (
                  <div
                    key={relItem.id}
                    className={`group  relative p-4 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer ${
                      darkmode
                        ? "bg-gradient-to-r from-gray-800 to-gray-800 border-gray-700 hover:border-blue-600"
                        : "bg-gradient-to-r from-blue-50 to-green-50 border-gray-200 hover:border-blue-300"
                    }`}
                    tabIndex={0}
                    aria-label={`Relationship: ${relItem.display}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Database
                            className={
                              darkmode ? "text-blue-400" : "text-blue-600"
                            }
                            size={16}
                          />
                          <span
                            className={`font-medium ${
                              darkmode ? "text-blue-100" : "text-gray-800"
                            }`}
                          >
                            {relItem.display}
                          </span>
                        </div>

                        <div
                          className={`text-xs flex items-center gap-1 ${
                            darkmode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          <Network size={14} />
                          <span>Foreign Key Relationship</span>
                        </div>
                      </div>

                      {user === "admin" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteERfunc(
                              relItem.id,
                              relItem.from_column,
                              relItem.to_column,
                              relItem.to_table_id,
                              relItem.from_table_id
                            );
                          }}
                          className={`opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all duration-200 ${
                            darkmode
                              ? "text-red-400 hover:bg-red-900/50 hover:text-red-300"
                              : "text-red-500 hover:bg-red-100 hover:text-red-700"
                          }`}
                          aria-label={`Delete relationship ${relItem.display}`}
                          title={`Delete relationship ${relItem.display}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className={`text-center py-8 ${
                    darkmode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <Network
                    className={`mx-auto mb-3 ${
                      darkmode ? "text-gray-600" : "text-gray-400"
                    }`}
                    size={48}
                  />
                  <p className="text-sm">
                    No relationships found for this selection.
                  </p>
                </div>
              )}
            </div>

            {/* Back Button */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setErDiagramName("");
                  setSelectedErDiagram();
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  darkmode
                    ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                <ArrowLeft size={16} />
                <span>Back to Diagrams</span>
              </button>
            </div>
          </div>

          {/* Custom Scrollbar Styles */}
          <style jsx>{`
            .custom-scrollbar-light::-webkit-scrollbar {
              width: 6px;
            }

            .custom-scrollbar-light::-webkit-scrollbar-track {
              background: #f8fafc;
              border-radius: 6px;
            }

            .custom-scrollbar-light::-webkit-scrollbar-thumb {
              background: #e2e8f0;
              border-radius: 6px;
            }

            .custom-scrollbar-light::-webkit-scrollbar-thumb:hover {
              background: #cbd5e1;
            }

            .custom-scrollbar-dark::-webkit-scrollbar {
              width: 6px;
            }

            .custom-scrollbar-dark::-webkit-scrollbar-track {
              background: #1e293b;
              border-radius: 6px;
            }

            .custom-scrollbar-dark::-webkit-scrollbar-thumb {
              background: #475569;
              border-radius: 6px;
            }

            .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
              background: #64748b;
            }

            .custom-scrollbar-light {
              scrollbar-width: thin;
              scrollbar-color: #e2e8f0 #f8fafc;
            }

            .custom-scrollbar-dark {
              scrollbar-width: thin;
              scrollbar-color: #475569 #1e293b;
            }
          `}</style>
        </div>
      ) : (
        // </div>
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                ER Diagrams
              </span>
              {selectedPath.lob && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({selectedPath.lob})
                </span>
              )}
            </div>
            {entities.length > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {entities.length} entities
              </span>
            )}
          </div>

          <div className="flex-1 overflow-hidden">
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center p-8 h-full">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Loading entities...
                  </span>
                </div>
              </div>
            )}
            {/* Error State */}
            {error && (
              <div className="p-4">
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-800 dark:text-red-300">
                      Failed to load entities
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                      {error.message || "An unexpected error occurred"}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* Empty State */}
            {!loading && !error && entities.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <Database className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                  No entities found for <strong>{selectedPath.lob}</strong>
                </h3>
                {/* <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No entities found for <strong>{selectedPath.lob}</strong>
                </p> */}
                {/* <button
                  onClick={() => setCreate("erdiagram")}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create your first entity
                </button> */}
              </div>
            )}

            {/* Entities List */}
            {!loading && !error && entities.length > 0 && (
              <div className="p-4 h-full overflow-auto">
                <div className="space-y-3">
                  {entities.map((entity) => (
                    <div
                      key={entity.id}
                      onClick={() => handleEntityClick(entity)}
                      className={`group flex items-center justify-between ${
                        selectedErDiagram == entity.id
                          ? "dark:bg-blue-800"
                          : "dark:bg-gray-800"
                      } p-4  in-active:bg-blue-400 bg-gray-50  hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-sm`}
                    >
                      <div className="flex items-center gap-3 ">
                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {entity.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleDeleteEntity(e, entity.id)}
                          className="p-1.5 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Delete entity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
            <button
              onClick={() => setCreate("erdiagram")}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              disabled={loading}
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>
      )}
    </>
  );
}
