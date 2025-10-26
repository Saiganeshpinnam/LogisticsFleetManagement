// Role utility functions for consistent role handling across the application

/**
 * Normalizes a role to proper case (capitalizes first letter, lowercases the rest)
 * @param {string} role - The role to normalize
 * @returns {string|null} - The normalized role or null if input is null/undefined
 */
export function normalizeRole(role) {
  if (!role) return null;
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

/**
 * Checks if a user role is authorized for a specific set of allowed roles
 * @param {string} userRole - The user's role from the token
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {boolean} - True if the user role is authorized
 */
export function isRoleAuthorized(userRole, allowedRoles) {
  if (!userRole || !allowedRoles || allowedRoles.length === 0) {
    return false;
  }

  const normalizedUserRole = normalizeRole(userRole);
  const normalizedAllowedRoles = allowedRoles.map(role => normalizeRole(role));

  return normalizedAllowedRoles.includes(normalizedUserRole);
}

/**
 * Validates if a role is one of the allowed roles in the system
 * @param {string} role - The role to validate
 * @returns {boolean} - True if the role is valid
 */
export function isValidRole(role) {
  if (!role) return false;
  const normalizedRole = normalizeRole(role);
  const validRoles = ['Admin', 'Driver', 'Customer'];
  return validRoles.includes(normalizedRole);
}
