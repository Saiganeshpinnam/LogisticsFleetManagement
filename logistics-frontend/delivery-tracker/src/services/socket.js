// src/services/socket.js
import { io } from "socket.io-client";
import { getSocketUrl } from "./api";

const socket = io(getSocketUrl(), {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("✅ Connected to WebSocket:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err.message);
});

export default socket;
