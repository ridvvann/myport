const API_URL = import.meta.env.VITE_API_URL || "https://myport-vnrv.onrender.com";
const TOKEN_KEY = "saki-admin-token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function login(password) {
  const res = await fetch(`${API_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Login failed");
  }
  const { token } = await res.json();
  setToken(token);
  return token;
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

export async function uploadMedia(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/api/admin/upload`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Upload failed");
  }
  return res.json(); // { url }
}

// Uploads every file for one project in a single request and returns
// { urls: [...] } in the same order the files were given.
export async function uploadMultipleMedia(files) {
  const formData = new FormData();
  for (const file of files) formData.append("files", file);
  const res = await fetch(`${API_URL}/api/admin/upload-multiple`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Upload failed");
  }
  return res.json(); // { urls }
}

export async function createProject(project) {
  const res = await fetch(`${API_URL}/api/admin/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(project),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Couldn't save project");
  }
  return res.json();
}

export async function deleteProject(id) {
  const res = await fetch(`${API_URL}/api/admin/projects/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Couldn't delete project");
  }
  return res.json();
}

export async function listProjects() {
  const res = await fetch(`${API_URL}/api/projects`);
  if (!res.ok) throw new Error("Couldn't load projects");
  return res.json();
}
