const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/roleCheck');
const deliveryCtrl = require('../controllers/delivery.controller');

// Create a delivery (Admin only)
router.post('/', auth, role('Admin'), deliveryCtrl.createDelivery);

// Get deliveries assigned to the logged-in user (Driver/Admin/Customer) - place before param routes
router.get('/me', auth, role(['Driver','Admin','Customer']), deliveryCtrl.getMyDeliveries);

// Update delivery status (Admin + Driver)
router.put('/:id/status', auth, role(['Admin', 'Driver']), deliveryCtrl.updateStatus);

// Get tracking info for a delivery (Any logged-in user)
router.get('/:id/track', auth, deliveryCtrl.getTrack);

// Get all deliveries (Admin only)
router.get('/', auth, role('Admin'), deliveryCtrl.getDeliveries);

// Delete a delivery (Admin only)
router.delete('/:id', auth, role('Admin'), deliveryCtrl.deleteDelivery);

module.exports = router;
