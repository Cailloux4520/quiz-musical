import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import api from '../services/api';

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
              <label className="block text-sm font-medium mb-2">Thème</label>
              <select
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                required
              >
                <option value="pop">Pop</option>
                <option value="rock">Rock</option>
                <option value="jazz">Jazz</option>
                <option value="classique">Classique</option>
                <option value="rap">Rap</option>
                <option value="electro">Électro</option>
                <option value="variete">Variété française</option>
                <option value="autres">Autres</option>
              </select>
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
