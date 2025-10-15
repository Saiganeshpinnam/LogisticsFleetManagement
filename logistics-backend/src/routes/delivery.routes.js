const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/roleCheck');
const deliveryCtrl = require('../controllers/delivery.controller');

router.post('/', auth, role('admin'), deliveryCtrl.createDelivery);
router.put('/:id/status', auth, role(['admin','driver']), deliveryCtrl.updateStatus);
router.get('/:id/track', auth, deliveryCtrl.getTrack);

module.exports = router;
