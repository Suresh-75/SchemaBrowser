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
  Handle,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import SchemaCards from "./SchemaCards";
import axios from "axios";
import { toJpeg } from "html-to-image";

// Modal for relationship input
function RelationshipModal({ open, onClose, onSave, fromNode, toNode }) {
  const [relationshipType, setRelationshipType] = React.useState("1:N");
  const [fromColumn, setFromColumn] = React.useState("");
  const [toColumn, setToColumn] = React.useState("");
  const [cardinality, setCardinality] = React.useState("1:N");

  React.useEffect(() => {
    if (open) {
      setRelationshipType("1:N");
      setCardinality("1:N");
      setFromColumn("");
      setToColumn("");
    }
  }, [open]);

  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.3)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "white",
          padding: 24,
          borderRadius: 8,
          minWidth: 320,
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Define Relationship</h3>
        <div style={{ marginBottom: 8 }}>
          <b>From Table:</b> {fromNode?.data?.label || fromNode?.id}
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>To Table:</b> {toNode?.data?.label || toNode?.id}
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Relationship Type: </label>
          <select
            value={relationshipType}
            onChange={(e) => {
              setRelationshipType(e.target.value);
              setCardinality(e.target.value);
            }}
          >
            <option value="1:1">1:1</option>
            <option value="1:N">1:N</option>
            <option value="N:1">N:1</option>
            <option value="N:N">N:N</option>
          </select>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>From Column: </label>
          <input
            value={fromColumn}
            onChange={(e) => setFromColumn(e.target.value)}
            placeholder="(optional)"
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>To Column: </label>
          <input
            value={toColumn}
            onChange={(e) => setToColumn(e.target.value)}
            placeholder="(optional)"
          />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button onClick={onClose} style={{ padding: "6px 12px" }}>
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({ relationshipType, fromColumn, toColumn, cardinality })
            }
            style={{
              padding: "6px 12px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: 4,
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

const SchemaCardNode = React.memo(function SchemaCardNode({ data, id }) {
  return (
    <div style={{ display: "inline-block", position: "relative" }}>
      {/* Handles for React Flow connections */}
      <Handle type="target" position="left" id="target" style={{ background: '#555' }} />
      <Handle type="source" position="right" id="source" style={{ background: '#555' }} />
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
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingConnection, setPendingConnection] = useState(null); // { source, target }
  const [pendingNodes, setPendingNodes] = useState({ from: null, to: null });

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
        `http://localhost:5050/api/er_relationships/${databaseName}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching relationships:", error);
      throw error;
    }
  }

  async function fetchAllTables(databaseName) {
    try {
      const response = await axios.get(
        `http://localhost:5050/api/tables/${databaseName}`
      );
      return response.data; // Should be an array of table objects
    } catch (error) {
      console.error("Error fetching all tables:", error);
      return [];
    }
  }

  async function fetchTableInfo(tableId) {
    try {
      const response = await axios.get(
        `http://localhost:5050/api/tables/${tableId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching table info for table ${tableId}:`, error);
      return null;
    }
  }

  const createNodesAndEdges = useCallback(
    async (relationships, allTables) => {
      // Get all unique table IDs from allTables
      const tableIds = allTables.map((table) => table.id.toString());
      const tableMap = {};
      allTables.forEach((table) => {
        tableMap[table.id] = table;
      });

      const newNodes = tableIds.map((tableId, index) => ({
        id: tableId,
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
    },
    []
  );

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
        const [relationships, allTables] = await Promise.all([
          fetchRelationships(selectedPath.database),
          fetchAllTables(selectedPath.database),
        ]);
        const { nodes: newNodes, edges: newEdges } = await createNodesAndEdges(
          relationships,
          allTables
        );
        setNodes(newNodes);
        setEdges(newEdges);
      } catch (error) {
        console.error("Failed to load relationships or tables:", error);
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
    (connection) => {
      // Find node objects for modal display
      const from = nodes.find((n) => n.id === connection.source);
      const to = nodes.find((n) => n.id === connection.target);
      setPendingConnection(connection);
      setPendingNodes({ from, to });
      setModalOpen(true);
    },
    [nodes]
  );

  // Save relationship handler
  const handleSaveRelationship = async ({
    relationshipType,
    fromColumn,
    toColumn,
    cardinality,
  }) => {
    if (!pendingConnection || !selectedPath?.database) return;
    const { source, target } = pendingConnection;
    // Add edge visually
    setEdges((eds) => [
      ...eds,
      {
        id: `e${source}-${target}-${Date.now()}`,
        source,
        target,
        label: relationshipType,
        animated: true,
        data: { cardinality, relationshipType },
      },
    ]);
    // Send to backend
    try {
      await axios.post("http://localhost:5050/api/er_relationships", {
        from_table_id: source,
        to_table_id: target,
        from_column: fromColumn,
        to_column: toColumn,
        cardinality,
        relationship_type: relationshipType,
        database_name: selectedPath.database,
      });
    } catch (err) {
      console.error("Failed to save relationship", err);
    }
    setModalOpen(false);
    setPendingConnection(null);
    setPendingNodes({ from: null, to: null });
  };

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
      <RelationshipModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setPendingConnection(null);
          setPendingNodes({ from: null, to: null });
        }}
        onSave={handleSaveRelationship}
        fromNode={pendingNodes.from}
        toNode={pendingNodes.to}
      />
      {loading ? (
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
