import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  useReactFlow,
} from "@xyflow/react";

export default function CustomEdgeLabel({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  // If you pass any custom props like 'labelContent' from your edge definition,
  // make sure to destructure them here:
  // labelContent,
}) {
  const { deleteElements } = useReactFlow();
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  // Calculate the midpoint of the edge for label placement
  // This is a common way to manually position labels with EdgeLabelRenderer
  const centerX = (sourceX + targetX) / 2;
  const centerY = (sourceY + targetY) / 2;

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        {/*
          Position the label using CSS 'transform' with the calculated centerX, centerY.
          'transform: translate(-50%, -50%)' centers the div around its own calculated x,y.
          Apply Tailwind CSS classes for font size and other styling directly here.
        */}
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${centerX}px, ${centerY}px)`,
            pointerEvents: "all", // Allows interaction with the label
            zIndex: 10, // Ensures it's above the edge line
          }}
          className="nodrag nopan" // React Flow utility classes to prevent dragging/panning
        >
          <div
            // Apply Tailwind CSS classes for styling the label content
            className="bg-blue-500 text-white px-2 py-1 rounded text-lg font-bold shadow-md"
            // You can use any of these font sizing classes:
            // text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl, etc.
          >
            {/* Display your label content */}
            {/* You could use a prop here like: {labelContent || 'Connect'} */}
            Connect
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
