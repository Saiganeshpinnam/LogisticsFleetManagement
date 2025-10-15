const { Server } = require('socket.io');
const { Delivery, Tracking } = require('../models');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // driver joins room for a delivery to emit location updates
    socket.on('driver:join', ({ deliveryId }) => {
      if (!deliveryId) return;
      socket.join(`delivery_${deliveryId}`);
      console.log('Driver joined', `delivery_${deliveryId}`);
    });

    // customer can join to receive updates
    socket.on('customer:join', ({ deliveryId }) => {
      if (!deliveryId) return;
      socket.join(`delivery_${deliveryId}`);
      console.log('Customer joined', `delivery_${deliveryId}`);
    });

    // driver emits location updates
    socket.on('driver:location', async ({ deliveryId, lat, lng }) => {
      if (!deliveryId || !lat || !lng) return;
      // persist last location
      try {
        await Tracking.create({ deliveryId, lat, lng });
      } catch (err) {
        console.error('tracking save err', err);
      }
      // broadcast to room
      io.to(`delivery_${deliveryId}`).emit('delivery:location', { deliveryId, lat, lng, updatedAt: new Date() });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected', socket.id);
    });
  });
}

module.exports = { initSocket };
