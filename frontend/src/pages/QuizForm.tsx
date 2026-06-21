import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import api from '../services/api';

// Thèmes disponibles avec icônes
const THEMES = [
  { id: 'pop', name: 'Pop', icon: '🎤', color: 'from-pink-500 to-purple-500' },
  { id: 'rock', name: 'Rock', icon: '🎸', color: 'from-red-500 to-orange-500' },
  { id: 'jazz', name: 'Jazz', icon: '🎷', color: 'from-blue-500 to-indigo-500' },
  { id: 'classique', name: 'Classique', icon: '🎻', color: 'from-amber-500 to-yellow-500' },
  { id: 'rap', name: 'Rap', icon: '🎧', color: 'from-gray-700 to-gray-900' },
  { id: 'electro', name: 'Électro', icon: '🎹', color: 'from-cyan-500 to-blue-500' },
  { id: 'variete', name: 'Variété française', icon: '🎵', color: 'from-green-500 to-teal-500' },
  { id: 'autres', name: 'Autres', icon: '🎶', color: 'from-purple-500 to-pink-500' },
];

export const QuizForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    theme: 'pop',
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
              <label className="block text-sm font-medium mb-3">Thème Musical</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, theme: theme.id })}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all duration-200
                      ${formData.theme === theme.id
                        ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800 scale-105'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }
                    `}
                  >
                    <div className={`
                      absolute inset-0 rounded-xl bg-gradient-to-br ${theme.color} opacity-10
                      ${formData.theme === theme.id ? 'opacity-20' : ''}
                    `} />
                    <div className="relative flex flex-col items-center gap-2">
                      <span className="text-4xl">{theme.icon}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {theme.name}
                      </span>
                    </div>
                    {formData.theme === theme.id && (
                      <div className="absolute top-2 right-2">
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
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
