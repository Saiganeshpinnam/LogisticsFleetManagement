import { getToken } from "./api";

export function isLoggedIn() {
  return !!getToken();
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
