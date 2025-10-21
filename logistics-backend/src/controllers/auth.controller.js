const { User } = require('../models');
const jwt = require('../config/jwt'); // Use your helper
const bcrypt = require('bcrypt');
const { getIO } = require('../utils/socketManager');

// Check if User model is available
if (!User) {
  console.error('❌ User model not available - authentication will not work');
}

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

  // Check if User model is available
  if (!User) {
    console.error('❌ User model not available during registration');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    console.log('Registration attempt:', { name, email, role });
    
    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password, // hashing handled by model hooks
      role
    });

    console.log('User registered successfully:', { id: user.id, email: user.email, role: user.role });

    // Emit socket event to notify admins of new driver registration
    try {
      const io = getIO();
      if (role === 'Driver') {
        io.to('admins').emit('drivers-updated');
        console.log('✅ Emitted drivers-updated event for new driver');
      }
    } catch (socketError) {
      console.warn('Socket emission failed:', socketError.message);
      // Don't fail registration if socket fails
    }

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
    console.error('Register error details:', err);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    return res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Check if User model is available
  if (!User) {
    console.error('❌ User model not available during login');
    return res.status(500).json({ 
      message: 'Server configuration error',
      error: 'Database model not initialized'
    });
  }

  try {
    console.log('Login attempt for email:', email);
    
    // Test database connection first
    const { sequelize } = require('../models');
    await sequelize.authenticate();
    console.log('✅ Database connection verified for login');
    
    // Debug: Check total user count
    const totalUsers = await User.count();
    console.log('Total users in database:', totalUsers);
    
    if (totalUsers === 0) {
      console.error('❌ No users found in database - database might be empty');
      return res.status(500).json({ 
        message: 'Server error',
        error: 'Database appears to be empty'
      });
    }
    
    // Debug: List all users (in development only)
    if (process.env.NODE_ENV !== 'production') {
      const allUsers = await User.findAll({ attributes: ['id', 'email', 'role'] });
      console.log('All users in database:', allUsers.map(u => ({ id: u.id, email: u.email, role: u.role })));
    }
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found for email:', email);
      if (process.env.NODE_ENV !== 'production') {
        const availableEmails = await User.findAll({ attributes: ['email'] });
        console.log('Available emails:', availableEmails.map(u => u.email));
      }
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
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role });

    console.log('Login successful for user:', email);
    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      expiresIn: '30d' // Let frontend know token expiration
    });
  } catch (err) {
    console.error('❌ Login error details:', err);
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    
    // Specific error handling for common database issues
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (err.name === 'ConnectionError' || err.name === 'ConnectionRefusedError') {
      errorMessage = 'Database connection failed';
      console.error('❌ Database connection error - check DATABASE_URL');
    } else if (err.name === 'DatabaseError') {
      errorMessage = 'Database query failed';
      console.error('❌ Database query error - check database schema');
    } else if (err.name === 'SequelizeConnectionError') {
      errorMessage = 'Database connection error';
      console.error('❌ Sequelize connection error - check database configuration');
    }
    
    return res.status(statusCode).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : errorMessage,
      details: process.env.NODE_ENV === 'development' ? {
        name: err.name,
        stack: err.stack
      } : undefined
    });
  }
};

// Refresh token endpoint
exports.refreshToken = async (req, res) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authorization.split(' ')[1];
    const decoded = jwt.verify(token);
    
    // Find user to ensure they still exist
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new token
    const newToken = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role });

    return res.json({
      message: 'Token refreshed successfully',
      token: newToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      expiresIn: '30d'
    });
  } catch (err) {
    console.error('Token refresh error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
