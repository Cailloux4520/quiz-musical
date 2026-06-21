import { Socket } from 'socket.io';
import prisma from '../../utils/prisma';

/**
 * Récupère les statistiques de réponses pour une question
 */
export const getQuestionStats = async (questionId: string, sessionId: string) => {
  // Compter les réponses par choix
  const answers = await prisma.answer.findMany({
    where: {
      questionId,
      player: {
        sessionId,
      },
    },
    select: {
      chosenIndex: true,
      isCorrect: true,
      responseTime: true,
    },
  });

  // Calculer les stats
  const totalAnswers = answers.length;
  const correctAnswers = answers.filter((a) => a.isCorrect).length;
  const distribution = [0, 0, 0, 0]; // A, B, C, D

  answers.forEach((answer) => {
    if (answer.chosenIndex >= 0 && answer.chosenIndex <= 3) {
      distribution[answer.chosenIndex]++;
    }
  });

  const avgResponseTime =
    totalAnswers > 0
      ? answers.reduce((sum, a) => sum + a.responseTime, 0) / totalAnswers
      : 0;

  return {
    totalAnswers,
    correctAnswers,
    correctPercentage: totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0,
    distribution, // [countA, countB, countC, countD]
    avgResponseTime,
  };
};

/**
 * Récupère le classement en temps réel
 */
export const getLiveLeaderboard = async (sessionId: string, limit = 10) => {
  const players = await prisma.player.findMany({
    where: {
      sessionId,
      isConnected: true,
    },
    orderBy: {
      score: 'desc',
    },
    take: limit,
    select: {
      id: true,
      nickname: true,
      score: true,
      correctCount: true,
      wrongCount: true,
      teamId: true,
      team: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });

  return players.map((player, index) => ({
    rank: index + 1,
    id: player.id,
    nickname: player.nickname,
    score: player.score,
    correctCount: player.correctCount,
    wrongCount: player.wrongCount,
    team: player.team,
  }));
};

/**
 * Récupère le classement des équipes
 */
export const getTeamLeaderboard = async (sessionId: string) => {
  const teams = await prisma.team.findMany({
    where: {
      sessionId,
    },
    include: {
      players: {
        where: {
          isConnected: true,
        },
        select: {
          id: true,
          nickname: true,
          score: true,
        },
      },
    },
    orderBy: {
      score: 'desc',
    },
  });

  return teams.map((team, index) => ({
    rank: index + 1,
    id: team.id,
    name: team.name,
    color: team.color,
    score: team.score,
    playerCount: team.players.length,
    players: team.players,
  }));
};

/**
 * Handler pour démarrer une question
 */
export const handleQuestionStart = async (
  socket: Socket,
  data: { sessionId: string; questionIndex: number }
) => {
  const { sessionId, questionIndex } = data;

  try {
    // Récupérer la session avec le quiz et les questions
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!session) {
      socket.emit('error', { message: 'Session non trouvée' });
      return;
    }

    const question = session.quiz.questions[questionIndex];

    if (!question) {
      socket.emit('error', { message: 'Question non trouvée' });
      return;
    }

    // Données complètes de la question (sans la réponse correcte pour les joueurs)
    const questionData = {
      id: question.id,
      type: question.type,
      question: question.question,
      choices: question.choices,
      timeLimit: question.timeLimit,
      audioUrl: question.audioUrl,
      imageUrl: question.imageUrl,
      youtubeUrl: question.youtubeUrl,
      startTime: question.startTime,
      endTime: question.endTime,
      questionIndex,
      totalQuestions: session.quiz.questions.length,
    };

    // Broadcast à tous les participants
    socket.to(`session:${sessionId}`).emit('question:started', questionData);
    socket.emit('question:started', questionData);

    // Démarrer le timer côté serveur pour auto-terminer la question
    setTimeout(async () => {
      await handleQuestionEnd(socket, { sessionId, questionId: question.id });
    }, question.timeLimit * 1000 + 1000); // +1s de marge
  } catch (error) {
    socket.emit('error', { message: 'Erreur lors du démarrage de la question' });
    throw error;
  }
};

/**
 * Handler pour terminer une question et afficher les statistiques
 */
export const handleQuestionEnd = async (
  socket: Socket,
  data: { sessionId: string; questionId: string }
) => {
  const { sessionId, questionId } = data;

  try {
    // Récupérer la question avec la réponse correcte
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      socket.emit('error', { message: 'Question non trouvée' });
      return;
    }

    // Récupérer les statistiques
    const stats = await getQuestionStats(questionId, sessionId);

    // Données de fin de question avec réponse correcte et stats
    const endData = {
      questionId,
      correctIndex: question.correctIndex,
      correctAnswer: question.choices[question.correctIndex],
      acceptedAnswers: question.acceptedAnswers,
      stats,
    };

    // Broadcast à tous les participants
    socket.to(`session:${sessionId}`).emit('question:ended', endData);
    socket.emit('question:ended', endData);
  } catch (error) {
    socket.emit('error', { message: 'Erreur lors de la fin de la question' });
    throw error;
  }
};

/**
 * Handler pour broadcast les stats en temps réel quand une réponse arrive
 */
export const broadcastAnswerStats = async (
  socket: Socket,
  sessionId: string,
  questionId: string
) => {
  try {
    const stats = await getQuestionStats(questionId, sessionId);
    const leaderboard = await getLiveLeaderboard(sessionId, 10);
    const teamLeaderboard = await getTeamLeaderboard(sessionId);

    // Broadcast aux maîtres/spectateurs uniquement
    socket.to(`session:${sessionId}`).emit('answer:stats', {
      questionId,
      stats,
      leaderboard,
      teamLeaderboard,
    });
  } catch (error) {
    console.error('Erreur broadcast stats:', error);
  }
};
