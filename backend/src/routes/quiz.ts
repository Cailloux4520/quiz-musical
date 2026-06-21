import { Router } from 'express';
import {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from '../controllers/quizController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

// Routes pour les quiz
router.get('/', getQuizzes);
router.get('/:id', getQuizById);
router.post('/', createQuiz);
router.put('/:id', updateQuiz);
router.delete('/:id', deleteQuiz);

// Routes pour les questions
router.post('/:quizId/question', addQuestion);
router.put('/:quizId/question/:id', updateQuestion);
router.delete('/:quizId/question/:id', deleteQuestion);

export default router;
