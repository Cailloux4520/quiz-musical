import { parseBuffer } from 'music-metadata';

/**
 * Extrait la durée d'un fichier audio (en secondes)
 * @param buffer Buffer du fichier audio
 * @returns Durée en secondes (arrondie)
 */
export async function getAudioDuration(buffer: Buffer): Promise<number> {
  try {
    const metadata = await parseBuffer(buffer, { mimeType: 'audio/mpeg' });
    
    if (metadata.format.duration) {
      return Math.round(metadata.format.duration);
    }
    
    return 0;
  } catch (error) {
    console.error('Erreur extraction durée audio:', error);
    return 0;
  }
}
