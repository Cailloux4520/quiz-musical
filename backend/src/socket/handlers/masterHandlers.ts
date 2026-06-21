import { Socket } from 'socket.io';
import sessionService from '../../services/sessionService';

export const handleSessionStart = async (
  socket: Socket,
  data: { sessionId: string }
) => {
  const { sessionId } = data;

  try {
    const session = await sessionService.startSession(sessionId);

    // Joindre la room de la session
    socket.join(`session:${sessionId}`);

    // Notifier tous les participants
    socket.to(`session:${sessionId}`).emit('session:started', {
      sessionId,
      currentQuestion: 0,
    });

    // Confirmer au maître
    socket.emit('session:started', {
      sessionId,
      currentQuestion: 0,
    });
  } catch (error) {
    socket.emit('error', { message: 'Erreur lors du démarrage de la session' });
    throw error;
  }
};

export const handleQuestionNext = async (
  socket: Socket,
  data: { sessionId: string }
) => {
  const { sessionId } = data;

  try {
    const session = await sessionService.nextQuestion(sessionId);

    if (session.status === 'finished') {
      // La session est terminée
      const leaderboard = await sessionService.getLeaderboard(sessionId);
      const teamLeaderboard = await sessionService.getTeamLeaderboard(sessionId);

      socket.to(`session:${sessionId}`).emit('session:finished', {
        leaderboard,
        teamLeaderboard,
      });

      socket.emit('session:finished', {
        leaderboard,
        teamLeaderboard,
      });
    } else {
      // Passer à la question suivante
      socket.to(`session:${sessionId}`).emit('question:next', {
        questionIndex: session.currentQ,
      });

      socket.emit('question:next', {
        questionIndex: session.currentQ,
      });
    }
  } catch (error) {
    socket.emit('error', { message: 'Erreur lors du passage à la question suivante' });
    throw error;
  }
};

export const handleShowResults = async (
  socket: Socket,
  data: { sessionId: string }
) => {
  const { sessionId } = data;

  try {
    const leaderboard = await sessionService.getLeaderboard(sessionId);

    socket.to(`session:${sessionId}`).emit('results:show', {
      leaderboard,
    });

    socket.emit('results:show', {
      leaderboard,
    });
  } catch (error) {
    socket.emit('error', { message: 'Erreur lors de l\'affichage des résultats' });
    throw error;
  }
};

export const handleMasterJoin = async (
  socket: Socket,
  data: { sessionId: string }
) => {
  const { sessionId } = data;

  try {
    // Joindre la room de la session
    socket.join(`session:${sessionId}`);

    // Récupérer l'état de la session
    const session = await sessionService.getSessionState(sessionId);

    socket.emit('master:joined', { session });
  } catch (error) {
    socket.emit('error', { message: 'Erreur lors de la connexion en tant que maître' });
    throw error;
  }
};
