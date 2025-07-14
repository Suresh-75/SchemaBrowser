import { useEffect, useState } from "react";
import { Loader2, AlertTriangle, Database, X, Plus } from "lucide-react";

import api from "../api";

export default function ErEntities({
  selectedPath,
  getERdiagram,
  setCreate,
  setSelectedErDiagram,
}) {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newEntity, setNewEntity] = useState({
    name: "",
    table1: "",
    table2: "",
    relationship: "one-to-many",
  });

  useEffect(() => {
    if (!selectedPath?.lob) return;

    let ignore = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const { data } = await api.getErEntities(selectedPath.lob);
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

  if (!selectedPath?.lob) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            ER Diagrams
          </span>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            Loading entities...
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg m-4">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <span className="text-red-700 dark:text-red-400">
            Could not fetch entities: {error.message}
          </span>
        </div>
      )}

      {!loading && !error && entities.length === 0 && (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          No entities found for **{selectedPath.lob}**.
        </div>
      )}

      <div className="flex-1 overflow-auto p-4">
        <div className="grid gap-3">
          {entities.map((en) => (
            <div
              key={en.id}
              onClick={() => {
                getERdiagram(en.id);
                setSelectedErDiagram(en.id);
              }}
              className="bg-gray-100 cursor-pointer py-4 dark:bg-gray-800 px-4 rounded-lg text-gray-800 dark:text-gray-200 shadow-sm hover:shadow-md transition"
            >
              {en.entity_name}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setCreate("erdiagram")}
          className="flex items-center gap-2 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
    </div>
  );
}
