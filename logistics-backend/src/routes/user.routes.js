const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/roleCheck');
const userCtrl = require('../controllers/user.controller');

// List users, optionally filtered by role (Admin only)
router.get('/', auth, role('Admin'), userCtrl.list);

module.exports = router;
