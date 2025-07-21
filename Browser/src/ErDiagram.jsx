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
import { ArrowBigLeft } from "lucide-react";
import CustomEdge from "./Components/CustomEdge";
import MarkerDefs from "./Components/MarkerDefs";

const SchemaCardNode = React.memo(function SchemaCardNode({ data }) {
  return (
    <div style={{ display: "inline-block" }}>
      <SchemaCards
        table={data.table}
        darkmode={data.darkmode}
        selectedDatabase={data.selectedDatabase}
        setSelectedTable={data.setSelectedTable}
        setSelectedPath={data.setSelectedPath}
      />
    </div>
  );
});

const Legend = ({ darkmode, setSelectedTable }) => {
  return (
    <div
      className="cursor-pointer"
      onClick={() => setSelectedTable(null)}
      style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        backgroundColor: darkmode ? "#374151" : "white",
        border: darkmode ? "1px solid #4B5563" : "1px solid #ccc",
        padding: "10px",
        borderRadius: "5px",
        fontSize: "12px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
        zIndex: 1000,
        color: darkmode ? "#D1D5DB" : "#374151",
      }}
    >
      <ArrowBigLeft />
    </div>
  );
};

const ERLegend = ({ darkmode }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        backgroundColor: darkmode ? "#374151" : "white",
        border: darkmode ? "1px solid #4B5563" : "1px solid #ccc",
        padding: "12px",
        borderRadius: "8px",
        fontSize: "12px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
        zIndex: 1000,
        color: darkmode ? "#D1D5DB" : "#374151",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        minWidth: "200px",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "8px", fontSize: "13px" }}>
        Relationship Legend
      </div>

      {/* One-to-One */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
        <svg width="40" height="20" style={{ marginRight: "8px" }}>
          <defs>
            <marker
              id="legend-one-start"
              viewBox="0 0 24 24"
              refX="24"
              refY="12"
              markerWidth="8"
              markerHeight="8"
              orient="auto"
            >
              <path d="M 24 6 L 24 18" stroke={darkmode ? "#9CA3AF" : "#333"} strokeWidth="2" />
            </marker>
            <marker
              id="legend-one-end"
              viewBox="0 0 24 24"
              refX="24"
              refY="12"
              markerWidth="8"
              markerHeight="8"
              orient="auto"
            >
              <path d="M 24 6 L 24 18" stroke={darkmode ? "#9CA3AF" : "#333"} strokeWidth="2" />
            </marker>
          </defs>
          <line
            x1="2"
            y1="10"
            x2="38"
            y2="10"
            stroke={darkmode ? "#9CA3AF" : "#333"}
            strokeWidth="2"
            markerStart="url(#legend-one-start)"
            markerEnd="url(#legend-one-end)"
          />
        </svg>
        <span>One-to-One</span>
      </div>

      {/* One-to-Many */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
        <svg width="40" height="20" style={{ marginRight: "8px" }}>
          <defs>
            <marker
              id="legend-one"
              viewBox="0 0 24 24"
              refX="24"
              refY="12"
              markerWidth="8"
              markerHeight="8"
              orient="auto"
            >
              <path d="M 24 6 L 24 18" stroke={darkmode ? "#9CA3AF" : "#333"} strokeWidth="2" />
            </marker>
            <marker
              id="legend-many"
              viewBox="0 0 24 24"
              refX="24"
              refY="12"
              markerWidth="10"
              markerHeight="10"
              orient="auto"
            >
              <path d="M 24 12 L 12 6" stroke={darkmode ? "#9CA3AF" : "#333"} strokeWidth="2" fill="none" />
              <path d="M 24 12 L 12 12" stroke={darkmode ? "#9CA3AF" : "#333"} strokeWidth="2" fill="none" />
              <path d="M 24 12 L 12 18" stroke={darkmode ? "#9CA3AF" : "#333"} strokeWidth="2" fill="none" />
            </marker>
          </defs>
          <line
            x1="2"
            y1="10"
            x2="38"
            y2="10"
            stroke={darkmode ? "#9CA3AF" : "#333"}
            strokeWidth="2"
            markerStart="url(#legend-one)"
            markerEnd="url(#legend-many)"
          />
        </svg>
        <span>One-to-Many</span>
      </div>


    </div>
  );
};

// Accept darkmode prop here
function ErDiagram({
  setSelectedPath,
  selectedPath,
  darkmode,
  nodes,
  edges,
  setNodes,
  setEdges,
  setSelectedTable,
  selectedTable,
  setErLoading,
  erLoading,
}) {
  const [error, setError] = useState(false);
  // const [tableData, setTableData] = useState([]);

  const exportRef = useRef(null);
  const reactFlowInstance = useReactFlow();

  const handleExport = useCallback(() => {
    if (exportRef.current) {
      toJpeg(exportRef.current, {
        quality: 0.95,
        backgroundColor: darkmode ? "#1F2937" : "#ffffff",
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
      if (selectedTable == null) {
        const response = await axios.get(
          `http://localhost:5000/api/er_relationships/${databaseName}`
        );
        return response.data;
      } else {
        const response = await axios.get(
          `http://localhost:5000/api/er_relationships/${databaseName}/${selectedTable}`
        );
        // console.log(response.data);
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching relationships:", error);
      throw error;
    }
  }
  // useEffect(() => {
  //   createNodesAndEdges();
  // }, [selectedTable]);
  async function fetchTableInfo(tableId) {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/tables/${tableId}/attributes`
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching table info for table ${tableId}:`, error);
      return null;
    }
  }

  const edgeTypes = useMemo(
    () => ({
      custom: CustomEdge,
    }),
    []
  );

  const createNodesAndEdges = useCallback(
    async (relationships = []) => {
      // Add default empty array
      if (!relationships) {
        return { nodes: [], edges: [] };
      }
      console.log(relationships);
      const relationshipArray = relationships || [];
      // Use relationshipArray instead of relationships
      const tableIds = Array.from(
        new Set(
          relationshipArray.flatMap((rel) => [
            rel.from_table_id,
            rel.to_table_id,
          ])
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

      // Use relationshipArray here as well
      const edgeGroups = {};
      relationshipArray.forEach((rel) => {
        const key = `${rel.from_table_id}-${rel.to_table_id}`;
        if (!edgeGroups[key]) {
          edgeGroups[key] = [];
        }
        // console.log(edgeGroups[key]);

        const exists = edgeGroups[key].some(
          (r) =>
            r.from_column === rel.from_column && r.to_column === rel.to_column
        );

        if (!exists) {
          edgeGroups[key].push(rel);
        }
      });

      const newNodes = tableIds.map((tableId, index) => ({
        id: tableId.toString(),
        type: "schemaCard",
        data: {
          label: tableMap[tableId]?.name || `Table ${tableId}`,
          table: tableMap[tableId],
          darkmode: darkmode,
          selectedDatabase: selectedPath?.database,
          setSelectedTable: setSelectedTable,
          setSelectedPath: setSelectedPath,
        },
        position: {
          x: (index % 3) * 600,
          y: Math.floor(index / 3) * 700,
        },
      }));

      const newEdges = Object.entries(edgeGroups).map(([key, rels]) => {
        const [fromId, toId] = key.split("-");
        return {
          id: `e${key}`,
          source: fromId.toString(),
          target: toId.toString(),
          type: "custom", // Use our custom edge
          label: rels
            .map(
              (rel) =>
                `${rel.from_column} → ${rel.to_column} (${rel.cardinality})`
            )
            .join("\n"),
          style: {
            stroke: darkmode ? "#9CA3AF" : "#666",
            strokeWidth: 2
          },
          labelStyle: {
            fontSize: "12px",
            fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fill: darkmode ? "#E5E7EB" : "#374151",
            lineHeight: "1.4em",
            whiteSpace: "pre",
          },
          labelBgStyle: {
            fill: darkmode ? "#374151" : "#FFFFFF",
            fillOpacity: 0.95,
            stroke: darkmode ? "#4B5563" : "#E5E7EB",
            strokeWidth: 1,
            rx: 3,
          },
          data: {
            relationships: rels,
          },
        };
      });

      return { nodes: newNodes, edges: newEdges };
    },
    [selectedPath?.database, setSelectedTable, setSelectedPath]
  );

  useEffect(() => {
    const loadData = async () => {
      if (!selectedPath?.database) {
        setNodes([]);
        setEdges([]);
        setErLoading(false);
        return;
      }

      try {
        setErLoading(true);
        const relationships = await fetchRelationships(selectedPath.database);
        console.log(relationships);
        if (!relationships) {
          setNodes([]);
          setEdges([]);
          return;
        }
        const { nodes: newNodes, edges: newEdges } = await createNodesAndEdges(
          relationships
        );
        console.log(newNodes);
        setNodes(newNodes);
        setEdges(newEdges);
      } catch (error) {
        console.error("Failed to load relationships:", error);
        setError(true);
      } finally {
        setErLoading(false);
      }
    };

    loadData();
  }, [selectedPath?.database, createNodesAndEdges, selectedTable]);

  // Separate useEffect to update styling when darkmode changes without refetching data
  useEffect(() => {
    if (nodes.length > 0) {
      // Update node data for darkmode
      const updatedNodes = nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          darkmode: darkmode
        }
      }));
      setNodes(updatedNodes);
    }

    if (edges.length > 0) {
      // Update edge styling for darkmode
      const updatedEdges = edges.map(edge => ({
        ...edge,
        style: {
          stroke: darkmode ? "#9CA3AF" : "#666",
          strokeWidth: 2
        },
        labelStyle: {
          fontSize: "12px",
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fill: darkmode ? "#E5E7EB" : "#374151",
          lineHeight: "1.4em",
          whiteSpace: "pre",
        },
        labelBgStyle: {
          fill: darkmode ? "#374151" : "#FFFFFF",
          fillOpacity: 0.95,
          stroke: darkmode ? "#4B5563" : "#E5E7EB",
          strokeWidth: 1,
          rx: 3,
        }
      }));
      setEdges(updatedEdges);
    }
  }, [darkmode]);

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
  const onConnect = useCallback((params) => {
    // console.log(params);
    setEdges((eds) => addEdge(params, eds));
  }, []);

  useEffect(() => {
    if (!erLoading && nodes.length > 0) {
      const timeout = setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.3 });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [reactFlowInstance, nodes, edges, erLoading]);

  useEffect(() => {
    const handleResize = () => {
      if (!erLoading) {
        reactFlowInstance.fitView({ padding: 0.3 });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [reactFlowInstance, erLoading]);

  return (
    <div style={{ position: "relative", height: "100%" }} ref={exportRef}>
      <MarkerDefs darkmode={darkmode} />
      {erLoading ? (
        <CircleLoader size={48} strokeWidth={5} />
      ) : error ? (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
            background: darkmode ? "#374151" : "white", // Dark mode background
            padding: "20px",
            borderRadius: "8px",
            border: darkmode ? "1px solid #4B5563" : "1px solid #ccc", // Dark mode border
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
            color: darkmode ? "#D1D5DB" : "#374151", // Dark mode text color
          }}
        >
          Error loading relationships
        </div>
      ) : nodes.length === 0 ? (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
            background: darkmode ? "#374151" : "white", // Dark mode background
            padding: "20px",
            borderRadius: "8px",
            border: darkmode ? "1px solid #4B5563" : "1px solid #ccc", // Dark mode border
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
            color: darkmode ? "#D1D5DB" : "#374151", // Dark mode text color
          }}
        >
          No relationships
        </div>
      ) : null}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        // onConnect={onConnect}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        panOnDrag
        nodesDraggable
        proOptions={{ hideAttribution: true }}
        style={{
          willChange: "transform",
          background: darkmode ? "#1F2937" : "#f8f9fa", // Dark mode background
          width: "100%",
          height: "100%",
        }}
      >
        <Background
          color={darkmode ? "#4B5563" : "#ccc"}
          gap={10}
          variant="dots"
        />{" "}
        {/* <MiniMap
          nodeColor={darkmode ? "#9CA3AF" : "gray"}
          nodeStrokeWidth={3}
          zoomable
          pannable
        /> */}
        <Controls className="text-black" />
      </ReactFlow>
      <ERLegend darkmode={darkmode} />
      {/* <Legend darkmode={darkmode} setSelectedTable={setSelectedTable} /> */}
      <button
        onClick={handleExport}
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
          padding: "8px 12px",
          backgroundColor: darkmode ? "#2563EB" : "#007bff",
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
