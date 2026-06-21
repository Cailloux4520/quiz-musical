import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import api from '../services/api';

// Thèmes disponibles avec icônes et fonds d'écran
const THEMES = [
  { 
    id: 'annees80', 
    name: 'Années 80', 
    icon: '📼', 
    color: 'from-pink-500 to-purple-500',
    image: 'https://images.unsplash.com/photo-1563784462041-5f97ac9523dd?w=400&h=300&fit=crop&q=80'
  },
  { 
    id: 'annees90', 
    name: 'Années 90', 
    icon: '💿', 
    color: 'from-cyan-500 to-blue-500',
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=300&fit=crop&q=80'
  },
  { 
    id: 'annees2000', 
    name: 'Années 2000', 
    icon: '📱', 
    color: 'from-blue-500 to-indigo-500',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=300&fit=crop&q=80'
  },
  { 
    id: 'jeuxvideo', 
    name: 'Jeux Vidéo', 
    icon: '🎮', 
    color: 'from-green-500 to-emerald-500',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop&q=80'
  },
  { 
    id: 'cinema', 
    name: 'Cinéma', 
    icon: '🎬', 
    color: 'from-red-500 to-orange-500',
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=300&fit=crop&q=80'
  },
  { 
    id: 'series', 
    name: 'Séries TV', 
    icon: '📺', 
    color: 'from-purple-500 to-pink-500',
    image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&h=300&fit=crop&q=80'
  },
  { 
    id: 'manga', 
    name: 'Manga/Anime', 
    icon: '🎌', 
    color: 'from-red-500 to-pink-500',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&h=300&fit=crop&q=80'
  },
  { 
    id: 'sport', 
    name: 'Sport', 
    icon: '⚽', 
    color: 'from-green-600 to-teal-600',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop&q=80'
  },
];

export const QuizForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    theme: 'annees80',
  });

  useEffect(() => {
    if (isEdit) {
      loadQuiz();
    }
  }, [id]);

  const loadQuiz = async () => {
    try {
      const response = await api.get(`/quiz/${id}`);
      const quiz = response.data.quiz;
      setFormData({
        title: quiz.title,
        description: quiz.description || '',
        theme: quiz.theme,
      });
    } catch (error) {
      console.error('Erreur chargement quiz:', error);
      alert('Erreur lors du chargement du quiz');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/quiz/${id}`, formData);
        alert('Quiz modifié avec succès !');
      } else {
        await api.post('/quiz', formData);
        alert('Quiz créé avec succès !');
      }
      navigate('/admin');
    } catch (error: any) {
      console.error('Erreur:', error);
      alert(error.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">
              {isEdit ? 'Modifier le quiz' : 'Créer un quiz'}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Titre du quiz"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Quiz Rock des années 80"
              required
            />

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du quiz (optionnel)"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Thème du Quiz</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, theme: theme.id })}
                    className={`
                      relative overflow-hidden rounded-xl border-2 transition-all duration-200
                      ${formData.theme === theme.id
                        ? 'border-blue-500 ring-4 ring-blue-200 dark:ring-blue-800 scale-105'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:scale-102'
                      }
                    `}
                  >
                    {/* En-tête avec titre et icône */}
                    <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 px-3 py-3 z-10">
                      <div className="flex items-center gap-2 justify-center">
                        <span className="text-2xl">{theme.icon}</span>
                        <span className="text-sm font-bold text-white">
                          {theme.name}
                        </span>
                      </div>
                    </div>
                    
                    {/* Image de fond thématique */}
                    <div className="relative h-32 overflow-hidden">
                      <img 
                        src={theme.image} 
                        alt={theme.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay gradient pour améliorer la lisibilité */}
                      <div className={`
                        absolute inset-0 bg-gradient-to-br ${theme.color} opacity-30
                        ${formData.theme === theme.id ? 'opacity-40' : ''}
                      `} />
                    </div>
                    
                    {/* Checkmark de sélection */}
                    {formData.theme === theme.id && (
                      <div className="absolute top-2 right-2 z-20">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Créer'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/admin')}
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </form>

          {isEdit && (
            <div className="mt-6 pt-6 border-t dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Pour ajouter des questions à ce quiz, utilisez l'API ou créez une interface d'édition de questions.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
