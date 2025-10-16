const { Delivery, Tracking, User, Vehicle } = require('../models');
const { getIO } = require('../utils/socketManager');
const { hasConflict } = require('../utils/conflictCheck');

// Create a new delivery (Admin only)
exports.createDelivery = async (req, res) => {
  const { pickupAddress, dropAddress, driverId, vehicleId, scheduledStart, scheduledEnd, customerId } = req.body;

  // Validate required fields
  if (!pickupAddress || !dropAddress || !driverId || !vehicleId || !customerId) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check for scheduling conflicts
    const conflict = await hasConflict({ driverId, vehicleId, scheduledStart, scheduledEnd });
    if (conflict) {
      return res.status(400).json({ message: 'Scheduling conflict for driver or vehicle' });
    }

    // Validate foreign keys exist
    const [driver, customer, vehicle] = await Promise.all([
      User.findByPk(driverId),
      User.findByPk(customerId),
      Vehicle.findByPk(vehicleId),
    ]);
    if (!driver || driver.role !== 'Driver') {
      return res.status(400).json({ message: 'Driver not found' });
    }
    if (!customer || customer.role !== 'Customer') {
      return res.status(400).json({ message: 'Customer not found' });
    }
    if (!vehicle) {
      return res.status(400).json({ message: 'Vehicle not found' });
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

    // Notify the assigned driver to refresh their deliveries
    try {
      const io = getIO();
      io.to(`user-${driverId}`).emit('deliveries-updated');
      io.to(`user-${customerId}`).emit('deliveries-updated');
    } catch (_) {}

    return res.status(201).json({ message: 'Delivery assigned successfully', delivery });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Assign an existing delivery to a driver and vehicle (Admin only)
exports.assignDelivery = async (req, res) => {
  const { id } = req.params;
  const { driverId, vehicleId } = req.body;
  if (!driverId || !vehicleId) {
    return res.status(400).json({ message: 'driverId and vehicleId are required' });
  }
  try {
    const delivery = await Delivery.findByPk(id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });

    // Validate FKs
    const [driver, vehicle] = await Promise.all([
      User.findByPk(driverId),
      Vehicle.findByPk(vehicleId),
    ]);
    if (!driver || driver.role !== 'Driver') {
      return res.status(400).json({ message: 'Driver not found' });
    }
    if (!vehicle) {
      return res.status(400).json({ message: 'Vehicle not found' });
    }

    delivery.driverId = driverId;
    delivery.vehicleId = vehicleId;
    await delivery.save();

    // notify assigned driver and customer to refresh
    try {
      const io = getIO();
      if (delivery.driverId) io.to(`user-${delivery.driverId}`).emit('deliveries-updated');
      if (delivery.customerId) io.to(`user-${delivery.customerId}`).emit('deliveries-updated');
      io.to('admins').emit('deliveries-updated');
    } catch (_) {}

    return res.json({ message: 'Delivery assigned', delivery });
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

    // Ensure only Admin or the assigned Driver can update
    const role = String(req.user.role || '').toLowerCase();
    const isAdmin = role === 'admin';
    const isAssignedDriver = req.user.id === delivery.driverId;
    if (!isAdmin && !isAssignedDriver) {
      return res.status(403).json({ message: 'Forbidden: Not allowed to update this delivery' });
    }

    delivery.status = status;
    await delivery.save();

    // notify any listeners watching this delivery room (customer/admin/driver UIs)
    try {
      const io = getIO();
      io.to(`delivery-${delivery.id}`).emit('status-updated', { id: delivery.id, status: delivery.status });
    } catch (_) {}

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
    const deliveries = await Delivery.findAll();
    return res.json(deliveries);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Customer creates a delivery request (no driver/vehicle yet)
exports.createRequest = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { pickupAddress, dropAddress, productUrl } = req.body;
    if (!pickupAddress || !dropAddress) {
      return res.status(400).json({ message: 'pickupAddress and dropAddress are required' });
    }
    let productTitle, productImage, productPrice;
    if (productUrl) {
      try {
        const resp = await fetch(productUrl, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'en' } });
        const html = await resp.text();
        const og = (prop) => {
          const re = new RegExp(`<meta[^>]+property=["']og:${prop}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
          const m = html.match(re);
          return m ? m[1] : undefined;
        };
        const meta = (name) => {
          const re = new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
          const m = html.match(re);
          return m ? m[1] : undefined;
        };
        productTitle = og('title') || meta('title');
        productImage = og('image');
        productPrice = og('price:amount') || meta('price') || meta('product:price:amount');
      } catch (_) {
        // ignore metadata failures
      }
    }

    const delivery = await Delivery.create({
      pickupAddress,
      dropAddress,
      customerId,
      status: 'pending',
      productUrl: productUrl || null,
      productTitle: productTitle || null,
      productImage: productImage || null,
      productPrice: productPrice || null,
    });

    // notify: customer list and admins dashboard
    try {
      const io = getIO();
      io.to(`user-${customerId}`).emit('deliveries-updated');
      io.to('admins').emit('deliveries-updated');
    } catch (_) {}

    return res.status(201).json({ message: 'Request created', delivery });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get deliveries assigned to the logged-in Driver
exports.getMyDeliveries = async (req, res) => {
  try {
    const role = String(req.user.role || '').toLowerCase();
    if (!['driver','admin','customer'].includes(role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const where = role === 'driver' ? { driverId: req.user.id } : role === 'customer' ? { customerId: req.user.id } : {};
    const deliveries = await Delivery.findAll({ where });
    return res.json(deliveries);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a delivery (Admin only)
exports.deleteDelivery = async (req, res) => {
  const { id } = req.params;
  try {
    // Remove tracking entries first to avoid FK issues
    await Tracking.destroy({ where: { deliveryId: id } });
    const deleted = await Delivery.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ message: 'Delivery not found' });
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
