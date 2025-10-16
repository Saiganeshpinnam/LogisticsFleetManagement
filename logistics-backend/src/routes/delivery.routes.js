const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/roleCheck');
const deliveryCtrl = require('../controllers/delivery.controller');

// Create a delivery (Admin only)
router.post('/', auth, role('admin'), deliveryCtrl.createDelivery);

// Update delivery status (Admin + Driver)
router.put('/:id/status', auth, role(['admin', 'driver']), deliveryCtrl.updateStatus);

// Get tracking info for a delivery (Any logged-in user)
router.get('/:id/track', auth, deliveryCtrl.getTrack);

// Get all deliveries (Admin only)
router.get('/', auth, role('admin'), deliveryCtrl.getDeliveries);

module.exports = router;
