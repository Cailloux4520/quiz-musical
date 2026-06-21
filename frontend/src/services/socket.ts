import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

let socket: Socket | null = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(WS_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('Socket connecté:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket déconnecté');
    });

    socket.on('error', (error) => {
      console.error('Erreur socket:', error);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  return socket;
};

export default {
  connect: connectSocket,
  disconnect: disconnectSocket,
  get: getSocket,
};
