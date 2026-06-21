import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const getQuizzes = async (req: AuthRequest, res: Response) => {
  const { search, theme, sortBy = 'createdAt', order = 'desc' } = req.query;

  const where: any = {
    userId: req.user!.userId,
  };

  if (search) {
    where.title = {
      contains: search as string,
      mode: 'insensitive',
    };
  }

  if (theme) {
    where.theme = theme;
  }

  const quizzes = await prisma.quiz.findMany({
    where,
    include: {
      _count: {
        select: { questions: true },
      },
    },
    orderBy: {
      [sortBy as string]: order,
    },
  });

  res.json({
    quizzes: quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      theme: quiz.theme,
      questionsCount: quiz._count.questions,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
    })),
    total: quizzes.length,
  });
};

export const getQuizById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const quiz = await prisma.quiz.findFirst({
    where: {
      id,
      userId: req.user!.userId,
    },
    include: {
      questions: {
        orderBy: {
          order: 'asc',
        },
      },
    },
  });

  if (!quiz) {
    return res.status(404).json({ error: 'Quiz non trouvé' });
  }

  res.json({ quiz });
};

export const createQuiz = async (req: AuthRequest, res: Response) => {
  const { title, description, theme, questions = [] } = req.body;

  const quiz = await prisma.quiz.create({
    data: {
      title,
      description,
      theme,
      userId: req.user!.userId,
    },
  });

  // Créer les questions si fournies
  if (questions.length > 0) {
    await prisma.question.createMany({
      data: questions.map((q: any, index: number) => ({
        quizId: quiz.id,
        order: q.order !== undefined ? q.order : index,
        type: q.type,
        content: q.question,
        audioUrl: q.audioUrl || null,
        imageUrl: q.imageUrl || null,
        youtubeUrl: q.youtubeUrl || null,
        startTime: q.startTime || null,
        endTime: q.endTime || null,
        duration: q.duration || null,
        choices: q.options || [],
        correctIndex: q.type.includes('qcm') ? parseInt(q.correctAnswer || '0') : 0,
        correctAnswer: q.type.includes('free') || q.type === 'blind_test' || q.type === 'album_cover' ? q.correctAnswer : null,
        acceptedAnswers: q.acceptedAnswers || [],
        caseSensitive: q.caseSensitive || false,
        timeLimit: q.timeLimit || 30,
        points: q.points || 1000,
        showVideoAfterAnswer: q.showVideoAfterAnswer || false,
      })),
    });
  }

  res.status(201).json({ quiz });
};

export const updateQuiz = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, description, theme, questions } = req.body;

  const quiz = await prisma.quiz.findFirst({
    where: {
      id,
      userId: req.user!.userId,
    },
  });

  if (!quiz) {
    return res.status(404).json({ error: 'Quiz non trouvé' });
  }

  const updatedQuiz = await prisma.quiz.update({
    where: { id },
    data: {
      title,
      description,
      theme,
    },
  });

  // Mettre à jour les questions si fournies
  if (questions !== undefined) {
    // Supprimer toutes les anciennes questions
    await prisma.question.deleteMany({
      where: { quizId: id },
    });

    // Créer les nouvelles questions
    if (questions.length > 0) {
      await prisma.question.createMany({
        data: questions.map((q: any, index: number) => ({
          quizId: id,
          order: q.order !== undefined ? q.order : index,
          type: q.type,
          content: q.question,
          audioUrl: q.audioUrl || null,
          imageUrl: q.imageUrl || null,
          youtubeUrl: q.youtubeUrl || null,
          startTime: q.startTime || null,
          endTime: q.endTime || null,
          duration: q.duration || null,
          choices: q.options || [],
          correctIndex: q.type.includes('qcm') ? parseInt(q.correctAnswer || '0') : 0,
          correctAnswer: q.type.includes('free') || q.type === 'blind_test' || q.type === 'album_cover' ? q.correctAnswer : null,
          acceptedAnswers: q.acceptedAnswers || [],
          caseSensitive: q.caseSensitive || false,
          timeLimit: q.timeLimit || 30,
          points: q.points || 1000,
          showVideoAfterAnswer: q.showVideoAfterAnswer || false,
        })),
      });
    }
  }

  res.json({ quiz: updatedQuiz });
};

export const deleteQuiz = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const quiz = await prisma.quiz.findFirst({
    where: {
      id,
      userId: req.user!.userId,
    },
  });

  if (!quiz) {
    return res.status(404).json({ error: 'Quiz non trouvé' });
  }

  await prisma.quiz.delete({
    where: { id },
  });

  res.json({ message: 'Quiz supprimé' });
};

export const addQuestion = async (req: AuthRequest, res: Response) => {
  const { quizId } = req.params;
  const { type, content, audioUrl, imageUrl, choices, correctIndex, timeLimit, points } = req.body;

  // Vérifier que le quiz appartient à l'utilisateur
  const quiz = await prisma.quiz.findFirst({
    where: {
      id: quizId,
      userId: req.user!.userId,
    },
    include: {
      questions: true,
    },
  });

  if (!quiz) {
    return res.status(404).json({ error: 'Quiz non trouvé' });
  }

  const question = await prisma.question.create({
    data: {
      quizId,
      order: quiz.questions.length + 1,
      type,
      content,
      audioUrl,
      imageUrl,
      choices,
      correctIndex,
      timeLimit,
      points,
    },
  });

  res.status(201).json({ question });
};

export const updateQuestion = async (req: AuthRequest, res: Response) => {
  const { quizId, id } = req.params;
  const { type, content, audioUrl, imageUrl, choices, correctIndex, timeLimit, points, order } = req.body;

  // Vérifier que le quiz appartient à l'utilisateur
  const quiz = await prisma.quiz.findFirst({
    where: {
      id: quizId,
      userId: req.user!.userId,
    },
  });

  if (!quiz) {
    return res.status(404).json({ error: 'Quiz non trouvé' });
  }

  const question = await prisma.question.update({
    where: { id },
    data: {
      type,
      content,
      audioUrl,
      imageUrl,
      choices,
      correctIndex,
      timeLimit,
      points,
      order,
    },
  });

  res.json({ question });
};

export const deleteQuestion = async (req: AuthRequest, res: Response) => {
  const { quizId, id } = req.params;

  // Vérifier que le quiz appartient à l'utilisateur
  const quiz = await prisma.quiz.findFirst({
    where: {
      id: quizId,
      userId: req.user!.userId,
    },
  });

  if (!quiz) {
    return res.status(404).json({ error: 'Quiz non trouvé' });
  }

  await prisma.question.delete({
    where: { id },
  });

  res.json({ message: 'Question supprimée' });
};
