let io;

function initSocket(server) {
  io = require("socket.io")(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Driver sends location updates
    socket.on("driver-location", ({ deliveryId, lat, lng }) => {
      // Broadcast to all clients subscribed to this delivery
      io.emit(`delivery-${deliveryId}`, { lat, lng });
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
