import { GitBranch, Save, Tag } from "lucide-react";
import { useState } from "react";

const VersionControlPanel = () => {
  const [versions] = useState([
    {
      id: 1,
      name: "v1.0.0",
      date: "2024-06-15",
      author: "Kavya",
      current: false,
    },
    {
      id: 2,
      name: "v1.0.1",
      date: "2024-06-17",
      author: "Ananya",
      current: false,
    },
    {
      id: 3,
      name: "v1.1.0",
      date: "2024-06-18",
      author: "Andrew",
      current: false,
    },
    { id: 4, name: "v1.2.0", date: "2024-06-20", author: "You", current: true },
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="text-green-600" size={20} />
        <h3 className="font-semibold text-gray-800">Version Control</h3>
      </div>

      <div className="space-y-2">
        {versions.map((version) => (
          <div
            key={version.id}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              version.current
                ? "bg-green-50 border-green-200 shadow-sm"
                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag
                  size={14}
                  className={
                    version.current ? "text-green-600" : "text-gray-500"
                  }
                />
                <span
                  className={`font-medium ${
                    version.current ? "text-green-800" : "text-gray-700"
                  }`}
                >
                  {version.name}
                </span>
                {version.current && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Current
                  </span>
                )}
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {version.date} • {version.author}
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
        <Save size={16} />
        Save Version
      </button>
    </div>
  );
};

export default VersionControlPanel;
