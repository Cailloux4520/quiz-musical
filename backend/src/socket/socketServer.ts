import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { config } from '../config/env';
import {
  handlePlayerJoin,
  handleAnswerSubmit,
  handlePlayerDisconnect,
} from './handlers/playerHandlers';
import {
  handleSessionStart,
  handleQuestionNext,
  handleShowResults,
  handleMasterJoin,
} from './handlers/masterHandlers';

export const initializeSocketServer = (httpServer: HTTPServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: config.cors.origin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log('Client connecté:', socket.id);

    // Events pour les joueurs
    socket.on('player:join', (data) => handlePlayerJoin(socket, data));
    socket.on('answer:submit', (data) => handleAnswerSubmit(socket, data));

    // Events pour le maître de session
    socket.on('master:join', (data) => handleMasterJoin(socket, data));
    socket.on('session:start', (data) => handleSessionStart(socket, data));
    socket.on('question:next', (data) => handleQuestionNext(socket, data));
    socket.on('results:show', (data) => handleShowResults(socket, data));

    // Déconnexion
    socket.on('disconnect', () => {
      console.log('Client déconnecté:', socket.id);
      handlePlayerDisconnect(socket);
    });
  });

  return io;
};
