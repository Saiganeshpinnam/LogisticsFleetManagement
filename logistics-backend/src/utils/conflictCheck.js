// Very simple conflict check: ensures the driver or vehicle doesn't have another delivery whose scheduled window overlaps.
const { Delivery } = require('../models');
const { Op } = require('sequelize');

async function hasConflict({ driverId, vehicleId, scheduledStart, scheduledEnd }) {
  if (!scheduledStart || !scheduledEnd) return false;
  const conflicts = await Delivery.findOne({
    where: {
      [Op.or]: [
        { driverId },
        { vehicleId }
      ],
      status: { [Op.not]: 'delivered' },
      scheduledStart: { [Op.lt]: scheduledEnd },
      scheduledEnd: { [Op.gt]: scheduledStart }
    }
  });
  return !!conflicts;
}

module.exports = { hasConflict };
