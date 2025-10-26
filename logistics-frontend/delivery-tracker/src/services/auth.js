import { getToken, isLoggedIn as apiIsLoggedIn } from "./api";

export function isLoggedIn() {
  return apiIsLoggedIn(); // Use the improved version from api.js
}

export function getRole() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Handle both capitalized and lowercase roles for backward compatibility
    return payload.role.toLowerCase();
  } catch {
    return null;
  }
}
