const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/roleCheck');
const vehicleCtrl = require('../controllers/vehicle.controller');

// Create a vehicle (Admin only)
router.post('/', auth, role('admin'), vehicleCtrl.createVehicle);

// Get all vehicles (Admin only)
router.get('/', auth, role('admin'), vehicleCtrl.getVehicles);

module.exports = router;
