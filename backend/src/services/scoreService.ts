/**
 * Calcule les points gagnés en fonction du temps écoulé
 * Points max: points de base de la question
 * Points min: 100 (10% des points de base)
 * Décroissance linéaire en fonction du temps
 */
export const calculateScore = (
  basePoints: number,
  timeElapsed: number,
  timeLimit: number
): number => {
  const minPoints = Math.floor(basePoints * 0.1); // 10% minimum
  
  if (timeElapsed >= timeLimit * 1000) {
    return minPoints;
  }
  
  // Calcul linéaire décroissant
  const ratio = 1 - (timeElapsed / (timeLimit * 1000));
  const points = Math.floor(basePoints * ratio);
  
  return Math.max(points, minPoints);
};
