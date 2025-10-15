const { Vehicle } = require('../models');

exports.createVehicle = async (req, res) => {
  const { plateNumber, model } = req.body;
  if (!plateNumber) return res.status(400).json({ message: 'plateNumber required' });
  try {
    const v = await Vehicle.create({ plateNumber, model });
    return res.status(201).json(v);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
