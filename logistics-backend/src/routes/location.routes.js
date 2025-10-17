const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const locationCtrl = require('../controllers/location.controller');

// Search locations by query (authenticated users only)
router.get('/search', auth, locationCtrl.searchLocations);

// Get popular locations (authenticated users only)
router.get('/popular', auth, locationCtrl.getPopularLocations);

// Calculate route between two points (authenticated users only)
router.get('/route', auth, locationCtrl.calculateRoute);

module.exports = router;
