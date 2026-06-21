import prisma from '../utils/prisma';

export class SessionService {
  /**
   * Récupère l'état complet d'une session
   */
  async getSessionState(sessionId: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        players: {
          include: {
            team: true,
          },
          orderBy: {
            score: 'desc',
          },
        },
        teams: true,
      },
    });

    return session;
  }

  /**
   * Démarre une session
   */
  async startSession(sessionId: string) {
    return await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'playing',
        startedAt: new Date(),
        currentQ: 0,
      },
    });
  }

  /**
   * Passe à la question suivante
   */
  async nextQuestion(sessionId: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        quiz: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!session) {
      throw new Error('Session non trouvée');
    }

    const nextIndex = session.currentQ + 1;

    if (nextIndex >= session.quiz.questions.length) {
      // C'est la dernière question, terminer la session
      return await prisma.session.update({
        where: { id: sessionId },
        data: {
          status: 'finished',
          finishedAt: new Date(),
        },
      });
    }

    return await prisma.session.update({
      where: { id: sessionId },
      data: {
        currentQ: nextIndex,
      },
    });
  }

  /**
   * Termine une session
   */
  async finishSession(sessionId: string) {
    return await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'finished',
        finishedAt: new Date(),
      },
    });
  }

  /**
   * Récupère le classement des joueurs
   */
  async getLeaderboard(sessionId: string) {
    const players = await prisma.player.findMany({
      where: { sessionId },
      orderBy: [
        { score: 'desc' },
        { correctCount: 'desc' },
      ],
      include: {
        team: true,
      },
    });

    return players;
  }

  /**
   * Récupère le classement des équipes
   */
  async getTeamLeaderboard(sessionId: string) {
    const teams = await prisma.team.findMany({
      where: { sessionId },
      orderBy: {
        score: 'desc',
      },
      include: {
        players: true,
      },
    });

    return teams;
  }
}

export default new SessionService();
