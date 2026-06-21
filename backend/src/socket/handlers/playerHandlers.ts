import { Socket } from 'socket.io';
import prisma from '../../utils/prisma';
import { calculateScore } from '../../services/scoreService';

export const handlePlayerJoin = async (
  socket: Socket,
  data: { sessionId: string; nickname: string; teamId?: string }
) => {
  const { sessionId, nickname, teamId } = data;

  try {
    // Créer le joueur
    const player = await prisma.player.create({
      data: {
        sessionId,
        nickname,
        socketId: socket.id,
        teamId: teamId || null,
      },
      include: {
        team: true,
      },
    });

    // Joindre la room de la session
    socket.join(`session:${sessionId}`);

    // Confirmer au joueur qu'il a rejoint
    socket.emit('player:joined', { player });

    // Notifier tous les participants
    socket.to(`session:${sessionId}`).emit('player:new', { player });

    return player;
  } catch (error) {
    socket.emit('error', { message: 'Erreur lors de la connexion' });
    throw error;
  }
};

export const handleAnswerSubmit = async (
  socket: Socket,
  data: {
    sessionId: string;
    playerId: string;
    questionId: string;
    choiceIndex: number;
    timeElapsed: number;
  }
) => {
  const { sessionId, playerId, questionId, choiceIndex, timeElapsed } = data;

  try {
    // Récupérer la question
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      socket.emit('error', { message: 'Question non trouvée' });
      return;
    }

    // Vérifier si la réponse est correcte
    const isCorrect = choiceIndex === question.correctIndex;

    // Calculer les points
    const pointsEarned = isCorrect
      ? calculateScore(question.points, timeElapsed, question.timeLimit)
      : 0;

    // Enregistrer la réponse
    const answer = await prisma.answer.create({
      data: {
        playerId,
        questionId,
        chosenIndex: choiceIndex,
        isCorrect,
        timeElapsed,
        pointsEarned,
      },
    });

    // Mettre à jour le score du joueur
    const player = await prisma.player.update({
      where: { id: playerId },
      data: {
        score: {
          increment: pointsEarned,
        },
        correctCount: isCorrect ? { increment: 1 } : undefined,
        wrongCount: !isCorrect ? { increment: 1 } : undefined,
      },
      include: {
        team: true,
      },
    });

    // Si le joueur est dans une équipe, mettre à jour le score de l'équipe
    if (player.teamId) {
      await prisma.team.update({
        where: { id: player.teamId },
        data: {
          score: {
            increment: pointsEarned,
          },
        },
      });
    }

    // Confirmer au joueur
    socket.emit('answer:recorded', {
      isCorrect,
      pointsEarned,
      newScore: player.score,
    });

    // Notifier l'écran maître
    socket.to(`session:${sessionId}`).emit('answer:submitted', {
      playerId,
      playerNickname: player.nickname,
      isCorrect,
      timeElapsed,
    });
  } catch (error) {
    socket.emit('error', { message: 'Erreur lors de l\'enregistrement de la réponse' });
    throw error;
  }
};

export const handlePlayerDisconnect = async (socket: Socket) => {
  try {
    // Trouver le joueur par son socketId
    const player = await prisma.player.findFirst({
      where: { socketId: socket.id },
    });

    if (player) {
      // Marquer le joueur comme déconnecté
      await prisma.player.update({
        where: { id: player.id },
        data: {
          isConnected: false,
          socketId: null,
        },
      });

      // Notifier la session
      socket.to(`session:${player.sessionId}`).emit('player:disconnected', {
        playerId: player.id,
        nickname: player.nickname,
      });
    }
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
};
