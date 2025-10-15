const { Tracking } = require('../models');

// Accepts POST body: { deliveryId, lat, lng }
exports.postLocation = async (req, res) => {
  const { deliveryId, lat, lng } = req.body;
  if (!deliveryId || !lat || !lng) return res.status(400).json({ message: 'deliveryId, lat, lng required' });
  try {
    const t = await Tracking.create({ deliveryId, lat, lng });
    return res.status(201).json(t);
  } catch (err) {
    console.error('tracking.postLocation err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /tracking/:deliveryId/history
exports.getHistory = async (req, res) => {
  const deliveryId = req.params.deliveryId;
  try {
    const rows = await Tracking.findAll({ where: { deliveryId }, order: [['createdAt','ASC']] });
    return res.json(rows);
  } catch (err) {
    console.error('tracking.getHistory err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
