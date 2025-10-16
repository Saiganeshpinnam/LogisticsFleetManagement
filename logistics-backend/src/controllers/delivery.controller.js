const { Delivery, Tracking } = require('../models');
const { hasConflict } = require('../utils/conflictCheck');

// Create a new delivery (Admin only)
exports.createDelivery = async (req, res) => {
  const { pickupAddress, dropAddress, driverId, vehicleId, scheduledStart, scheduledEnd, customerId } = req.body;

  // Validate required fields
  if (!pickupAddress || !dropAddress || !driverId || !vehicleId || !customerId) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Only admin can assign deliveries' });
    }

    // Check for scheduling conflicts
    const conflict = await hasConflict({ driverId, vehicleId, scheduledStart, scheduledEnd });
    if (conflict) {
      return res.status(400).json({ message: 'Scheduling conflict for driver or vehicle' });
    }

    const delivery = await Delivery.create({
      pickupAddress,
      dropAddress,
      driverId,
      vehicleId,
      scheduledStart,
      scheduledEnd,
      customerId,
      status: 'pending',
    });

    return res.status(201).json({ message: 'Delivery assigned successfully', delivery });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update delivery status (Admin or Assigned Driver)
exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'on_route', 'delivered'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const delivery = await Delivery.findByPk(id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });

    if (req.user.role !== 'admin' && req.user.id !== delivery.driverId) {
      return res.status(403).json({ message: 'Forbidden: Not allowed to update this delivery' });
    }

    delivery.status = status;
    await delivery.save();

    return res.json({ message: 'Status updated', delivery });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get latest tracking info for a delivery
exports.getTrack = async (req, res) => {
  const { id } = req.params;

  try {
    const lastTrack = await Tracking.findOne({
      where: { deliveryId: id },
      order: [['createdAt', 'DESC']],
    });

    if (!lastTrack) return res.status(404).json({ message: 'No tracking data' });

    return res.json({
      lat: lastTrack.lat,
      lng: lastTrack.lng,
      updatedAt: lastTrack.createdAt,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all deliveries (Admin only)
exports.getDeliveries = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Only admin can view deliveries' });
    }

    const deliveries = await Delivery.findAll();
    return res.json(deliveries);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
