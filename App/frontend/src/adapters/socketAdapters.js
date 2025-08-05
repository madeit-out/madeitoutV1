// socketAdapters.js
import { io } from "socket.io-client";

const URL = import.meta.env.VITE_SOCKET_URL || "http://127.0.0.1:5000";

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
    if (!token || (socket && socket.connected)) return;

    socket = io(`${URL}/chat`, {
      auth: { token },
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      if (listeners.connect) listeners.connect();
    });

    socket.on("disconnect", (reason) => {
      console.log("⚠️ Socket disconnected:", reason);
      if (listeners.disconnect) listeners.disconnect();
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket error:", err.message);
      if (listeners.error) listeners.error(err);
    });

    // ✅ Always attach message handlers, even if listener isn't set yet
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
      socket.disconnect();
      socket = null;
    }
  },

  joinRoom: (tripId) => {
    if (socket?.connected) {
      socket.emit("joinTripRoom", tripId);
    }
  },

  sendMessage: (tripId, text, senderId) => {
    if (!socket?.connected) {
      console.warn("Socket not connected, message was not sent.");
      return;
    }
    // FIX: Uncomment this log to see the data being sent.
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
    // ChatSocket.onHistoricalMessages((msgs) => {
    //   console.log("🕘 Received historical messages:", msgs); // ✅ confirms joined
    // });
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
