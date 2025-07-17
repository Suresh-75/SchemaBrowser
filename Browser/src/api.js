import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const endpoints = {
  // Table operations
  getTables: () => api.get("/tables"),
  getTablesByDatabase: (dbName) => api.get(`/tables/${dbName}`),
  getTableAttributes: (tableId) => api.get(`/tables/${tableId}/attributes`),
  createTable: (data) => api.post("/tables", data),
  deleteTable: (tableId) => api.delete(`/tables/${tableId}`),
  addTable: (data) => api.post("/addTM", data), // New endpoint for adding table

  // Overview and profiles
  getTableOverview: (schema, table) =>
    api.get(`/table-overview/${table}`),
  getSchemaOverview: (schema) => api.get(`/schema-overview/${schema}`),
  getTableProfile: (data) => api.post("/profile", data),
  downloadCsv: (schema, table) =>
    api.get(`/table-csv/${schema}/${table}`, { responseType: "blob" }),

  // Relationships
  getRelationships: (dbName) => api.get(`/er_relationships/${dbName}`),
  getTableRelationships: (dbName, tableId) =>
    api.get(`/er_relationships/${dbName}/${tableId}`),
  createRelationship: (data) => api.post("/er_relationships", data),

  // Hierarchy
  getHierarchy: () => api.get("/hierarchy"),

  // Search
  search: (query) => api.get(`/search?q=${query}`),

  // Administrative operations
  createLob: (data) => api.post("/lobs", data),
  createSubjectArea: (data) => api.post("/subject-areas", data),
  createLogicalDatabase: (data) => api.post("/logical-databases", data),

  //delete ER
  deleteER: (id) => api.delete(`/er_relationships/${id}`),

  //get ER entities
  getErEntities: (lob_name) => api.get("/get_er_entities/" + lob_name),

  // create ER entities

  createDiagram: (data) => api.post("/create_er_diagram", data),
  deleteERdiagram: (entityId) => api.delete("/delete_er_diagram/" + entityId),
  createER: (data) => api.post("/createER", data),
  // Logical Database operations for import
  getLogicalDatabases: () => api.get("/logical-databases"), // GET all logical databases
};

export default endpoints;
