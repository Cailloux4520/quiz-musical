// Setup global pour les tests Jest
// Ajouter ici des configurations globales si nécessaire

// Mock console.log/warn/error pour les tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
