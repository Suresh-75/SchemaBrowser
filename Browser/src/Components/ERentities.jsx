import { useEffect, useState } from "react";
import {
  Loader2,
  AlertTriangle,
  Database,
  X,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import endpoints from "../api";
export default function ErEntities({
  selectedPath,
  getERdiagram,
  setCreate,
  setSelectedErDiagram,
  create,
  darkmode,
}) {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedPath?.lob) return;

    let ignore = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const { data } = await endpoints.getErEntities(selectedPath.lob);
        if (!ignore) setEntities(data?.data ?? []);
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
    setSelectedErDiagram(entity.id);
  };

  const handleEditEntity = (e, entityId) => {
    e.stopPropagation();
    setCreate("relationshipDiagram");
    console.log("Edit entity:", entityId);
  };

  const handleDeleteEntity = (e, entityId) => {
    e.stopPropagation();
    try {
      const response = endpoints.deleteERdiagram(entityId);
    } catch {}
  };

  if (!selectedPath?.lob) return null;

  return (
    <div className="flex flex-col h-[40rem] bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
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

      {/* Content Area */}
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
              No entities found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No entities found for <strong>{selectedPath.lob}</strong>
            </p>
            <button
              onClick={() => setCreate("erdiagram")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create your first entity
            </button>
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
                  className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {entity.entity_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleEditEntity(e, entity.id)}
                      className="p-1.5 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      title="Edit entity"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
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
  );
}
