import { getToken, isLoggedIn as apiIsLoggedIn } from "./api";

export function isLoggedIn() {
  return apiIsLoggedIn(); // Use the improved version from api.js
}

export function getRole() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role.toLowerCase(); // ensure lowercase for consistency
  } catch {
    return null;
  }
}
