import { Response } from 'express';
import ExcelJS from 'exceljs';
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

// Import/Export Excel

export const importQuestionsFromExcel = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Vérifier que le quiz appartient à l'utilisateur
  const quiz = await prisma.quiz.findFirst({
    where: {
      id,
      userId: req.user!.userId,
    },
  });

  if (!quiz) {
    return res.status(404).json({ error: 'Quiz non trouvé' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Fichier Excel requis' });
  }

  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      return res.status(400).json({ error: 'Feuille Excel vide' });
    }

    const questions: any[] = [];
    const errors: string[] = [];
    let successCount = 0;

    // Parcourir les lignes (en sautant l'en-tête)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      try {
        const type = row.getCell(1).value?.toString() || '';
        const question = row.getCell(2).value?.toString() || '';
        const option1 = row.getCell(3).value?.toString() || '';
        const option2 = row.getCell(4).value?.toString() || '';
        const option3 = row.getCell(5).value?.toString() || '';
        const option4 = row.getCell(6).value?.toString() || '';
        const correctAnswer = row.getCell(7).value?.toString() || '';
        const acceptedAnswers = row.getCell(8).value?.toString() || '';
        const timeLimit = parseInt(row.getCell(9).value?.toString() || '30');
        const audioUrl = row.getCell(10).value?.toString() || '';
        const imageUrl = row.getCell(11).value?.toString() || '';
        const youtubeUrl = row.getCell(12).value?.toString() || '';
        const startTime = row.getCell(13).value ? parseInt(row.getCell(13).value.toString()) : null;
        const endTime = row.getCell(14).value ? parseInt(row.getCell(14).value.toString()) : null;
        const caseSensitive = row.getCell(15).value?.toString().toLowerCase() === 'oui';
        const showVideoAfterAnswer = row.getCell(16).value?.toString().toLowerCase() === 'oui';

        if (!type || !question) {
          errors.push(`Ligne ${rowNumber}: Type et Question sont obligatoires`);
          return;
        }

        const questionData: any = {
          type,
          content: question,
          timeLimit,
          points: 1000,
          order: rowNumber - 1,
          quizId: id,
        };

        // QCM types
        if (type.includes('qcm')) {
          questionData.choices = [option1, option2, option3, option4];
          questionData.correctIndex = parseInt(correctAnswer) || 0;
        }

        // Free text types
        if (type.includes('free') || type === 'blind_test' || type === 'album_cover') {
          questionData.correctAnswer = correctAnswer;
          questionData.acceptedAnswers = acceptedAnswers ? acceptedAnswers.split('|').map(a => a.trim()) : [];
          questionData.caseSensitive = caseSensitive;
        }

        // Media URLs
        if (audioUrl) questionData.audioUrl = audioUrl;
        if (imageUrl) questionData.imageUrl = imageUrl;
        if (youtubeUrl) questionData.youtubeUrl = youtubeUrl;
        if (startTime !== null) questionData.startTime = startTime;
        if (endTime !== null) questionData.endTime = endTime;
        questionData.showVideoAfterAnswer = showVideoAfterAnswer;

        questions.push(questionData);
        successCount++;
      } catch (error: any) {
        errors.push(`Ligne ${rowNumber}: ${error.message}`);
      }
    });

    // Supprimer anciennes questions et créer les nouvelles
    if (questions.length > 0) {
      await prisma.question.deleteMany({
        where: { quizId: id },
      });

      await prisma.question.createMany({
        data: questions,
      });
    }

    res.json({
      message: 'Import terminé',
      success: successCount,
      errors: errors.length > 0 ? errors : undefined,
      total: successCount + errors.length,
    });
  } catch (error: any) {
    console.error('Erreur import Excel:', error);
    res.status(500).json({ error: 'Erreur lors de l\'import', details: error.message });
  }
};

export const exportQuestionsToExcel = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Vérifier que le quiz appartient à l'utilisateur
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

  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Questions');

    // En-têtes
    worksheet.columns = [
      { header: 'Type', key: 'type', width: 20 },
      { header: 'Question', key: 'question', width: 50 },
      { header: 'Option 1', key: 'option1', width: 30 },
      { header: 'Option 2', key: 'option2', width: 30 },
      { header: 'Option 3', key: 'option3', width: 30 },
      { header: 'Option 4', key: 'option4', width: 30 },
      { header: 'Réponse Correcte', key: 'correctAnswer', width: 20 },
      { header: 'Variantes (séparées par |)', key: 'acceptedAnswers', width: 40 },
      { header: 'Temps (sec)', key: 'timeLimit', width: 15 },
      { header: 'URL Audio', key: 'audioUrl', width: 40 },
      { header: 'URL Image', key: 'imageUrl', width: 40 },
      { header: 'URL YouTube', key: 'youtubeUrl', width: 40 },
      { header: 'Début (sec)', key: 'startTime', width: 15 },
      { header: 'Fin (sec)', key: 'endTime', width: 15 },
      { header: 'Sensible Casse', key: 'caseSensitive', width: 15 },
      { header: 'Montrer Vidéo Après', key: 'showVideoAfterAnswer', width: 20 },
    ];

    // Style de l'en-tête
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };

    // Ajouter les données
    quiz.questions.forEach((q) => {
      worksheet.addRow({
        type: q.type,
        question: q.content,
        option1: q.choices && q.choices[0] ? q.choices[0] : '',
        option2: q.choices && q.choices[1] ? q.choices[1] : '',
        option3: q.choices && q.choices[2] ? q.choices[2] : '',
        option4: q.choices && q.choices[3] ? q.choices[3] : '',
        correctAnswer: q.type.includes('qcm') ? q.correctIndex.toString() : q.correctAnswer || '',
        acceptedAnswers: q.acceptedAnswers && q.acceptedAnswers.length > 0 ? q.acceptedAnswers.join(' | ') : '',
        timeLimit: q.timeLimit,
        audioUrl: q.audioUrl || '',
        imageUrl: q.imageUrl || '',
        youtubeUrl: q.youtubeUrl || '',
        startTime: q.startTime || '',
        endTime: q.endTime || '',
        caseSensitive: q.caseSensitive ? 'Oui' : 'Non',
        showVideoAfterAnswer: q.showVideoAfterAnswer ? 'Oui' : 'Non',
      });
    });

    // Générer le buffer Excel
    const buffer = await workbook.xlsx.writeBuffer();

    // Envoyer le fichier
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${quiz.title.replace(/[^a-z0-9]/gi, '_')}_questions.xlsx"`);
    res.send(buffer);
  } catch (error: any) {
    console.error('Erreur export Excel:', error);
    res.status(500).json({ error: 'Erreur lors de l\'export', details: error.message });
  }
};
