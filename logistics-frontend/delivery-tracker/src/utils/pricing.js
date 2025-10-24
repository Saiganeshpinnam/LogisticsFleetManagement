/**
 * Shared utilities for frontend calculations
 * MUST MATCH BACKEND utils/pricing.js EXACTLY
 *
 * This ensures consistency between:
 * - Customer Dashboard (form calculations)
 * - Admin Dashboard (display)
 * - Driver Dashboard (display)
 * - Backend calculations (stored in database)
 *
 * IMPORTANT: Any changes to pricing must be made in both files simultaneously
 */

// Base pricing configuration per km - MUST MATCH backend exactly
export const PRICING_CONFIG = {
  two_wheeler: {
    home_shifting: 15,    // ₹15 per km
    goods_shifting: 12,   // ₹12 per km
    materials_shifting: 10, // ₹10 per km
    other: 13            // ₹13 per km
  },
  four_wheeler: {
    home_shifting: 45,    // ₹45 per km
    goods_shifting: 35,   // ₹35 per km
    materials_shifting: 30, // ₹30 per km
    other: 38            // ₹38 per km
  },
  six_wheeler: {
    home_shifting: 90,    // ₹90 per km
    goods_shifting: 75,   // ₹75 per km
    materials_shifting: 65, // ₹65 per km
    other: 80            // ₹80 per km
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * MUST MATCH backend utils/pricing.js calculateDistance function exactly
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  if (!lat1 || !lng1 || !lat2 || !lng2) return 1.0;

  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}
