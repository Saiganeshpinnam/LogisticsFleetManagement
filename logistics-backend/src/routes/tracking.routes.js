const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/roleCheck');
const trackingCtrl = require('../controllers/tracking.controller');

// Drivers can post locations, both drivers and admins can post; customers should not post.
router.post('/', auth, role(['Driver','Admin']), trackingCtrl.postLocation);
router.get('/:deliveryId/history', auth, trackingCtrl.getHistory);

module.exports = router;
