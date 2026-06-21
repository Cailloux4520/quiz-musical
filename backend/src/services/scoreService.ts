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

/**
 * Valide le temps de réponse pour détecter la triche
 * Retourne true si le temps est valide, false sinon
 */
export const validateResponseTime = (
  responseTime: number,
  timeLimit: number
): boolean => {
  // Le temps ne peut pas être négatif
  if (responseTime < 0) {
    return false;
  }

  // Le temps ne peut pas dépasser le temps limite + 2 secondes de marge
  if (responseTime > (timeLimit * 1000) + 2000) {
    return false;
  }

  // Le temps ne peut pas être trop rapide (moins de 200ms = bot probable)
  if (responseTime < 200) {
    return false;
  }

  return true;
};

/**
 * Calcule les points avec validation anti-triche
 * Retourne 0 si le temps est invalide
 */
export const calculateScoreWithValidation = (
  isCorrect: boolean,
  basePoints: number,
  responseTime: number,
  timeLimit: number
): number => {
  // Si mauvaise réponse, 0 points
  if (!isCorrect) {
    return 0;
  }

  // Valider le temps de réponse
  if (!validateResponseTime(responseTime, timeLimit)) {
    console.warn(`Temps de réponse invalide: ${responseTime}ms (limite: ${timeLimit}s)`);
    return 0;
  }

  return calculateScore(basePoints, responseTime, timeLimit);
};
