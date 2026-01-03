import axios from "axios";

const API = axios.create({
  baseURL: "https://ideasprint-backend-server.onrender.com/api",
});

API.interceptors.request.use((req) => {
  const adminToken = localStorage.getItem("adminToken");
  if (adminToken) {
    req.headers.Authorization = `Bearer ${adminToken}`;
  }
  return req;
});

export default API;
