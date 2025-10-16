const { User } = require('../models');

// GET /api/users?role=Driver|Customer|Admin
exports.list = async (req, res) => {
  try {
    const role = req.query.role;
    const where = role ? { role } : {};
    const users = await User.findAll({ where, attributes: ['id','name','email','role'] });
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
