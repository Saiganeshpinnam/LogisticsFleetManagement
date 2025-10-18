const { User, Delivery } = require('../models');

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

// GET /api/users/drivers/analytics - Get comprehensive driver analytics (Admin only)
exports.getDriverAnalytics = async (req, res) => {
  try {
    // Get all drivers
    const drivers = await User.findAll({
      where: { role: 'Driver' },
      attributes: ['id', 'name', 'email', 'role'],
      include: [{
        model: Delivery,
        as: 'driverDeliveries',
        attributes: ['id', 'status', 'createdAt'],
        required: false
      }]
    });

    // Calculate analytics for each driver
    const driverAnalytics = await Promise.all(drivers.map(async (driver) => {
      const deliveries = driver.driverDeliveries || [];

      // Count by status
      const totalDeliveries = deliveries.length;
      const deliveredDeliveries = deliveries.filter(d => d.status === 'delivered').length;
      const pendingDeliveries = deliveries.filter(d => d.status === 'pending').length;
      const onRouteDeliveries = deliveries.filter(d => d.status === 'on_route').length;

      // Calculate success rate
      const successRate = totalDeliveries > 0 ? (deliveredDeliveries / totalDeliveries) * 100 : 0;

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentDeliveries = deliveries.filter(d => new Date(d.createdAt) >= sevenDaysAgo).length;
      const recentDelivered = deliveries.filter(d =>
        d.status === 'delivered' && new Date(d.createdAt) >= sevenDaysAgo
      ).length;

      // Calculate average delivery time (if we had completion timestamps)
      // For now, we'll use a placeholder

      return {
        id: driver.id,
        name: driver.name,
        email: driver.email,
        role: driver.role,
        totalDeliveries,
        deliveredDeliveries,
        pendingDeliveries,
        onRouteDeliveries,
        successRate: Math.round(successRate * 100) / 100, // Round to 2 decimal places
        recentDeliveries,
        recentDelivered,
        // Additional metrics that could be added later
        averageDeliveryTime: null, // Placeholder for future enhancement
        customerSatisfaction: null, // Placeholder for future enhancement
        totalEarnings: null // Placeholder for future enhancement
      };
    }));

    // Calculate overall statistics
    const overallStats = {
      totalDrivers: drivers.length,
      totalDeliveries: driverAnalytics.reduce((sum, d) => sum + d.totalDeliveries, 0),
      totalDelivered: driverAnalytics.reduce((sum, d) => sum + d.deliveredDeliveries, 0),
      totalPending: driverAnalytics.reduce((sum, d) => sum + d.pendingDeliveries, 0),
      totalOnRoute: driverAnalytics.reduce((sum, d) => sum + d.onRouteDeliveries, 0),
      averageSuccessRate: driverAnalytics.length > 0
        ? Math.round((driverAnalytics.reduce((sum, d) => sum + d.successRate, 0) / driverAnalytics.length) * 100) / 100
        : 0,
      activeDrivers: driverAnalytics.filter(d => d.totalDeliveries > 0).length
    };

    return res.json({
      drivers: driverAnalytics,
      overall: overallStats,
      lastUpdated: new Date().toISOString()
    });

  } catch (err) {
    console.error('Driver analytics error:', err);
    return res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};
