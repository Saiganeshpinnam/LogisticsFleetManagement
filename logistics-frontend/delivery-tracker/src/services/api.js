import axios from "axios";

// Create Axios instance with base URL
const api = axios.create({
  baseURL: "http://localhost:4000/api",
});

// Add Authorization header automatically if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// -------------------- Helper functions --------------------

// Get token from localStorage
export function getToken() {
  return localStorage.getItem("token");
}

// Save token to localStorage
export function setToken(token) {
  localStorage.setItem("token", token);
}

// Remove token (logout)
export function removeToken() {
  localStorage.removeItem("token");
}

// Check if user is logged in
export function isLoggedIn() {
  return !!getToken();
}

// Get user role from JWT token
export function getRole() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role;
  } catch (err) {
    console.error("Invalid token", err);
    return null;
  }
}
