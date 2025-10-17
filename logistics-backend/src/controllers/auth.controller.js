const { User } = require('../models');
const jwt = require('../config/jwt'); // Use your helper
const bcrypt = require('bcrypt');

// Allowed roles
const ROLES = ['Admin', 'Driver', 'Customer'];

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (!ROLES.includes(role)) {
    return res.status(400).json({ message: `Role must be one of: ${ROLES.join(', ')}` });
  }

  try {
    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password, // hashing handled by model hooks
      role
    });

    // Return user info (without password)
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    console.log('Login attempt for email:', email);
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user.email, 'Role:', user.role);

    // Validate password using model's instance method
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, role: user.role });

    console.log('Login successful for user:', email);
    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error details:', err);
    return res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};
