const { Delivery, Tracking } = require('../models');
const { hasConflict } = require('../utils/conflictCheck');

exports.createDelivery = async (req, res) => {
  const { pickupAddress, dropAddress, driverId, vehicleId, scheduledStart, scheduledEnd, customerId } = req.body;
  if (!pickupAddress || !dropAddress) return res.status(400).json({ message: 'addresses required' });
  try {
    const conflict = await hasConflict({ driverId, vehicleId, scheduledStart, scheduledEnd });
    if (conflict) return res.status(400).json({ message: 'Scheduling conflict for driver or vehicle' });
    const d = await Delivery.create({ pickupAddress, dropAddress, driverId, vehicleId, scheduledStart, scheduledEnd, customerId });
    return res.status(201).json(d);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateStatus = async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  if (!['pending','on_route','delivered'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
  try {
    const d = await Delivery.findByPk(id);
    if (!d) return res.status(404).json({ message: 'Not found' });
    d.status = status;
    await d.save();
    return res.json(d);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getTrack = async (req, res) => {
  const id = req.params.id;
  try {
    const last = await Tracking.findOne({ where: { deliveryId: id }, order: [['createdAt','DESC']] });
    if (!last) return res.status(404).json({ message: 'No tracking data' });
    return res.json({ lat: last.lat, lng: last.lng, updatedAt: last.createdAt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
