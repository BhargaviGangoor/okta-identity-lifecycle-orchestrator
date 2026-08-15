import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"
});

export const getUsers = () => api.get("/users");
export const getUser = (id) => api.get(`/users/${id}`);
export const createJoiner = (data) => api.post("/lifecycle/joiner", data);
export const moveUser = (id, data) => api.put(`/lifecycle/mover/${id}`, data);
export const leaveUser = (id, data) => api.post(`/lifecycle/leaver/${id}`, data);
export const getImpact = (id, action) => api.get(`/impact/${id}`, { params: { action } });
export const simulate = (data) => api.post("/what-if", data);
export const approve = (id) => api.post(`/approval/${id}/approve`);
export const reject = (id) => api.post(`/approval/${id}/reject`);
export const execute = (id) => api.post(`/execution/${id}`);
export const getDrift = () => api.get("/drift");
export const remediateDrift = (id) => api.post(`/drift/${id}/remediate`);
export const getAudit = () => api.get("/audit");
export const exportUsers = () => api.get("/users/export");

export default api;
