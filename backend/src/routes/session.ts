import { Router } from 'express';
import {
  createSession,
  getSessionByCode,
  deleteSession,
} from '../controllers/sessionController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Créer et supprimer une session nécessite l'authentification
router.post('/', authMiddleware, createSession);
router.delete('/:id', authMiddleware, deleteSession);

// Récupérer une session par code (pour les joueurs) ne nécessite pas d'auth
router.get('/:inviteCode', getSessionByCode);

export default router;
