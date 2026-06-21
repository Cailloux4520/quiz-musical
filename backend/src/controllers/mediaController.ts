import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { minioClient, MINIO_BUCKET } from '../services/minio';
import { v4 as uuidv4 } from 'uuid';
import { getAudioDuration } from '../utils/audioUtils';

const prisma = new PrismaClient();

/**
 * Upload un fichier média (audio ou image)
 */
export const uploadMedia = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    // Déterminer type (audio ou image)
    const isAudio = file.mimetype.startsWith('audio/');
    const isImage = file.mimetype.startsWith('image/');
    const type = isAudio ? 'audio' : isImage ? 'image' : null;

    if (!type) {
      return res.status(400).json({ error: 'Type de fichier invalide' });
    }

    // Extraire extension
    const extension = file.originalname.split('.').pop()?.toLowerCase() || '';
    const format = extension;

    // Générer nom unique
    const uniqueFilename = `${uuidv4()}.${extension}`;
    const folder = type === 'audio' ? 'audio' : 'images';
    const filepath = `${folder}/${uniqueFilename}`;

    // Upload vers MinIO
    await minioClient.putObject(
      MINIO_BUCKET,
      filepath,
      file.buffer,
      file.size,
      {
        'Content-Type': file.mimetype,
      }
    );

    // Générer URL publique
    const url = `${process.env.MINIO_ENDPOINT}/${MINIO_BUCKET}/${filepath}`;

    // Extraire durée si audio
    let duration: number | null = null;
    if (isAudio) {
      try {
        duration = await getAudioDuration(file.buffer);
      } catch (err) {
        console.warn('Impossible d\'extraire la durée audio:', err);
      }
    }

    // Sauvegarder en BDD
    const media = await prisma.media.create({
      data: {
        filename: file.originalname,
        filepath,
        url,
        type,
        format,
        size: file.size,
        duration,
        userId,
      },
    });

    res.status(201).json({
      message: 'Média uploadé avec succès',
      media,
    });
  } catch (error: any) {
    console.error('Erreur upload média:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload du média' });
  }
};

/**
 * Liste les médias de l'utilisateur avec filtres
 */
export const listMedia = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const {
      type,
      search,
      sort = 'createdAt',
      order = 'desc',
      page = '1',
      limit = '20',
    } = req.query;

    // Construire filtres
    const where: any = { userId };

    if (type && (type === 'audio' || type === 'image')) {
      where.type = type;
    }

    if (search && typeof search === 'string') {
      where.filename = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Tri
    const orderBy: any = {};
    orderBy[sort as string] = order === 'asc' ? 'asc' : 'desc';

    // Récupérer médias
    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.media.count({ where }),
    ]);

    res.json({
      media,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    console.error('Erreur liste médias:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des médias' });
  }
};

/**
 * Récupère les détails d'un média
 */
export const getMediaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const media = await prisma.media.findFirst({
      where: {
        id,
        userId, // Sécurité: uniquement ses médias
      },
    });

    if (!media) {
      return res.status(404).json({ error: 'Média non trouvé' });
    }

    res.json({ media });
  } catch (error: any) {
    console.error('Erreur récupération média:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du média' });
  }
};

/**
 * Supprime un média
 */
export const deleteMedia = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    // Vérifier existence et propriété
    const media = await prisma.media.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!media) {
      return res.status(404).json({ error: 'Média non trouvé' });
    }

    // Supprimer de MinIO
    try {
      await minioClient.removeObject(MINIO_BUCKET, media.filepath);
    } catch (err) {
      console.warn('Erreur suppression MinIO:', err);
      // Continue quand même la suppression BDD
    }

    // Supprimer de la BDD
    await prisma.media.delete({
      where: { id },
    });

    res.json({ message: 'Média supprimé avec succès' });
  } catch (error: any) {
    console.error('Erreur suppression média:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du média' });
  }
};
