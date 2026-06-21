import * as Minio from 'minio';

// Configuration MinIO
export const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost';
export const MINIO_PORT = parseInt(process.env.MINIO_PORT || '9000', 10);
export const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'minioadmin';
export const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'minioadmin';
export const MINIO_USE_SSL = process.env.MINIO_USE_SSL === 'true';
export const MINIO_BUCKET = process.env.MINIO_BUCKET || 'quiz-musical';

// Client MinIO
export const minioClient = new Minio.Client({
  endPoint: MINIO_ENDPOINT,
  port: MINIO_PORT,
  useSSL: MINIO_USE_SSL,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
});

/**
 * Initialise MinIO et crée le bucket s'il n'existe pas
 */
export async function initializeMinIO() {
  try {
    const exists = await minioClient.bucketExists(MINIO_BUCKET);
    
    if (!exists) {
      await minioClient.makeBucket(MINIO_BUCKET, 'us-east-1');
      console.log(`✅ Bucket MinIO "${MINIO_BUCKET}" créé`);
      
      // Définir politique publique pour lecture
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${MINIO_BUCKET}/*`],
          },
        ],
      };
      
      await minioClient.setBucketPolicy(
        MINIO_BUCKET,
        JSON.stringify(policy)
      );
      console.log(`✅ Politique de lecture publique définie pour "${MINIO_BUCKET}"`);
    } else {
      console.log(`✅ Bucket MinIO "${MINIO_BUCKET}" existe déjà`);
    }
  } catch (error) {
    console.error('❌ Erreur initialisation MinIO:', error);
    throw error;
  }
}

/**
 * Génère une URL signée temporaire pour un objet privé
 * @param filepath Chemin du fichier dans MinIO
 * @param expiry Durée de validité en secondes (défaut: 1h)
 */
export async function getPresignedUrl(filepath: string, expiry: number = 3600): Promise<string> {
  try {
    const url = await minioClient.presignedGetObject(MINIO_BUCKET, filepath, expiry);
    return url;
  } catch (error) {
    console.error('Erreur génération URL signée:', error);
    throw error;
  }
}

/**
 * Upload un buffer vers MinIO
 * @param filepath Chemin destination
 * @param buffer Données à uploader
 * @param metadata Métadonnées optionnelles
 */
export async function uploadBuffer(
  filepath: string,
  buffer: Buffer,
  metadata?: Record<string, string>
): Promise<void> {
  await minioClient.putObject(MINIO_BUCKET, filepath, buffer, buffer.length, metadata);
}

/**
 * Supprime un fichier de MinIO
 * @param filepath Chemin du fichier
 */
export async function deleteFile(filepath: string): Promise<void> {
  await minioClient.removeObject(MINIO_BUCKET, filepath);
}

/**
 * Vérifie si un fichier existe dans MinIO
 * @param filepath Chemin du fichier
 */
export async function fileExists(filepath: string): Promise<boolean> {
  try {
    await minioClient.statObject(MINIO_BUCKET, filepath);
    return true;
  } catch (error) {
    return false;
  }
}
