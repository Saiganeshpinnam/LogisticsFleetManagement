const { Vehicle } = require('../models');

// Create a new vehicle (Admin only)
exports.createVehicle = async (req, res) => {
  const { plateNumber, model } = req.body;

  if (!plateNumber) {
    return res.status(400).json({ message: 'plateNumber is required' });
  }

  try {
    // Only admin can create vehicles
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Only admin can create vehicles' });
    }

    const vehicle = await Vehicle.create({ plateNumber, model });
    return res.status(201).json({ message: 'Vehicle created successfully', vehicle });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all vehicles (Admin only)
exports.getVehicles = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Only admin can view vehicles' });
    }

    const vehicles = await Vehicle.findAll();
    return res.json(vehicles);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
