import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const adminToken = localStorage.getItem("adminToken");
  if (adminToken) {
    req.headers.Authorization = `Bearer ${adminToken}`;
  }
  return req;
});

export default API;
