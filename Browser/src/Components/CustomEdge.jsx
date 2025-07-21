import React from "react";
import { BaseEdge, EdgeLabelRenderer, getStraightPath } from "@xyflow/react";

// Normalize "One - to - Many" → "one-to-many"
function normalizeCardinality(card) {
  return card?.toLowerCase().replace(/\s+/g, '').trim();
}

// Map cardinality to marker type
function getMarkerType(cardinality) {
  const normalized = cardinality?.toLowerCase();
  if (normalized?.includes('many') || normalized?.includes('multiple')) {
    return 'many';
  } else if (normalized?.includes('one') || normalized?.includes('single')) {
    return 'one';
  } else if (normalized?.includes('zero') || normalized?.includes('optional')) {
    return 'zero';
  }
  return 'one'; // default
}

function CustomEdge({
  id,
  source,     // <<== now using this
  target,     // <<== and this
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  label,
  labelStyle,
  labelBgStyle,
  data,
}) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const rels = data?.relationships || [];

  let markerStartType = "one";
  let markerEndType = "one";

  for (const rel of rels) {
    const fromId = rel.from_table_id?.toString();
    const toId = rel.to_table_id?.toString();
    const cardinality = normalizeCardinality(rel.cardinality);

    if (!fromId || !toId || !cardinality) continue;

    const parts = cardinality.split("-");
    if (parts.length < 3) continue;

    const fromCard = parts[0];
    const toCard = parts[parts.length - 1]; // Get the last part for "to" cardinality

    const isForward = fromId === source && toId === target;
    const isBackward = fromId === target && toId === source;

    if (isForward) {
      markerStartType = getMarkerType(fromCard);
      markerEndType = getMarkerType(toCard);
      break;
    } else if (isBackward) {
      markerStartType = getMarkerType(toCard);
      markerEndType = getMarkerType(fromCard);
      break;
    }
  }

  const markerStart = `url(#${markerStartType})`;
  const markerEnd = `url(#${markerEndType})`;

  const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
  const offset = 20;
  const labelOffset = {
    x: Math.sin(angle) * offset,
    y: -Math.cos(angle) * offset,
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ strokeWidth: 2, stroke: "#333", ...style }}
        markerStart={markerStart}
        markerEnd={markerEnd}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX + labelOffset.x}px, ${labelY + labelOffset.y}px)`,
            fontSize: 12,
            pointerEvents: "all",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              ...labelStyle,
              padding: "4px 8px",
              borderRadius: "4px",
              whiteSpace: "pre-line",
              textAlign: "center",
              ...labelBgStyle,
            }}
          >
            {label}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default CustomEdge;
