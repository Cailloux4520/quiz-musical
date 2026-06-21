import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import 'express-async-errors';

import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { initializeSocketServer } from './socket/socketServer';

import authRoutes from './routes/auth';
import quizRoutes from './routes/quiz';
import sessionRoutes from './routes/session';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/sessions', sessionRoutes);

// Error handler (doit être à la fin)
app.use(errorHandler);

// Initialiser Socket.io
initializeSocketServer(httpServer);

// Démarrer le serveur
httpServer.listen(config.port, () => {
  console.log(`🚀 Serveur démarré sur le port ${config.port}`);
  console.log(`📡 API disponible sur http://localhost:${config.port}/api`);
  console.log(`🔌 WebSocket disponible sur ws://localhost:${config.port}`);
});

// Gestion des erreurs non gérées
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
