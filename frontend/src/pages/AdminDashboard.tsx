import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useQuizStore } from '../store/quizStore';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import api from '../services/api';
import logoSvg from '../assets/logo.svg';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { quizzes, setQuizzes, deleteQuiz } = useQuizStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const response = await api.get('/quiz');
      setQuizzes(response.data.quizzes);
    } catch (error) {
      console.error('Erreur chargement quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?')) return;

    try {
      await api.delete(`/quiz/${id}`);
      deleteQuiz(id);
    } catch (error) {
      console.error('Erreur suppression quiz:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoSvg} alt="MyQuiz Logo" className="w-8 h-8" />
              <h1 className="text-2xl font-bold">MyQuiz</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user?.name}
              </span>
              <Button variant="secondary" onClick={handleLogout}>
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Mes Quiz</h2>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/admin/dashboard')}>
              📊 Statistiques
            </Button>
            <Button variant="secondary" onClick={() => navigate('/admin/media')}>
              📁 Médiathèque
            </Button>
            <Button variant="secondary" onClick={() => navigate('/admin/themes')}>
              🎨 Thèmes
            </Button>
            <Button onClick={() => navigate('/admin/quiz/new')}>
              + Nouveau Quiz
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : quizzes.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Vous n'avez pas encore créé de quiz
              </p>
              <Button onClick={() => navigate('/admin/quiz/new')}>
                Créer mon premier quiz
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <Card key={quiz.id}>
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{quiz.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {quiz.description || 'Pas de description'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded">
                        {quiz.theme}
                      </span>
                      <span>•</span>
                      <span>{quiz.questionsCount} questions</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      className="flex-1"
                      onClick={() => navigate(`/admin/quiz/${quiz.id}`)}
                    >
                      Éditer
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => navigate(`/admin/session/new/${quiz.id}`)}
                    >
                      Lancer
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteQuiz(quiz.id)}
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
