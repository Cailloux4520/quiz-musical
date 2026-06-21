import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

/**
 * Récupérer les statistiques du dashboard admin
 * GET /api/dashboard/stats
 */
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Total quiz créés par l'utilisateur
    const totalQuiz = await prisma.quiz.count({
      where: { userId },
    });

    // Total sessions créées (tous quiz de l'utilisateur)
    const totalSessions = await prisma.session.count({
      where: {
        quiz: {
          userId,
        },
      },
    });

    // Total joueurs uniques (distinct sur nickname peut ne pas être parfait, mais c'est une approximation)
    const totalPlayers = await prisma.player.count({
      where: {
        session: {
          quiz: {
            userId,
          },
        },
      },
    });

    // Total questions dans tous les quiz de l'utilisateur
    const totalQuestions = await prisma.question.count({
      where: {
        quiz: {
          userId,
        },
      },
    });

    // Top 5 quiz les plus joués (nombre de sessions)
    const topQuiz = await prisma.quiz.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            sessions: true,
          },
        },
      },
      orderBy: {
        sessions: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    // Sessions récentes (10 dernières)
    const recentSessions = await prisma.session.findMany({
      where: {
        quiz: {
          userId,
        },
      },
      select: {
        id: true,
        inviteCode: true,
        status: true,
        createdAt: true,
        quiz: {
          select: {
            title: true,
          },
        },
        _count: {
          select: {
            players: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Distribution des types de questions
    const questionTypes = await prisma.question.groupBy({
      by: ['type'],
      where: {
        quiz: {
          userId,
        },
      },
      _count: {
        type: true,
      },
    });

    // Sessions par jour (30 derniers jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sessionsPerDay = await prisma.session.groupBy({
      by: ['createdAt'],
      where: {
        quiz: {
          userId,
        },
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: {
        id: true,
      },
    });

    // Transformer les sessions par jour en format utilisable
    const sessionsByDay = sessionsPerDay.reduce((acc: Record<string, number>, session) => {
      const date = new Date(session.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + session._count.id;
      return acc;
    }, {});

    // Créer un tableau avec tous les jours des 30 derniers jours
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last30Days.push({
        date: dateStr,
        count: sessionsByDay[dateStr] || 0,
      });
    }

    // Stockage utilisé (approximation basée sur le nombre de médias)
    // Note: MinIO devrait être interrogé pour les vraies tailles, mais c'est une estimation
    const mediaCount = await prisma.question.count({
      where: {
        quiz: {
          userId,
        },
        OR: [
          { audioUrl: { not: null } },
          { imageUrl: { not: null } },
        ],
      },
    });

    // Estimation : environ 2 MB par média en moyenne
    const estimatedStorageMB = mediaCount * 2;

    res.json({
      kpi: {
        totalQuiz,
        totalSessions,
        totalPlayers,
        totalQuestions,
      },
      topQuiz: topQuiz.map((q) => ({
        id: q.id,
        title: q.title,
        sessionsCount: q._count.sessions,
      })),
      recentSessions: recentSessions.map((s) => ({
        id: s.id,
        inviteCode: s.inviteCode,
        status: s.status,
        quizTitle: s.quiz.title,
        playersCount: s._count.players,
        createdAt: s.createdAt,
      })),
      questionTypes: questionTypes.map((qt) => ({
        type: qt.type,
        count: qt._count.type,
      })),
      sessionsPerDay: last30Days,
      storage: {
        mediaCount,
        estimatedMB: estimatedStorageMB,
        estimatedGB: (estimatedStorageMB / 1024).toFixed(2),
      },
    });
  } catch (error) {
    console.error('Erreur getDashboardStats:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};
