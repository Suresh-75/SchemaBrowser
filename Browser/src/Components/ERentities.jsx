import { useEffect, useState } from "react";
import {
  Loader2,
  AlertTriangle,
  Database,
  ContainerIcon,
  BluetoothConnected,
  LucideGitBranchPlus,
} from "lucide-react";

import api from "../api";

export default function ErEntities({
  selectedPath,
  getERdiagram,
  setSelectedErDiagram,
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
    <section className="bg-white dark:bg-gray-900 rounded-xl shadow-lg px-2 w-full max-w-2xl ">
      <h3 className="text-2xl font-semibold flex items-center gap-2  text-gray-800 dark:text-white">
        <LucideGitBranchPlus size={22} />
        ER Diagrams
      </h3>

      {loading && (
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 animate-pulse">
          <Loader2 className="animate-spin" size={18} />
          Loading entities…
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertTriangle size={18} />
          Could not fetch entities: {error.message}
        </div>
      )}

      {!loading && !error && entities.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">
          No entities found for <strong>{selectedPath.lob}</strong>.
        </p>
      )}

      <div className="grid gap-3 mt-4 ">
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
    </section>
  );
}
