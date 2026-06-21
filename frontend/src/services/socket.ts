import { io } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

export const socket = io(WS_URL, {
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  autoConnect: false,
});

socket.on('connect', () => {
  console.log('Socket connecté:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Socket déconnecté');
});

socket.on('error', (error) => {
  console.error('Erreur socket:', error);
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;
