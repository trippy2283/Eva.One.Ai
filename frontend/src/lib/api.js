import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

// Auth
export const fetchMe = () => api.get("/auth/me").then((r) => r.data);
export const exchangeSession = (session_id) =>
  api.post("/auth/session", { session_id }).then((r) => r.data);
export const logout = () => api.post("/auth/logout").then((r) => r.data);
export const onboard = () => api.post("/onboard").then((r) => r.data);

// Models
export const listModels = () => api.get("/models").then((r) => r.data);

// Chat
export const listSessions = () => api.get("/chat/sessions").then((r) => r.data);
export const createSession = (body) =>
  api.post("/chat/sessions", body || {}).then((r) => r.data);
export const deleteSession = (id) =>
  api.delete(`/chat/sessions/${id}`).then((r) => r.data);
export const listMessages = (sid) =>
  api.get(`/chat/sessions/${sid}/messages`).then((r) => r.data);
export const sendMessage = (sid, body) =>
  api.post(`/chat/sessions/${sid}/messages`, body).then((r) => r.data);

// Voice
export const transcribeAudio = (blob) => {
  const fd = new FormData();
  fd.append("audio", blob, "voice.webm");
  return api
    .post("/voice/transcribe", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};
export const speakText = (text, voice = "nova") =>
  api
    .post("/voice/speak", { text, voice }, { responseType: "blob" })
    .then((r) => r.data);

// Files
export const listFiles = () => api.get("/files").then((r) => r.data);
export const uploadFile = (file, onProgress) => {
  const fd = new FormData();
  fd.append("file", file);
  return api
    .post("/files/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: onProgress,
    })
    .then((r) => r.data);
};
export const analyzeFile = (id, model) =>
  api.post(`/files/${id}/analyze`, { model }).then((r) => r.data);
export const deleteFile = (id) =>
  api.delete(`/files/${id}`).then((r) => r.data);
export const getFile = (id) => api.get(`/files/${id}`).then((r) => r.data);

// Vault
export const listNotes = (q, tag) =>
  api.get("/vault/notes", { params: { q, tag } }).then((r) => r.data);
export const createNote = (body) =>
  api.post("/vault/notes", body).then((r) => r.data);
export const updateNote = (id, body) =>
  api.put(`/vault/notes/${id}`, body).then((r) => r.data);
export const deleteNote = (id) =>
  api.delete(`/vault/notes/${id}`).then((r) => r.data);
export const vaultSearch = (q) =>
  api.get("/vault/search", { params: { q } }).then((r) => r.data);

// Projects
export const listProjects = () => api.get("/projects").then((r) => r.data);
export const createProject = (body) =>
  api.post("/projects", body).then((r) => r.data);
export const updateProject = (id, body) =>
  api.put(`/projects/${id}`, body).then((r) => r.data);
export const deleteProject = (id) =>
  api.delete(`/projects/${id}`).then((r) => r.data);

// Dashboard
export const dashboardStats = () =>
  api.get("/dashboard/stats").then((r) => r.data);
export const dashboardActivity = () =>
  api.get("/dashboard/activity").then((r) => r.data);
