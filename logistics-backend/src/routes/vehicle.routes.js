const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/roleCheck');
const vehicleCtrl = require('../controllers/vehicle.controller');

router.post('/', auth, role('admin'), vehicleCtrl.createVehicle);

module.exports = router;
