import { Router } from 'express';
import {
  createSession,
  getSessionByCode,
  deleteSession,
} from '../controllers/sessionController';
import {
  exportSessionToExcel,
  exportSessionToCSV,
  exportSessionToPDF,
} from '../controllers/exportController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Créer et supprimer une session nécessite l'authentification
router.post('/', authMiddleware, createSession);
router.delete('/:id', authMiddleware, deleteSession);

// Exports de résultats (nécessite authentification)
router.get('/:id/export/excel', authMiddleware, exportSessionToExcel);
router.get('/:id/export/csv', authMiddleware, exportSessionToCSV);
router.get('/:id/export/pdf', authMiddleware, exportSessionToPDF);

// Récupérer une session par code (pour les joueurs) ne nécessite pas d'auth
router.get('/:inviteCode', getSessionByCode);

export default router;
