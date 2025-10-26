require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initSocket } = require('./utils/socketManager');

const PORT = process.env.PORT || 5000; // Use port 5000 to avoid conflicts

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ✅`);
});

module.exports = server;
