import axios from "axios";

// ✅ Adjust to your backend port (check app.js — usually 4000 or 5000)
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:4000/api",
});

// Automatically add token if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// -------------------- Helper functions --------------------

// Save token
export function setToken(token) {
  localStorage.setItem("token", token);
}

// Get token
export function getToken() {
  return localStorage.getItem("token");
}

// Remove token
export function removeToken() {
  localStorage.removeItem("token");
}

// Check login
export function isLoggedIn() {
  return !!getToken();
}

// Decode role from JWT
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

// Decode user id from JWT
export function getUserId() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id;
  } catch (err) {
    console.error("Invalid token", err);
    return null;
  }
}
