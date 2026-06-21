import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import api from '../services/api';

export const CreateSession: React.FC = () => {
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  const loadQuiz = async () => {
    try {
      const response = await api.get(`/quiz/${quizId}`);
      setQuiz(response.data.quiz);
    } catch (error) {
      console.error('Erreur chargement quiz:', error);
      alert('Quiz non trouvé');
      navigate('/admin');
    }
  };

  const handleCreateSession = async () => {
    setLoading(true);
    try {
      const response = await api.post('/session', { quizId });
      setSession(response.data.session);
    } catch (error: any) {
      console.error('Erreur création session:', error);
      alert(error.response?.data?.error || 'Erreur lors de la création de la session');
      setLoading(false);
    }
  };

  const handleStartGame = () => {
    if (session) {
      navigate(`/master/${session.id}`);
    }
  };

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">🎵 Lancer une session</h1>
          <h2 className="text-xl mb-6">{quiz.title}</h2>

          {!session ? (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Thème: <span className="font-semibold">{quiz.theme}</span>
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {quiz.description || 'Pas de description'}
              </p>

              <Button onClick={handleCreateSession} disabled={loading} size="lg">
                {loading ? 'Création...' : 'Créer la session'}
              </Button>

              <div className="pt-4">
                <Button variant="secondary" onClick={() => navigate('/admin')}>
                  Retour
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-100 dark:bg-green-900 p-6 rounded-lg">
                <p className="text-lg font-semibold mb-2">Session créée !</p>
                <p className="text-4xl font-bold mb-4">{session.inviteCode}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Les joueurs peuvent rejoindre avec ce code
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                <p className="text-sm mb-2">Lien direct pour les joueurs :</p>
                <code className="text-xs break-all bg-white dark:bg-gray-800 p-2 rounded block">
                  {window.location.origin}/join/{session.inviteCode}
                </code>
              </div>

              <Button onClick={handleStartGame} size="lg">
                Démarrer le jeu
              </Button>

              <div className="pt-4">
                <Button
                  variant="secondary"
                  onClick={() => navigate('/admin')}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
