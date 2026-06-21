import { Router } from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth';
import {
  uploadMedia,
  listMedia,
  getMediaById,
  deleteMedia,
} from '../controllers/mediaController';

const router = Router();

// Configuration Multer pour upload fichiers
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB max
  },
  fileFilter: (req, file, cb) => {
    // Formats acceptés
    const allowedAudioFormats = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
    const allowedImageFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedFormats = [...allowedAudioFormats, ...allowedImageFormats];

    if (allowedFormats.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non supporté. Formats acceptés: MP3, WAV, OGG, JPG, PNG, WEBP'));
    }
  },
});

// Routes médiathèque (protégées par auth)
router.post('/upload', authenticateToken, upload.single('file'), uploadMedia);
router.get('/', authenticateToken, listMedia);
router.get('/:id', authenticateToken, getMediaById);
router.delete('/:id', authenticateToken, deleteMedia);

export default router;
