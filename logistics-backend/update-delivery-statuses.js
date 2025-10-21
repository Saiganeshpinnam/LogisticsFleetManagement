const { sequelize, Delivery } = require('./src/models');

async function updateDeliveryStatuses() {
  try {
    console.log('Starting delivery status update...');

    // Update deliveries that have both driverId and vehicleId but are still marked as 'pending'
    const [updatedCount] = await Delivery.update(
      { status: 'assigned' },
      {
        where: {
          status: 'pending',
          driverId: { [sequelize.Sequelize.Op.ne]: null },
          vehicleId: { [sequelize.Sequelize.Op.ne]: null }
        }
      }
    );

    console.log(`Updated ${updatedCount} deliveries from 'pending' to 'assigned'`);

    // Count deliveries by status
    const counts = await Delivery.findAll({
      attributes: [
        'status',
        [sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.col('status')), 'count']
      ],
      group: ['status']
    });

    console.log('Current delivery status counts:');
    counts.forEach(count => {
      console.log(`${count.status}: ${count.get('count')}`);
    });

    console.log('Delivery status update completed successfully!');
  } catch (error) {
    console.error('Error updating delivery statuses:', error);
  } finally {
    await sequelize.close();
  }
}

updateDeliveryStatuses();
