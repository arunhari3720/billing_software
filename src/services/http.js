import axios from "axios";
const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
});
http.interceptors.request.use((c) => {
  const t = localStorage.getItem("bf_token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
export default http;
