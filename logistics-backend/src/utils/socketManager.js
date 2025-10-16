let io;

function initSocket(server) {
  io = require("socket.io")(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Subscribe client to their user room for targeted notifications
    socket.on("subscribe-user", (userId) => {
      const room = `user-${userId}`;
      socket.join(room);
      socket.emit("subscribed", { room });
    });

    socket.on("unsubscribe-user", (userId) => {
      const room = `user-${userId}`;
      socket.leave(room);
      socket.emit("unsubscribed", { room });
    });

    // Subscribe a client to a specific delivery room
    socket.on("subscribe-delivery", (deliveryId) => {
      const room = `delivery-${deliveryId}`;
      socket.join(room);
      socket.emit("subscribed", { room });
    });

    // Unsubscribe from a delivery room
    socket.on("unsubscribe-delivery", (deliveryId) => {
      const room = `delivery-${deliveryId}`;
      socket.leave(room);
      socket.emit("unsubscribed", { room });
    });

    // Driver sends location updates
    socket.on("driver-location", ({ deliveryId, lat, lng }) => {
      const room = `delivery-${deliveryId}`;
      // Broadcast only to clients in this delivery room
      io.to(room).emit(`delivery-${deliveryId}`, { lat, lng });
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

module.exports = { initSocket, getIO };
