// Summary reports for admin dashboard
exports.summary = async (req, res) => {
  try {
    const [pendingCount, assignedCount, onRouteCount, deliveredCount] = await Promise.all([
      Delivery.count({ where: { status: 'pending' } }),
      Delivery.count({ where: { status: 'assigned' } }),
      Delivery.count({ where: { status: 'on_route' } }),
      Delivery.count({ where: { status: 'delivered' } }),
    ]);

    return res.json({
      pending: pendingCount,
      assigned: assignedCount,
      on_route: onRouteCount,
      delivered: deliveredCount,
      total: pendingCount + assignedCount + onRouteCount + deliveredCount
    });
  } catch (err) {
    console.error('report.summary err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
exports.avgDeliveryTimePerDriver = async (req, res) => {
  try {
    // Using raw query for clarity; computes avg(seconds) between createdAt and updatedAt when status='delivered'
    const rows = await sequelize.query(
      `SELECT d."driverId", u.name AS "driverName",
              AVG(EXTRACT(EPOCH FROM (d."updatedAt" - d."createdAt"))) AS avg_seconds,
              COUNT(*) AS deliveries
       FROM deliveries d
       JOIN users u ON u.id = d."driverId"
       WHERE d.status = 'delivered'
       GROUP BY d."driverId", u.name
       ORDER BY avg_seconds ASC;`,
      { type: QueryTypes.SELECT }
    );
    return res.json(rows);
  } catch (err) {
    console.error('report.avgDeliveryTimePerDriver err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Vehicle utilization: percent of time a vehicle had deliveries (simple metric: count of deliveries per vehicle / total deliveries)
exports.vehicleUtilization = async (req, res) => {
  try {
    const rows = await sequelize.query(
      `SELECT v.id AS "vehicleId", v."plateNumber", COUNT(d.id) AS deliveries
       FROM vehicles v
       LEFT JOIN deliveries d ON d."vehicleId" = v.id
       GROUP BY v.id
       ORDER BY deliveries DESC;`,
      { type: QueryTypes.SELECT }
    );
    return res.json(rows);
  } catch (err) {
    console.error('report.vehicleUtilization err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
