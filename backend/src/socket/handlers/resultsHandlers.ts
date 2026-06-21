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
        players: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            players: true,
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

    // Top 3 joueurs
    const top3Players = players.slice(0, 3);

    // Top 3 équipes
    const top3Teams = teams.slice(0, 3);

    // Statistiques de session
    const totalQuestions = await prisma.question.count({
      where: { quizId: session.quizId },
    });

    const totalAnswers = await prisma.answer.count({
      where: {
        player: {
          sessionId,
        },
      },
    });

    const correctAnswers = await prisma.answer.count({
      where: {
        player: {
          sessionId,
        },
        isCorrect: true,
      },
    });

    const avgScore =
      players.length > 0
        ? Math.round(
            players.reduce((sum, p) => sum + p.score, 0) / players.length
          )
        : 0;

    const stats = {
      totalPlayers: session._count.players,
      totalQuestions,
      totalAnswers,
      correctAnswers,
      correctPercentage:
        totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0,
      avgScore,
    };

    // Envoyer les résultats
    socket.emit('session:results', {
      sessionId,
      quizTitle: session.quiz.title,
      players,
      teams,
      top3Players,
      top3Teams,
      stats,
    });
  } catch (error) {
    socket.emit('error', { message: 'Erreur lors de la récupération des résultats' });
    throw error;
  }
};
