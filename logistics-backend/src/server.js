require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initSocket } = require('./utils/socketManager');

const PORT = 4000; // Use port 4001 explicitly

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} ✅`);
});

module.exports = server;
