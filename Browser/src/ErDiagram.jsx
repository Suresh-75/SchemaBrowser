import React, {
  useCallback,
  useState,
  useMemo,
  useEffect,
  useRef,
} from "react";
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
import { toJpeg } from "html-to-image";
import CircleLoader from "./Components/CircleLoader";

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
        zIndex: 1000,
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

  const exportRef = useRef(null);
  const reactFlowInstance = useReactFlow();

  const handleExport = useCallback(() => {
    if (exportRef.current) {
      toJpeg(exportRef.current, {
        quality: 0.95,
        backgroundColor: "#ffffff",
      })
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = "er-diagram.jpg";
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error("Export failed", err);
        });
    }
  }, []);

  async function fetchRelationships(databaseName) {
    try {
      setEdges([]);
      setNodes([]);
      const response = await axios.get(
        `http://localhost:5000/api/er_relationships/${databaseName}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching relationships:", error);
      throw error;
    }
  }

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

  const createNodesAndEdges = useCallback(async (relationships) => {
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

    const newNodes = tableIds.map((tableId, index) => ({
      id: tableId.toString(),
      type: "schemaCard",
      data: {
        label: tableMap[tableId]?.name || `Table ${tableId}`,
        table: tableMap[tableId],
      },
      position: {
        x: (index % 3) * 600,
        y: Math.floor(index / 3) * 100,
      },
    }));

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
  }, []);

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
  }, [selectedPath.database]);

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

  return (
    <div style={{ position: "relative", height: "100%" }} ref={exportRef}>
      {loading ? (
        // <div
        //   style={{
        //     position: "absolute",
        //     top: "50%",
        //     left: "50%",
        //     transform: "translate(-50%, -50%)",
        //     zIndex: 1000,
        //     background: "white",
        //     padding: "20px",
        //     borderRadius: "8px",
        //     boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        //   }}
        // >
        //   Loading relationships...
        // </div>
        <CircleLoader size={48} strokeWidth={5} />
      ) : nodes.length == 0 ? (
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
            border: "1px solid #ccc",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          No relationships
        </div>
      ) : (
        <></>
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
      <button
        onClick={handleExport}
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
          padding: "8px 12px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        }}
      >
        Export as JPG
      </button>
    </div>
  );
}

export default ErDiagram;
