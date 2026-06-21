import { Socket } from 'socket.io';
import prisma from '../../utils/prisma';

// Palette de couleurs pour les équipes
const TEAM_COLORS = [
  '#FF6B6B', // Rouge
  '#4ECDC4', // Turquoise
  '#FFE66D', // Jaune
  '#95E1D3', // Vert menthe
  '#F38181', // Rose
  '#AA96DA', // Violet
  '#FCBAD3', // Rose clair
  '#A8D8EA', // Bleu clair
];

export const handleTeamCreate = async (
  socket: Socket,
  data: { sessionId: string; teamName: string }
) => {
  const { sessionId, teamName } = data;

  try {
    // Vérifier que la session existe
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { teams: true },
    });

    if (!session) {
      socket.emit('error', { message: 'Session introuvable' });
      return;
    }

    // Vérifier qu'une équipe avec ce nom n'existe pas déjà
    const existingTeam = session.teams.find(
      (t) => t.name.toLowerCase() === teamName.toLowerCase()
    );

    if (existingTeam) {
      socket.emit('error', {
        message: 'Une équipe avec ce nom existe déjà',
      });
      return;
    }

    // Choisir une couleur (en cycle)
    const colorIndex = session.teams.length % TEAM_COLORS.length;
    const color = TEAM_COLORS[colorIndex];

    // Créer l'équipe
    const team = await prisma.team.create({
      data: {
        sessionId,
        name: teamName,
        color,
      },
      include: {
        players: true,
      },
    });

    // Notifier tous les participants
    socket.to(`session:${sessionId}`).emit('team:created', { team });
    socket.emit('team:created', { team });

    return team;
  } catch (error) {
    console.error('Erreur création équipe:', error);
    socket.emit('error', { message: 'Erreur lors de la création de l\'équipe' });
    throw error;
  }
};

export const handleTeamJoin = async (
  socket: Socket,
  data: { playerId: string; teamId: string }
) => {
  const { playerId, teamId } = data;

  try {
    // Mettre à jour le joueur avec l'équipe
    const player = await prisma.player.update({
      where: { id: playerId },
      data: { teamId },
      include: {
        team: true,
        session: true,
      },
    });

    // Mettre à jour le score de l'équipe (recalculer)
    await updateTeamScore(teamId);

    // Récupérer l'équipe mise à jour avec tous les joueurs
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        players: true,
      },
    });

    // Notifier tous les participants
    const sessionRoom = `session:${player.sessionId}`;
    socket.to(sessionRoom).emit('team:updated', { team });
    socket.emit('team:joined', { team, player });

    return { team, player };
  } catch (error) {
    console.error('Erreur rejoindre équipe:', error);
    socket.emit('error', { message: 'Erreur lors de la jonction à l\'équipe' });
    throw error;
  }
};

export const handleTeamLeave = async (
  socket: Socket,
  data: { playerId: string }
) => {
  const { playerId } = data;

  try {
    // Retirer le joueur de son équipe
    const player = await prisma.player.update({
      where: { id: playerId },
      data: { teamId: null },
      include: {
        session: true,
      },
    });

    const oldTeamId = player.teamId;

    // Si le joueur était dans une équipe, mettre à jour son score
    if (oldTeamId) {
      await updateTeamScore(oldTeamId);

      // Récupérer l'équipe mise à jour
      const team = await prisma.team.findUnique({
        where: { id: oldTeamId },
        include: {
          players: true,
        },
      });

      // Notifier tous les participants
      const sessionRoom = `session:${player.sessionId}`;
      socket.to(sessionRoom).emit('team:updated', { team });
    }

    socket.emit('team:left', { player });

    return player;
  } catch (error) {
    console.error('Erreur quitter équipe:', error);
    socket.emit('error', { message: 'Erreur lors de la sortie de l\'équipe' });
    throw error;
  }
};

export const handleGetTeams = async (
  socket: Socket,
  data: { sessionId: string }
) => {
  const { sessionId } = data;

  try {
    const teams = await prisma.team.findMany({
      where: { sessionId },
      include: {
        players: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    socket.emit('teams:list', { teams });

    return teams;
  } catch (error) {
    console.error('Erreur récupération équipes:', error);
    socket.emit('error', { message: 'Erreur lors de la récupération des équipes' });
    throw error;
  }
};

// Fonction utilitaire pour recalculer le score d'une équipe
export const updateTeamScore = async (teamId: string) => {
  try {
    // Récupérer tous les joueurs de l'équipe
    const players = await prisma.player.findMany({
      where: { teamId },
    });

    // Calculer la somme des scores
    const totalScore = players.reduce((sum, player) => sum + player.score, 0);

    // Mettre à jour le score de l'équipe
    await prisma.team.update({
      where: { id: teamId },
      data: { score: totalScore },
    });

    return totalScore;
  } catch (error) {
    console.error('Erreur mise à jour score équipe:', error);
    throw error;
  }
};

// Fonction pour obtenir le classement des équipes
export const getTeamRanking = async (sessionId: string) => {
  try {
    const teams = await prisma.team.findMany({
      where: { sessionId },
      include: {
        players: {
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
      ...team,
      rank: index + 1,
      playerCount: team.players.length,
    }));
  } catch (error) {
    console.error('Erreur classement équipes:', error);
    throw error;
  }
};
