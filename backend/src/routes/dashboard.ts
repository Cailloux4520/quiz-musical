import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

// GET /api/dashboard/stats - Récupérer les statistiques du dashboard
router.get('/stats', getDashboardStats);

export default router;
