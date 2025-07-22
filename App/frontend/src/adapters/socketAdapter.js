// src/adapters/socketAdapter.js
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: false,
});

export const ChatSocket = {
  connect: () => {
    if (!socket.connected) socket.connect();
  },

  disconnect: () => {
    if (socket.connected) socket.disconnect();
  },

  joinRoom: (tripId) => {
    socket.emit('join_trip', { tripId });
  },

  sendMessage: (tripId, message) => {
    socket.emit('send_message', { tripId, message });
  },

  onMessage: (cb) => {
    socket.on('receive_message', cb);
  },

  offMessage: () => {
    socket.off('receive_message');
  },
};

export default socket;
