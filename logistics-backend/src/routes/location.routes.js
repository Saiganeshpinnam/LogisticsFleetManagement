const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const locationCtrl = require('../controllers/location.controller');

// Search locations by query (no authentication required - users need to search before logging in)
router.get('/search', locationCtrl.searchLocations);

// Get popular locations (no authentication required - users need to search before logging in)
router.get('/popular', locationCtrl.getPopularLocations);

// Geocode an address (no authentication required - needed for distance calculation in delivery requests)
router.get('/geocode', locationCtrl.geocodeAddress);

module.exports = router;
