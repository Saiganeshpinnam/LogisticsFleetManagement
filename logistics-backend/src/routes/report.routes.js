const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/roleCheck');
const reportCtrl = require('../controllers/report.controller');

// Only admin can access reports
router.get('/avg-delivery-time-per-driver', auth, role('admin'), reportCtrl.avgDeliveryTimePerDriver);
router.get('/vehicle-utilization', auth, role('admin'), reportCtrl.vehicleUtilization);

module.exports = router;
