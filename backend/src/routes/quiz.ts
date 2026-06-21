import { Router } from 'express';
import multer from 'multer';
import {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  importQuestionsFromExcel,
  exportQuestionsToExcel,
} from '../controllers/quizController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

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

// Routes pour l'import/export Excel
router.post('/:id/import-excel', upload.single('file'), importQuestionsFromExcel);
router.get('/:id/export-excel', exportQuestionsToExcel);

export default router;
