// socketAdapters.js - Enhanced debugging version
import { io } from "socket.io-client";

const URL = import.meta.env.VITE_SOCKET_URL || "http://127.0.0.1:5000";
console.log("🔍 Socket URL:", URL);

let socket = null;
let listeners = {
  message: null,
  historical: null,
  error: null,
  connect: null,
  disconnect: null,
};

export const ChatSocket = {
  connect: () => {
    const token = localStorage.getItem("token");
    console.log("🔑 Token exists:", !!token);
    console.log("🔌 Socket exists and connected:", socket?.connected);
    
    if (!token) {
      console.error("❌ No token found in localStorage");
      return;
    }
    
    if (socket && socket.connected) {
      console.log("✅ Already connected, skipping");
      return;
    }

    console.log("🚀 Attempting to connect to:", `${URL}/chat`);
    
    socket = io(`${URL}/chat`, {
      auth: { token },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      timeout: 10000, // 10 second timeout
    });

    // Add connection attempt logging
    socket.on("connect", () => {
      console.log("✅ Socket connected successfully:", socket.id);
      if (listeners.connect) listeners.connect();
    });

    socket.on("disconnect", (reason) => {
      console.log("⚠️ Socket disconnected:", reason);
      if (listeners.disconnect) listeners.disconnect();
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
      console.error("❌ Error details:", err);
      if (listeners.error) listeners.error(err);
    });

    // Add timeout handling
    setTimeout(() => {
      if (socket && !socket.connected) {
        console.error("⏰ Socket connection timeout after 10 seconds");
        if (listeners.disconnect) listeners.disconnect();
      }
    }, 10000);

    socket.on("chat message", (msg) => {
      console.log("📨 Received chat message:", msg);
      if (listeners.message) listeners.message(msg);
    });

    socket.on("historical messages", (msgs) => {
      console.log("🕘 Received historical messages:", msgs);
      if (listeners.historical) listeners.historical(msgs);
    });

    socket.on("error", (err) => {
      console.error("❗Socket server error:", err);
      if (listeners.error) listeners.error(err);
    });
  },

  disconnect: () => {
    if (socket) {
      console.log("🔌 Disconnecting socket");
      socket.disconnect();
      socket = null;
    }
  },

  joinRoom: (tripId) => {
    if (socket?.connected) {
      console.log("🏠 Joining room:", tripId);
      socket.emit("joinTripRoom", tripId);
    } else {
      console.error("❌ Cannot join room - socket not connected");
    }
  },

  sendMessage: (tripId, text, senderId) => {
    if (!socket?.connected) {
      console.warn("❌ Socket not connected, message was not sent.");
      return;
    }
    console.log("✅ Emitting 'chat message' with data:", {
      tripId,
      text,
      senderId,
    });
    socket.emit("chat message", {
      tripId,
      text,
      senderId,
    });
  },

  onMessage: (callback) => {
    listeners.message = callback;
    if (socket) socket.on("chat message", callback);
  },

  offMessage: () => {
    if (socket && listeners.message) {
      socket.off("chat message", listeners.message);
    }
    listeners.message = null;
  },

  onHistoricalMessages: (callback) => {
    listeners.historical = callback;
    if (socket) socket.on("historical messages", callback);
  },

  offHistoricalMessages: () => {
    if (socket && listeners.historical) {
      socket.off("historical messages", listeners.historical);
    }
    listeners.historical = null;
  },

  onError: (callback) => {
    listeners.error = callback;
    if (socket) socket.on("error", callback);
  },

  offError: () => {
    if (socket && listeners.error) {
      socket.off("error", listeners.error);
    }
    listeners.error = null;
  },

  setConnectionCallbacks: (onConnect, onDisconnect) => {
    listeners.connect = onConnect;
    listeners.disconnect = onDisconnect;
  },
};