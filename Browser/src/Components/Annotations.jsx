import { MessageSquare, Plus } from "lucide-react";
import { useState } from "react";

const AnnotationsPanel = () => {
  const [annotations] = useState([
    {
      id: 1,
      type: "entity",
      target: "User",
      note: "Primary entity for authentication",
      color: "blue",
    },
    {
      id: 2,
      type: "relationship",
      target: "User-Order",
      note: "One-to-many relationship",
      color: "green",
    },
    {
      id: 3,
      type: "attribute",
      target: "email",
      note: "Unique constraint required",
      color: "orange",
    },
  ]);

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-50 border-blue-200 text-blue-800",
      green: "bg-green-50 border-green-200 text-green-800",
      orange: "bg-orange-50 border-orange-200 text-orange-800",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="text-purple-600" size={20} />
        <h3 className="font-semibold text-gray-800">Annotations</h3>
      </div>
      <div className="space-y-3">
        {annotations.map((annotation) => (
          <div
            key={annotation.id}
            className={`p-3 rounded-lg border ${getColorClasses(
              annotation.color
            )}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium uppercase tracking-wide">
                {annotation.type}
              </span>
              <span className="text-sm font-semibold">{annotation.target}</span>
            </div>
            <p className="text-sm">{annotation.note}</p>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
        <Plus size={16} />
        Add Annotation
      </button>
    </div>
  );
};

export default AnnotationsPanel;
