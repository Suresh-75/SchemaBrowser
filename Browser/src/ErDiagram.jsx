import React, { useCallback, useState, useMemo, useEffect } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import SchemaCards from "./SchemaCards";
import axios from "axios";

const SchemaCardNode = React.memo(function SchemaCardNode({ data }) {
  return (
    <div style={{ display: "inline-block" }}>
      <SchemaCards table={data.table} />
    </div>
  );
});

const Legend = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        backgroundColor: "white",
        border: "1px solid #ccc",
        padding: "10px",
        borderRadius: "5px",
        fontSize: "12px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}
      >
        <div
          className="w-2 h-2 bg-yellow-400 rounded-full mr-4"
          title="Primary Key"
        ></div>
        <span className="font-semibold">Primary Key</span>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          className="w-2 h-2 bg-blue-400 rounded-full mr-4"
          title="Foreign Key"
        ></div>
        <span className="font-semibold">Foreign Key</span>
      </div>
    </div>
  );
};

function ErDiagram({ selectedPath }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch relationships from API
  async function fetchRelationships(databaseName) {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/er_relationships/${databaseName}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching relationships:", error);
      throw error;
    }
  }

  // Fetch table info by ID
  async function fetchTableInfo(tableId) {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/tables/${tableId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching table info for table ${tableId}:`, error);
      return null;
    }
  }

  // Function to create nodes and edges from relationships data
  const createNodesAndEdges = useCallback(async (relationships) => {
    // Get unique table IDs
    const tableIds = Array.from(
      new Set(
        relationships.flatMap((rel) => [rel.from_table_id, rel.to_table_id])
      )
    );

    // Fetch all table info in parallel
    const tableInfoPromises = tableIds.map((tableId) =>
      fetchTableInfo(tableId)
    );
    const tableInfos = await Promise.all(tableInfoPromises);

    const tableMap = {};
    tableIds.forEach((tableId, index) => {
      tableMap[tableId] = tableInfos[index];
    });
    console.log(tableIds);
    console.log(tableInfos);
    const newNodes = tableIds.map((tableId, index) => ({
      id: tableId.toString(),
      type: "schemaCard",
      data: {
        label: tableMap[tableId]?.name || `Table ${tableId}`,
        table: tableMap[tableId], // Pass the whole table object
      },
      position: {
        x: (index % 3) * 350,
        y: Math.floor(index / 3) * 300,
      },
    }));

    // Create edges from relationships
    const newEdges = relationships.map((rel) => ({
      id: `e${rel.from_table_id}-${rel.to_table_id}-${rel.id}`,
      source: rel.from_table_id.toString(),
      target: rel.to_table_id.toString(),
      label: `${rel.from_column} → ${rel.to_column}`,
      animated: true,
      data: {
        cardinality: rel.cardinality,
        relationshipType: rel.relationship_type,
      },
    }));

    return { nodes: newNodes, edges: newEdges };
  }, []); // createNodesAndEdges does not depend on anything outside itself now

  // Fetch data on component mount or when selectedPath.database changes
  useEffect(() => {
    const loadData = async () => {
      if (!selectedPath?.database) {
        setNodes([]);
        setEdges([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const relationships = await fetchRelationships(selectedPath.database);
        console.log("Fetched relationships:", relationships);

        const { nodes: newNodes, edges: newEdges } = await createNodesAndEdges(
          relationships
        );

        setNodes(newNodes);
        setEdges(newEdges);
      } catch (error) {
        console.error("Failed to load relationships:", error);
        setNodes([
          {
            id: "error",
            data: { label: "Error loading data" },
            position: { x: 0, y: 0 },
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [createNodesAndEdges, selectedPath.database]); // Depend on selectedPath.database

  const nodeTypes = useMemo(
    () => ({
      schemaCard: SchemaCardNode,
    }),
    []
  );

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  // --- Auto-fit on Resize ---
  const reactFlowInstance = useReactFlow();
  useEffect(() => {
    if (!loading && nodes.length > 0) {
      const timeout = setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.3 });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [reactFlowInstance, nodes, edges, loading]);

  useEffect(() => {
    const handleResize = () => {
      if (!loading) {
        reactFlowInstance.fitView({ padding: 0.3 });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [reactFlowInstance, loading]);
  // --------------------------

  return (
    <div style={{ position: "relative", height: "100%" }}>
      {loading && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          Loading relationships...
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodeTypes={nodeTypes}
        panOnDrag
        nodesDraggable
        proOptions={{ hideAttribution: true }}
        style={{
          willChange: "transform",
          background: "#f8f9fa",
          width: "100%",
          height: "100%",
        }}
      >
        <Background color="#ccc" gap={10} variant="dots" />
        <MiniMap nodeColor={"gray"} nodeStrokeWidth={3} zoomable pannable />
        <Controls />
      </ReactFlow>
      <Legend />
    </div>
  );
}

export default ErDiagram;
