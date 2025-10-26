const { Delivery, Tracking, User, Vehicle } = require('../models');
const { getIO } = require('../utils/socketManager');
const { hasConflict } = require('../utils/conflictCheck');
const { geocodeAddress, geocodeAddressFallback } = require('../utils/geocoding');
const { calculateDistance, calculateDeliveryPricing } = require('../utils/pricing');

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
      status: 'unassigned',
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

// Customer cancels their own pending delivery request
exports.cancelMyRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const delivery = await Delivery.findByPk(id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    if (delivery.customerId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: Cannot cancel this delivery' });
    }
    if (delivery.status !== 'pending' && delivery.status !== 'unassigned') {
      return res.status(400).json({ message: 'Only pending or unassigned requests can be cancelled' });
    }

    // Remove tracking entries (if any) and then delete the delivery
    await Tracking.destroy({ where: { deliveryId: id } });
    await Delivery.destroy({ where: { id } });

    try {
      const io = getIO();
      io.to(`user-${req.user.id}`).emit('deliveries-updated');
      io.to('admins').emit('deliveries-updated');
      if (delivery.driverId) io.to(`user-${delivery.driverId}`).emit('deliveries-updated');
    } catch (_) {}

    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Assign an existing delivery to a driver and vehicle (Admin only)
exports.assignDelivery = async (req, res) => {
  const { id } = req.params;
  const { driverId, vehicleId, customerId } = req.body;
  if (!driverId || !vehicleId) {
    return res.status(400).json({ message: 'driverId and vehicleId are required' });
  }
  try {
    const delivery = await Delivery.findByPk(id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });

    // Check if delivery is already assigned
    if (delivery.driverId && delivery.vehicleId) {
      return res.status(400).json({ message: 'Delivery is already assigned to a driver and vehicle' });
    }

    // Check for scheduling conflicts for the driver
    const conflict = await hasConflict({ driverId, vehicleId, scheduledStart: delivery.scheduledStart, scheduledEnd: delivery.scheduledEnd });
    if (conflict) {
      return res.status(400).json({ message: 'Scheduling conflict for driver or vehicle' });
    }

    // Validate FKs
    const lookups = [
      User.findByPk(driverId),
      Vehicle.findByPk(vehicleId),
      customerId ? User.findByPk(customerId) : Promise.resolve(null)
    ];
    const [driver, vehicle, customer] = await Promise.all(lookups);
    if (!driver || driver.role !== 'Driver') {
      return res.status(400).json({ message: 'Driver not found' });
    }
    if (!vehicle) {
      return res.status(400).json({ message: 'Vehicle not found' });
    }
    if (customerId && (!customer || customer.role !== 'Customer')) {
      return res.status(400).json({ message: 'Customer not found' });
    }

    delivery.driverId = driverId;
    delivery.vehicleId = vehicleId;
    delivery.status = 'pending'; // Set status to pending when delivery is assigned
    if (customerId) delivery.customerId = customerId;
    await delivery.save();

    // notify assigned driver and customer to refresh
    try {
      const io = getIO();
      if (delivery.driverId) io.to(`user-${delivery.driverId}`).emit('deliveries-updated');
      if (delivery.customerId) io.to(`user-${delivery.customerId}`).emit('deliveries-updated');
      io.to('admins').emit('deliveries-updated');
      io.to('admins').emit('drivers-updated'); // Also refresh drivers list since assignments affect availability
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

  if (!['unassigned', 'pending', 'assigned', 'on_route', 'delivered'].includes(status)) {
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
    const deliveries = await Delivery.findAll({
      attributes: [
        'id', 'pickupAddress', 'dropAddress', 'status', 'scheduledStart', 'scheduledEnd',
        'productUrl', 'productTitle', 'productImage', 'productPrice',
        'pickupLatitude', 'pickupLongitude', 'pickupFormattedAddress', 'pickupPlaceId',
        'dropLatitude', 'dropLongitude', 'dropFormattedAddress', 'dropPlaceId',
        'logisticType', 'vehicleType', 'logisticCategory', 'distanceKm', 'unitPrice', 'totalPrice',
        'driverId', 'vehicleId'
      ],
      include: [
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'plateNumber', 'model', 'vehicleCode']
        }
      ]
    });
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
    const { 
      pickupAddress, 
      dropAddress, 
      productUrl, 
      logisticType = 'standard', 
      vehicleType = 'two_wheeler', 
      logisticCategory = 'goods_shifting',
      // Accept frontend-calculated values for consistency
      distanceKm: frontendDistanceKm,
      pickupLatitude: frontendPickupLat,
      pickupLongitude: frontendPickupLng,
      pickupFormattedAddress: frontendPickupFormatted,
      dropLatitude: frontendDropLat,
      dropLongitude: frontendDropLng,
      dropFormattedAddress: frontendDropFormatted
    } = req.body;

    if (!pickupAddress || !dropAddress) {
      return res.status(400).json({ message: 'pickupAddress and dropAddress are required' });
    }

    // Use frontend-provided coordinates if available, otherwise geocode
    let pickupGeocode, dropGeocode, distanceKm;
    
    if (frontendPickupLat && frontendPickupLng && frontendDropLat && frontendDropLng && frontendDistanceKm) {
      // Use frontend-calculated values for perfect consistency
      console.log('Using frontend-calculated coordinates and distance');
      pickupGeocode = {
        latitude: frontendPickupLat,
        longitude: frontendPickupLng,
        formattedAddress: frontendPickupFormatted || pickupAddress,
        placeId: null
      };
      dropGeocode = {
        latitude: frontendDropLat,
        longitude: frontendDropLng,
        formattedAddress: frontendDropFormatted || dropAddress,
        placeId: null
      };
      distanceKm = frontendDistanceKm;
    } else {
      // Fallback to backend geocoding
      console.log('Geocoding addresses on backend...');

      // Try primary geocoding first
      let pickupGeocode = await geocodeAddress(pickupAddress);
      let dropGeocode = await geocodeAddress(dropAddress);

      // If primary geocoding fails, try fallback
      if (!pickupGeocode) {
        console.log('Primary pickup geocoding failed, trying fallback');
        pickupGeocode = await geocodeAddressFallback(pickupAddress);
      }

      if (!dropGeocode) {
        console.log('Primary drop geocoding failed, trying fallback');
        dropGeocode = await geocodeAddressFallback(dropAddress);
      }

      console.log('Pickup geocode:', pickupGeocode);
      console.log('Drop geocode:', dropGeocode);

      // Calculate distance between pickup and drop coordinates
      distanceKm = 1.0; // Default minimum distance
      if (pickupGeocode?.latitude && pickupGeocode?.longitude && dropGeocode?.latitude && dropGeocode?.longitude) {
        distanceKm = calculateDistance(
          pickupGeocode.latitude,
          pickupGeocode.longitude,
          dropGeocode.latitude,
          dropGeocode.longitude
        );
        console.log('Calculated distance:', distanceKm, 'km');
      } else {
        console.warn('Failed to geocode one or both addresses, using default distance');
      }
    }

    // Calculate pricing based on vehicle type, logistic category, and distance
    const pricing = calculateDeliveryPricing(vehicleType, logisticCategory, distanceKm);

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
      status: 'unassigned',
      productUrl: productUrl || null,
      productTitle: productTitle || null,
      productImage: productImage || null,
      productPrice: productPrice || null,
      logisticType: logisticType || 'standard',
      vehicleType: vehicleType || 'two_wheeler',
      logisticCategory: logisticCategory || 'goods_shifting',
      distanceKm: distanceKm,
      unitPrice: pricing.unitPrice,
      totalPrice: pricing.totalPrice,

      // Add geocoded coordinates
      pickupLatitude: pickupGeocode?.latitude || null,
      pickupLongitude: pickupGeocode?.longitude || null,
      pickupFormattedAddress: pickupGeocode?.formattedAddress || null,
      pickupPlaceId: pickupGeocode?.placeId || null,

      dropLatitude: dropGeocode?.latitude || null,
      dropLongitude: dropGeocode?.longitude || null,
      dropFormattedAddress: dropGeocode?.formattedAddress || null,
      dropPlaceId: dropGeocode?.placeId || null,
    });

    // Get the created delivery with all fields including coordinates
    const createdDelivery = await Delivery.findByPk(delivery.id, {
      attributes: [
        'id', 'pickupAddress', 'dropAddress', 'status', 'scheduledStart', 'scheduledEnd',
        'productUrl', 'productTitle', 'productImage', 'productPrice',
        'pickupLatitude', 'pickupLongitude', 'pickupFormattedAddress', 'pickupPlaceId',
        'dropLatitude', 'dropLongitude', 'dropFormattedAddress', 'dropPlaceId',
        'logisticType', 'vehicleType', 'logisticCategory', 'distanceKm', 'unitPrice', 'totalPrice',
        'driverId', 'vehicleId'
      ],
      include: [
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'plateNumber', 'model', 'vehicleCode']
        }
      ]
    });

    // notify: customer list and admins dashboard
    try {
      const io = getIO();
      io.to(`user-${customerId}`).emit('deliveries-updated');
      io.to('admins').emit('deliveries-updated');
    } catch (_) {}

    return res.status(201).json({ message: 'Request created', delivery: createdDelivery });
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
    const deliveries = await Delivery.findAll({
      where,
      attributes: [
        'id', 'pickupAddress', 'dropAddress', 'status', 'scheduledStart', 'scheduledEnd',
        'productUrl', 'productTitle', 'productImage', 'productPrice',
        'pickupLatitude', 'pickupLongitude', 'pickupFormattedAddress', 'pickupPlaceId',
        'dropLatitude', 'dropLongitude', 'dropFormattedAddress', 'dropPlaceId',
        'logisticType', 'vehicleType', 'logisticCategory', 'distanceKm', 'unitPrice', 'totalPrice',
        'driverId', 'vehicleId'
      ],
      include: [
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'plateNumber', 'model', 'vehicleCode']
        }
      ]
    });
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
