import {
  calculateScore,
  validateResponseTime,
  calculateScoreWithValidation,
} from '../../services/scoreService';

describe('scoreService', () => {
  describe('calculateScore', () => {
    it('devrait retourner le score maximum pour une réponse instantanée', () => {
      const score = calculateScore(1000, 0, 30);
      expect(score).toBe(1000);
    });

    it('devrait retourner le score minimum (10%) pour une réponse à la dernière seconde', () => {
      const score = calculateScore(1000, 30000, 30);
      expect(score).toBe(100); // 10% de 1000
    });

    it('devrait retourner environ 50% des points pour une réponse à mi-temps', () => {
      const score = calculateScore(1000, 15000, 30);
      expect(score).toBeGreaterThanOrEqual(450);
      expect(score).toBeLessThanOrEqual(550);
    });

    it('devrait retourner un score décroissant avec le temps', () => {
      const score1s = calculateScore(1000, 1000, 30);
      const score10s = calculateScore(1000, 10000, 30);
      const score20s = calculateScore(1000, 20000, 30);

      expect(score1s).toBeGreaterThan(score10s);
      expect(score10s).toBeGreaterThan(score20s);
    });

    it('devrait gérer différentes valeurs de basePoints', () => {
      const score500 = calculateScore(500, 5000, 30);
      const score1500 = calculateScore(1500, 5000, 30);

      expect(score1500).toBeGreaterThan(score500);
      expect(score1500 / score500).toBeCloseTo(3, 0);
    });

    it('devrait respecter le minimum de 10% même en cas de dépassement', () => {
      const score = calculateScore(1000, 40000, 30);
      expect(score).toBe(100);
    });
  });

  describe('validateResponseTime', () => {
    it('devrait accepter un temps de réponse valide', () => {
      expect(validateResponseTime(5000, 30)).toBe(true);
      expect(validateResponseTime(200, 30)).toBe(true);
      expect(validateResponseTime(29000, 30)).toBe(true);
    });

    it('devrait rejeter un temps négatif', () => {
      expect(validateResponseTime(-100, 30)).toBe(false);
    });

    it('devrait rejeter un temps trop rapide (< 200ms = bot)', () => {
      expect(validateResponseTime(50, 30)).toBe(false);
      expect(validateResponseTime(100, 30)).toBe(false);
      expect(validateResponseTime(199, 30)).toBe(false);
    });

    it('devrait rejeter un temps dépassant la limite + 2s de marge', () => {
      expect(validateResponseTime(33000, 30)).toBe(false); // 33s > 30s + 2s
      expect(validateResponseTime(40000, 30)).toBe(false);
    });

    it('devrait accepter un temps dans la marge de 2 secondes', () => {
      expect(validateResponseTime(31000, 30)).toBe(true); // 31s < 32s
      expect(validateResponseTime(31999, 30)).toBe(true);
    });

    it('devrait gérer différentes durées de questions', () => {
      expect(validateResponseTime(15000, 20)).toBe(true);
      expect(validateResponseTime(45000, 20)).toBe(false);
      expect(validateResponseTime(55000, 60)).toBe(true);
      expect(validateResponseTime(65000, 60)).toBe(false);
    });
  });

  describe('calculateScoreWithValidation', () => {
    it('devrait retourner 0 pour une mauvaise réponse', () => {
      const score = calculateScoreWithValidation(false, 1000, 5000, 30);
      expect(score).toBe(0);
    });

    it('devrait calculer le score normalement pour une bonne réponse avec temps valide', () => {
      const score = calculateScoreWithValidation(true, 1000, 5000, 30);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(1000);
    });

    it('devrait retourner 0 pour une bonne réponse avec temps invalide (trop rapide)', () => {
      const score = calculateScoreWithValidation(true, 1000, 100, 30);
      expect(score).toBe(0);
    });

    it('devrait retourner 0 pour une bonne réponse avec temps invalide (trop lent)', () => {
      const score = calculateScoreWithValidation(true, 1000, 35000, 30);
      expect(score).toBe(0);
    });

    it('devrait retourner 0 pour une bonne réponse avec temps négatif', () => {
      const score = calculateScoreWithValidation(true, 1000, -500, 30);
      expect(score).toBe(0);
    });

    it('devrait prévenir la triche: réponse instantanée impossible', () => {
      const score = calculateScoreWithValidation(true, 1000, 50, 30);
      expect(score).toBe(0);
    });

    it('devrait accepter une réponse juste au-dessus de la limite anti-bot (200ms)', () => {
      const score = calculateScoreWithValidation(true, 1000, 200, 30);
      expect(score).toBeGreaterThan(0);
    });

    it('devrait calculer correctement plusieurs réponses dans le temps', () => {
      const scores = [
        calculateScoreWithValidation(true, 1000, 1000, 30),
        calculateScoreWithValidation(true, 1000, 5000, 30),
        calculateScoreWithValidation(true, 1000, 10000, 30),
        calculateScoreWithValidation(true, 1000, 20000, 30),
        calculateScoreWithValidation(true, 1000, 29000, 30),
      ];

      // Vérifier que les scores sont décroissants
      for (let i = 0; i < scores.length - 1; i++) {
        expect(scores[i]).toBeGreaterThan(scores[i + 1]);
      }
    });

    it('devrait gérer les cas limites de temps', () => {
      // Exactement à la limite
      expect(calculateScoreWithValidation(true, 1000, 30000, 30)).toBeGreaterThan(0);
      
      // Juste après la limite (avec marge)
      expect(calculateScoreWithValidation(true, 1000, 31000, 30)).toBeGreaterThan(0);
      
      // Au-delà de la marge
      expect(calculateScoreWithValidation(true, 1000, 33000, 30)).toBe(0);
    });
  });

  describe('Scénarios réels de jeu', () => {
    it('Scénario 1: Joueur rapide et précis', () => {
      // Question de 30s, réponse en 2s
      const score = calculateScoreWithValidation(true, 1000, 2000, 30);
      expect(score).toBeGreaterThan(900); // > 90% des points
    });

    it('Scénario 2: Joueur moyen', () => {
      // Question de 30s, réponse en 15s
      const score = calculateScoreWithValidation(true, 1000, 15000, 30);
      expect(score).toBeGreaterThan(400);
      expect(score).toBeLessThan(600);
    });

    it('Scénario 3: Joueur lent mais correct', () => {
      // Question de 30s, réponse en 28s
      const score = calculateScoreWithValidation(true, 1000, 28000, 30);
      expect(score).toBe(100); // Score minimum
    });

    it('Scénario 4: Tentative de triche (trop rapide)', () => {
      // Réponse en 50ms = bot
      const score = calculateScoreWithValidation(true, 1000, 50, 30);
      expect(score).toBe(0);
    });

    it('Scénario 5: Mauvaise réponse rapide', () => {
      // Même rapide, mauvaise réponse = 0
      const score = calculateScoreWithValidation(false, 1000, 1000, 30);
      expect(score).toBe(0);
    });

    it('Scénario 6: Questions avec différents timers', () => {
      // Question rapide (20s)
      const score20s = calculateScoreWithValidation(true, 1000, 5000, 20);
      
      // Question standard (30s)
      const score30s = calculateScoreWithValidation(true, 1000, 5000, 30);
      
      // Question longue (60s)
      const score60s = calculateScoreWithValidation(true, 1000, 5000, 60);

      // Plus le timer est long, plus on a de points pour le même temps
      expect(score60s).toBeGreaterThan(score30s);
      expect(score30s).toBeGreaterThan(score20s);
    });

    it('Scénario 7: Égalité de score - départage par temps', () => {
      // Deux joueurs avec même score mais temps différents
      const joueur1 = calculateScoreWithValidation(true, 1000, 3000, 30);
      const joueur2 = calculateScoreWithValidation(true, 1000, 5000, 30);

      expect(joueur1).toBeGreaterThan(joueur2);
    });
  });

  describe('Tests de régression', () => {
    it('ne devrait pas retourner de scores négatifs', () => {
      const scores = [
        calculateScore(1000, 0, 30),
        calculateScore(1000, 15000, 30),
        calculateScore(1000, 30000, 30),
        calculateScore(1000, 50000, 30),
      ];

      scores.forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(0);
      });
    });

    it('ne devrait pas retourner de scores > basePoints', () => {
      const scores = [
        calculateScore(1000, 0, 30),
        calculateScore(1000, 500, 30),
        calculateScore(1000, 1000, 30),
      ];

      scores.forEach((score) => {
        expect(score).toBeLessThanOrEqual(1000);
      });
    });

    it('devrait arrondir les scores (pas de décimales)', () => {
      const scores = [
        calculateScore(1000, 12345, 30),
        calculateScore(1000, 7777, 30),
        calculateScore(1000, 23456, 30),
      ];

      scores.forEach((score) => {
        expect(Number.isInteger(score)).toBe(true);
      });
    });
  });
});
