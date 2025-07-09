import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", // Set your API base URL here
});

export default api;