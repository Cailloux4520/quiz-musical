import { Response } from 'express';
import QRCode from 'qrcode';
import prisma from '../utils/prisma';
import { generateInviteCode } from '../utils/inviteCode';
import { AuthRequest } from '../middleware/auth';

export const createSession = async (req: AuthRequest, res: Response) => {
  const { quizId } = req.body;

  // Vérifier que le quiz existe et appartient à l'utilisateur
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

  if (quiz.questions.length === 0) {
    return res.status(400).json({ error: 'Le quiz doit contenir au moins une question' });
  }

  // Générer un code d'invitation unique
  let inviteCode: string;
  let isUnique = false;

  while (!isUnique) {
    inviteCode = generateInviteCode();
    const existing = await prisma.session.findUnique({
      where: { inviteCode },
    });
    if (!existing) {
      isUnique = true;
    }
  }

  // Créer la session
  const session = await prisma.session.create({
    data: {
      quizId,
      inviteCode: inviteCode!,
      status: 'waiting',
    },
  });

  // Générer le QR code
  const joinUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join/${session.inviteCode}`;
  const qrCodeDataUrl = await QRCode.toDataURL(joinUrl);

  res.status(201).json({
    session: {
      id: session.id,
      inviteCode: session.inviteCode,
      status: session.status,
      joinUrl,
      qrCode: qrCodeDataUrl,
    },
  });
};

export const getSessionByCode = async (req: AuthRequest, res: Response) => {
  const { inviteCode } = req.params;

  const session = await prisma.session.findUnique({
    where: { inviteCode },
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
      players: true,
    },
  });

  if (!session) {
    return res.status(404).json({ error: 'Session non trouvée' });
  }

  res.json({ session });
};

export const deleteSession = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const session = await prisma.session.findFirst({
    where: {
      id,
      quiz: {
        userId: req.user!.userId,
      },
    },
  });

  if (!session) {
    return res.status(404).json({ error: 'Session non trouvée' });
  }

  await prisma.session.delete({
    where: { id },
  });

  res.json({ message: 'Session terminée' });
};
