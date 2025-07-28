import { io } from "socket.io-client";

// Explicitly set the SOCKET_URL to 127.0.0.1 to match backend binding
const SOCKET_URL = "http://127.0.0.1:5000";

// The socket instance is created here, but autoConnect is false.
const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: false, // We will connect manually
  query: {
    token: localStorage.getItem("token") || "", // Pass JWT token from localStorage
  },
  // Removed forceNew: true as it can cause issues with rapid reconnections in dev
});

// Internal callbacks for connection status
let onConnectCallback = null;
let onDisconnectCallback = null;

// Listeners for internal socket events
socket.on("connect", () => {
  console.log("SocketAdapters Debug: Socket.IO client connected!");
  if (onConnectCallback) {
    onConnectCallback(true); // Notify TripChat that connection is established
  }
});

socket.on("disconnect", (reason) => {
  console.log("SocketAdapters Debug: Socket.IO client disconnected:", reason);
  if (onDisconnectCallback) {
    onDisconnectCallback(false); // Notify TripChat that connection is lost
  }
});

socket.on("connect_error", (err) => {
  console.error(
    "SocketAdapters Debug: Socket.IO connection error:",
    err.message
  );
  if (onDisconnectCallback) {
    // Treat connection error as a disconnection for status
    onDisconnectCallback(false);
  }
});

// General error from backend (e.g., auth failed, invalid data)
socket.on("error", (err) => {
  console.error("SocketAdapters Debug: Backend error received:", err);
  // This is handled by TripChat's onError listener
});

export const ChatSocket = {
  // Method for TripChat to register its connection status callbacks
  setConnectionCallbacks: (connectCb, disconnectCb) => {
    onConnectCallback = connectCb;
    onDisconnectCallback = disconnectCb;
  },

  // Connect the socket. This will also send the 'query' parameters.
  connect: () => {
    if (!socket.connected) {
      // Update token before connecting in case it changed (e.g., after login)
      socket.io.opts.query = {
        token: localStorage.getItem("token") || "",
      };
      console.log("SocketAdapters Debug: Attempting to connect socket.");
      socket.connect();
    } else {
      console.log("SocketAdapters Debug: Socket already connected.");
    }
  },

  disconnect: () => {
    if (socket.connected) {
      console.log("SocketAdapters Debug: Disconnecting socket.");
      socket.disconnect();
    } else {
      console.log(
        "SocketAdapters Debug: Socket not connected, no need to disconnect."
      );
    }
  },

  // Emits 'joinTripRoom' event, matching backend
  joinRoom: (tripId) => {
    if (socket.connected) {
      // Only emit if connected
      console.log(
        `SocketAdapters Debug: Emitting 'joinTripRoom' for tripId: ${tripId}`
      );
      socket.emit("joinTripRoom", tripId);
    } else {
      console.warn(
        `SocketAdapters Warning: Not connected, cannot join room ${tripId}.`
      );
    }
  },

  // Emits 'chat message' event, matching backend
  sendMessage: (tripId, text, senderId) => {
    console.log("SocketAdapters Debug: sendMessage called.");
    console.log(
      `SocketAdapters Debug: socket.connected status: ${socket.connected}`
    );

    if (text.trim() === "") {
      console.log("SocketAdapters Debug: Message text is empty, not emitting.");
      return;
    }

    if (!socket.connected) {
      console.error(
        "SocketAdapters Debug: Socket not connected, cannot emit message."
      );
      // Emit an error to the frontend if not connected
      socket.emit("error", {
        message: "Chat is not connected. Please try again.",
      });
      return;
    }

    const messageData = {
      text: text.trim(),
      senderId: senderId,
      timestamp: new Date().toISOString(),
      tripId: tripId,
    };
    console.log(
      'SocketAdapters Debug: Emitting "chat message" with data:',
      messageData
    );
    socket.emit("chat message", messageData);
  },

  // Listens for 'chat message' event, matching backend
  onMessage: (cb) => {
    socket.on("chat message", cb);
    console.log(
      'SocketAdapters Debug: Listener registered for "chat message".'
    );
  },

  // Listens for 'historical messages' event from backend
  onHistoricalMessages: (cb) => {
    socket.on("historical messages", cb);
    console.log(
      'SocketAdapters Debug: Listener registered for "historical messages".'
    );
  },

  // Listens for 'status message' event from backend (e.g., user joined/left)
  onStatusMessage: (cb) => {
    socket.on("status message", cb);
    console.log(
      'SocketAdapters Debug: Listener registered for "status message".'
    );
  },

  // Listen for general errors from the socket (from backend or connection issues)
  onError: (cb) => {
    socket.on("error", cb);
    console.log('SocketAdapters Debug: Listener registered for "error".');
  },

  // Off methods for cleanup
  offMessage: (cb) => {
    socket.off("chat message", cb);
    console.log(
      'SocketAdapters Debug: Listener unregistered for "chat message".'
    );
  },
  offHistoricalMessages: (cb) => {
    socket.off("historical messages", cb);
    console.log(
      'SocketAdapters Debug: Listener unregistered for "historical messages".'
    );
  },
  offStatusMessage: (cb) => {
    socket.off("status message", cb);
    console.log(
      'SocketAdapters Debug: Listener unregistered for "status message".'
    );
  },
  offError: (cb) => {
    socket.off("error", cb);
    console.log('SocketAdapters Debug: Listener unregistered for "error".');
  },
};

export default socket;
