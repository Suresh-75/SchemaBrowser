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
      <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
       <div
                      className="w-2 h-2 bg-yellow-400 rounded-full mr-4"
                      title="Primary Key"
                    ></div>
        <span className = "font-semibold">Primary Key</span>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
         <div
                      className="w-2 h-2 bg-blue-400 rounded-full mr-4"
                      title="Foreign Key"
                    ></div>
        <span className = "font-semibold">Foreign Key</span>
      </div>
    </div>
  );
};

function ErDiagram() {
  const customerTable = useMemo(
    () => ({
      name: "customers",
      rowCount: 5000,
      columns: [
        {
          name: "customer_id",
          type: "INTEGER",
          nullable: false,
          primaryKey: true,
        },
        { name: "first_name", type: "VARCHAR(100)", nullable: false },
        { name: "last_name", type: "VARCHAR(100)", nullable: false },
        { name: "email", type: "VARCHAR(255)", nullable: false },
        { name: "phone", type: "VARCHAR(20)", nullable: true },
        { name: "address", type: "VARCHAR(255)", nullable: true },
        { name: "created_at", type: "TIMESTAMP", nullable: false },
      ],
    }),
    []
  );
  const accountTable = useMemo(
    () => ({
      name: "accounts",
      rowCount: 3000,
      columns: [
        {
          name: "account_id",
          type: "INTEGER",
          nullable: false,
          primaryKey: true,
        },
        {
          name: "customer_id",
          type: "INTEGER",
          nullable: false,
          foreignKey: { table: "customers", column: "customer_id" },
        },
        {
          name: "branch_id",
          type: "INTEGER",
          nullable: false,
          foreignKey: { table: "branches", column: "branch_id" },
        },
        { name: "account_type", type: "VARCHAR(50)", nullable: false },
        { name: "balance", type: "DECIMAL(15,2)", nullable: false },
        { name: "opened_at", type: "TIMESTAMP", nullable: false },
        { name: "is_active", type: "BOOLEAN", nullable: false },
      ],
    }),
    []
  );
  const transactionTable = useMemo(
    () => ({
      name: "transactions",
      rowCount: 20000,
      columns: [
        {
          name: "transaction_id",
          type: "INTEGER",
          nullable: false,
          primaryKey: true,
        },
        {
          name: "account_id",
          type: "INTEGER",
          nullable: false,
          foreignKey: { table: "accounts", column: "account_id" },
        },
        { name: "amount", type: "DECIMAL(15,2)", nullable: false },
        { name: "transaction_type", type: "VARCHAR(50)", nullable: false },
        { name: "timestamp", type: "TIMESTAMP", nullable: false },
        { name: "description", type: "VARCHAR(255)", nullable: true },
      ],
    }),
    []
  );
  const branchTable = useMemo(
    () => ({
      name: "branches",
      rowCount: 50,
      columns: [
        {
          name: "branch_id",
          type: "INTEGER",
          nullable: false,
          primaryKey: true,
        },
        { name: "branch_name", type: "VARCHAR(100)", nullable: false },
        { name: "address", type: "VARCHAR(255)", nullable: false },
        {
          name: "manager_id",
          type: "INTEGER",
          nullable: true,
          foreignKey: { table: "employees", column: "employee_id" },
        },
      ],
    }),
    []
  );
  const employeeTable = useMemo(
    () => ({
      name: "employees",
      rowCount: 200,
      columns: [
        {
          name: "employee_id",
          type: "INTEGER",
          nullable: false,
          primaryKey: true,
        },
        { name: "first_name", type: "VARCHAR(100)", nullable: false },
        { name: "last_name", type: "VARCHAR(100)", nullable: false },
        { name: "email", type: "VARCHAR(255)", nullable: false },
        {
          name: "branch_id",
          type: "INTEGER",
          nullable: false,
          foreignKey: { table: "branches", column: "branch_id" },
        },
        { name: "position", type: "VARCHAR(100)", nullable: false },
        { name: "hired_at", type: "TIMESTAMP", nullable: false },
      ],
    }),
    []
  );

  const initialNodes = useMemo(
    () => [
      {
        id: "1",
        type: "schemaCard",
        data: { table: customerTable },
        position: { x: -100, y: -200 },
      },
      {
        id: "2",
        type: "schemaCard",
        data: { table: accountTable },
        position: { x: 350, y: -200 },
      },
      {
        id: "3",
        type: "schemaCard",
        data: { table: transactionTable },
        position: { x: 800, y: -200 },
      },
      {
        id: "4",
        type: "schemaCard",
        data: { table: branchTable },
        position: { x: 400, y: 500 },
      },
      {
        id: "5",
        type: "schemaCard",
        data: { table: employeeTable },
        position: { x: 800, y: 300 },
      },
    ],
    [customerTable, accountTable, transactionTable, branchTable, employeeTable]
  );

  const initialEdges = useMemo(
    () => [
      {
        id: "e2-1",
        source: "2",
        target: "1",
        label: "accounts.customer_id → customers.customer_id",
        animated: true,
      },
      {
        id: "e2-4",
        source: "2",
        target: "4",
        label: "accounts.branch_id → branches.branch_id",
        animated: true,
      },
      {
        id: "e3-2",
        source: "3",
        target: "2",
        label: "transactions.account_id → accounts.account_id",
        animated: true,
      },
      {
        id: "e4-5",
        source: "4",
        target: "5",
        label: "branches.manager_id → employees.employee_id",
        animated: true,
      },
      {
        id: "e5-4",
        source: "5",
        target: "4",
        label: "employees.branch_id → branches.branch_id",
        animated: true,
      },
    ],
    []
  );

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

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
    const timeout = setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.3 });
    }, 50);
    window.addEventListener("resize", () => reactFlowInstance.fitView({ padding: 0.3 }));
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", () => reactFlowInstance.fitView({ padding: 0.3 }));
    };
  }, [reactFlowInstance, nodes, edges]);
  // --------------------------

  return (
    <div style={{ position: "relative", height: "100%" }}>
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
