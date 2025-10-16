// src/services/socket.js
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:4000", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("✅ Connected to WebSocket:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err.message);
});

export default socket;
