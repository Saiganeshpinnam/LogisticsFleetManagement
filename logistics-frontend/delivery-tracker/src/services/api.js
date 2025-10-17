import axios from "axios";

// ✅ Adjust to your backend port (check app.js — usually 4000 or 5000)
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://logisticsfleetmanagement.onrender.com/api",
});

// Automatically add token if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Token expired or invalid, redirecting to login...');
      // Remove expired token
      localStorage.removeItem("token");
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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

// Check if token is expired
export function isTokenExpired() {
  const token = getToken();
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000; // Convert to seconds
    return payload.exp < currentTime;
  } catch (err) {
    console.error("Invalid token", err);
    return true;
  }
}

// Check login (including token expiration)
export function isLoggedIn() {
  const token = getToken();
  if (!token) return false;
  
  if (isTokenExpired()) {
    console.log('Token expired, removing from storage');
    removeToken();
    return false;
  }
  
  return true;
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
