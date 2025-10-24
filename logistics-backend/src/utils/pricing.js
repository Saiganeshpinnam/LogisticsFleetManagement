/**
 * Pricing utility for delivery services
 * THIS IS THE SINGLE SOURCE OF TRUTH FOR ALL PRICING CALCULATIONS
 *
 * All frontend dashboards (Customer, Admin, Driver) must use identical
 * pricing configuration and calculation logic to ensure consistency.
 *
 * Distance and price values stored in database are calculated using these functions.
 * All dashboard displays should use the stored database values, not recalculate.
 *
 * IMPORTANT: Any changes to pricing must be synchronized with:
 * - Frontend: logistics-frontend/delivery-tracker/src/utils/pricing.js
 */

// Base pricing configuration per km
const PRICING_CONFIG = {
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
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
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

/**
 * Calculate unit price per km based on vehicle type and logistic category
 * @param {string} vehicleType - Vehicle type (two_wheeler, four_wheeler, six_wheeler)
 * @param {string} logisticCategory - Logistic category (home_shifting, goods_shifting, materials_shifting, other)
 * @returns {number} Price per km
 */
function calculateUnitPrice(vehicleType, logisticCategory) {
  if (!PRICING_CONFIG[vehicleType] || !PRICING_CONFIG[vehicleType][logisticCategory]) {
    throw new Error(`Invalid vehicle type or logistic category: ${vehicleType}, ${logisticCategory}`);
  }

  return PRICING_CONFIG[vehicleType][logisticCategory];
}

/**
 * Calculate total price based on unit price per km and distance
 * @param {number} unitPrice - Price per km
 * @param {number} distanceKm - Distance in kilometers
 * @returns {number} Total price
 */
function calculateTotalPrice(unitPrice, distanceKm) {
  return unitPrice * distanceKm;
}

/**
 * Calculate delivery pricing for a delivery request
 * @param {string} vehicleType - Vehicle type
 * @param {string} logisticCategory - Logistic category
 * @param {number} distanceKm - Distance in kilometers
 * @returns {object} Object containing unitPrice and totalPrice
 */
function calculateDeliveryPricing(vehicleType, logisticCategory, distanceKm = 1) {
  const unitPrice = calculateUnitPrice(vehicleType, logisticCategory);
  const totalPrice = calculateTotalPrice(unitPrice, distanceKm);

  return {
    unitPrice: unitPrice,
    totalPrice: totalPrice,
    distanceKm: distanceKm
  };
}

module.exports = {
  calculateDistance,
  calculateUnitPrice,
  calculateTotalPrice,
  calculateDeliveryPricing,
  PRICING_CONFIG
};
