import { Socket } from 'socket.io';
import { getLiveLeaderboard, getTeamLeaderboard } from './statsHandlers';
import prisma from '../../utils/prisma';

/**
 * Handler pour récupérer les résultats finaux d'une session
 */
export const handleGetSessionResults = async (
  socket: Socket,
  data: { sessionId: string }
) => {
  const { sessionId } = data;

  try {
    // Récupérer la session avec le quiz
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        quiz: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!session) {
      socket.emit('error', { message: 'Session non trouvée' });
      return;
    }

    // Récupérer les classements finaux
    const players = await getLiveLeaderboard(sessionId, 100); // Tous les joueurs
    const teams = await getTeamLeaderboard(sessionId);

    // Envoyer les résultats
    socket.emit('session:results', {
      sessionId,
      quizTitle: session.quiz.title,
      players,
      teams,
    });
  } catch (error) {
    socket.emit('error', { message: 'Erreur lors de la récupération des résultats' });
    throw error;
  }
};
