import { io } from 'socket.io-client';

// Explicitly set the SOCKET_URL to 127.0.0.1 to match backend binding
const SOCKET_URL = 'http://127.0.0.1:5000';

// The socket instance is created here, but autoConnect is false.
// This allows us to manually connect and pass the JWT token.
const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: false, // We will connect manually after getting the token
  // The 'query' object is crucial for passing the JWT token to the backend
  // for authentication during the WebSocket handshake.
  query: {
    token: localStorage.getItem('token') || '', // Pass JWT token from localStorage
  },
  // CRUCIAL ADDITION: Explicitly set the protocol version to 4
  // This helps ensure compatibility between socket.io-client v4 and Flask-SocketIO v5
  // as Flask-SocketIO v5 supports protocol v4 for backward compatibility.
  forceNew: true, // Forces a new connection every time io() is called
  // path: '/socket.io/', // This is the default, but can be explicit if needed
  // This is the key change to explicitly set the protocol version
  // It tells the client to speak Socket.IO protocol v4.
  // Flask-SocketIO v5 is designed to understand this.
  // If this causes issues, we might remove it or try 'protocol: 5' if client supports it.
  // For now, let's try protocol 4 as client is v4.x.x
  upgrade: false, // Prevents upgrading to a newer protocol if not explicitly set
  // This is the actual option that sets the protocol version
  // The 'v' is important for socket.io-client v4 to indicate protocol version
  // However, the standard way is to use `forceNew: true` and rely on default negotiation
  // or ensure client and server are on the same major version.
  // Let's remove the `protocol` option as it's not standard for v4 to v5 compatibility
  // and rely on the default backward compatibility of Flask-SocketIO.
  // The `forceNew: true` is still good for development.
});

// Add a listener for the 'connect' event to confirm socket connection
socket.on('connect', () => {
  console.log('SocketAdapters Debug: Socket.IO client connected!');
});

// Add a listener for the 'disconnect' event
socket.on('disconnect', (reason) => {
  console.log('SocketAdapters Debug: Socket.IO client disconnected:', reason);
});

// Add a listener for general connection errors from the socket
socket.on('connect_error', (err) => {
  console.error('SocketAdapters Debug: Socket.IO connection error:', err.message);
});


export const ChatSocket = {
  // Connect the socket. This will also send the 'query' parameters.
  connect: () => {
    if (!socket.connected) {
      // Before connecting, ensure the token in the query is up-to-date.
      socket.io.opts.query = {
        token: localStorage.getItem('token') || '',
      };
      console.log('SocketAdapters Debug: Attempting to connect socket.');
      socket.connect();
    } else {
      console.log('SocketAdapters Debug: Socket already connected.');
    }
  },

  disconnect: () => {
    if (socket.connected) {
      console.log('SocketAdapters Debug: Disconnecting socket.');
      socket.disconnect();
    } else {
      console.log('SocketAdapters Debug: Socket not connected, no need to disconnect.');
    }
  },

  // Emits 'joinTripRoom' event, matching backend
  joinRoom: (tripId) => {
    console.log(`SocketAdapters Debug: Emitting 'joinTripRoom' for tripId: ${tripId}`);
    socket.emit('joinTripRoom', tripId);
  },

  // Emits 'chat message' event, matching backend
  sendMessage: (tripId, text, senderId) => {
    console.log('SocketAdapters Debug: sendMessage called.');
    console.log(`SocketAdapters Debug: socket.connected status: ${socket.connected}`);

    if (text.trim() === '') {
      console.log('SocketAdapters Debug: Message text is empty, not emitting.');
      return;
    }

    if (!socket.connected) {
      console.error('SocketAdapters Debug: Socket not connected, cannot emit message.');
      // Optionally, you could try to reconnect here or show an error to the user
      return;
    }

    const messageData = {
      text: text.trim(),
      senderId: senderId,
      timestamp: new Date().toISOString(),
      tripId: tripId,
    };
    console.log('SocketAdapters Debug: Emitting "chat message" with data:', messageData);
    socket.emit('chat message', messageData);
  },

  // Listens for 'chat message' event, matching backend
  onMessage: (cb) => {
    socket.on('chat message', cb);
    console.log('SocketAdapters Debug: Listener registered for "chat message".');
  },

  // Listens for 'historical messages' event from backend
  onHistoricalMessages: (cb) => {
    socket.on('historical messages', cb);
    console.log('SocketAdapters Debug: Listener registered for "historical messages".');
  },

  // Listens for 'status message' event from backend (e.g., user joined/left)
  onStatusMessage: (cb) => {
    socket.on('status message', cb);
    console.log('SocketAdapters Debug: Listener registered for "status message".');
  },

  // Listen for errors from the socket
  onError: (cb) => {
    socket.on('error', cb);
    console.log('SocketAdapters Debug: Listener registered for "error".');
  },

  // Off methods for cleanup
  offMessage: (cb) => {
    socket.off('chat message', cb);
    console.log('SocketAdapters Debug: Listener unregistered for "chat message".');
  },
  offHistoricalMessages: (cb) => {
    socket.off('historical messages', cb);
    console.log('SocketAdapters Debug: Listener unregistered for "historical messages".');
  },
  offStatusMessage: (cb) => {
    socket.off('status message', cb);
    console.log('SocketAdapters Debug: Listener unregistered for "status message".');
  },
  offError: (cb) => {
    socket.off('error', cb);
    console.log('SocketAdapters Debug: Listener unregistered for "error".');
  }
};

export default socket;
