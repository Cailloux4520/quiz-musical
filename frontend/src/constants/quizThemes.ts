export interface QuizTheme {
  id: string;
  name: string;
  icon: string;
  gradient: string;
  backgroundImage?: string;
  description: string;
}

export const QUIZ_THEMES: QuizTheme[] = [
  {
    id: 'musique',
    name: 'Musique',
    icon: '🎵',
    gradient: 'from-purple-600 via-pink-600 to-red-600',
    backgroundImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1920',
    description: 'Quiz sur la musique, artistes, albums et chansons'
  },
  {
    id: 'histoire',
    name: 'Histoire',
    icon: '📜',
    gradient: 'from-amber-600 via-orange-600 to-red-700',
    backgroundImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=1920',
    description: 'Quiz sur les événements historiques et personnages célèbres'
  },
  {
    id: 'geographie',
    name: 'Géographie',
    icon: '🌍',
    gradient: 'from-green-600 via-teal-600 to-blue-600',
    backgroundImage: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1920',
    description: 'Quiz sur les pays, capitales, drapeaux et géographie mondiale'
  },
  {
    id: 'culture_generale',
    name: 'Culture Générale',
    icon: '📚',
    gradient: 'from-indigo-600 via-purple-600 to-pink-600',
    backgroundImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920',
    description: 'Quiz de culture générale sur tous les sujets'
  },
  {
    id: 'cinema',
    name: 'Cinéma',
    icon: '🎬',
    gradient: 'from-red-600 via-rose-600 to-pink-600',
    backgroundImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920',
    description: 'Quiz sur les films, acteurs et réalisateurs'
  },
  {
    id: 'series_tv',
    name: 'Séries TV',
    icon: '📺',
    gradient: 'from-blue-600 via-cyan-600 to-teal-600',
    backgroundImage: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=1920',
    description: 'Quiz sur les séries télé et leurs personnages'
  },
  {
    id: 'anime_manga',
    name: 'Animé/Manga',
    icon: '🎌',
    gradient: 'from-pink-600 via-purple-600 to-indigo-600',
    backgroundImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920',
    description: 'Quiz sur les animés japonais et mangas'
  }
];

export const getThemeById = (id: string): QuizTheme | undefined => {
  return QUIZ_THEMES.find(theme => theme.id === id);
};

export const getThemeGradient = (themeId: string): string => {
  const theme = getThemeById(themeId);
  return theme?.gradient || 'from-indigo-600 via-purple-600 to-pink-600';
};

export const getThemeBackground = (themeId: string): string | undefined => {
  const theme = getThemeById(themeId);
  return theme?.backgroundImage;
};
