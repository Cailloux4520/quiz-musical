import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { StatCard } from '../components/dashboard/StatCard';
import { SessionsChart } from '../components/dashboard/SessionsChart';
import { QuestionTypesPieChart } from '../components/dashboard/QuestionTypesPieChart';
import {
  BarChart3,
  Users,
  Trophy,
  HelpCircle,
  TrendingUp,
  Calendar,
  HardDrive,
  Play,
  ArrowRight,
} from 'lucide-react';

interface DashboardStats {
  kpi: {
    totalQuiz: number;
    totalSessions: number;
    totalPlayers: number;
    totalQuestions: number;
  };
  topQuiz: Array<{
    id: string;
    title: string;
    sessionsCount: number;
  }>;
  recentSessions: Array<{
    id: string;
    inviteCode: string;
    status: string;
    quizTitle: string;
    playersCount: number;
    createdAt: string;
  }>;
  questionTypes: Array<{
    type: string;
    count: number;
  }>;
  sessionsPerDay: Array<{
    date: string;
    count: number;
  }>;
  storage: {
    mediaCount: number;
    estimatedMB: number;
    estimatedGB: string;
  };
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      waiting: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      finished: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    const labels = {
      waiting: 'En attente',
      active: 'En cours',
      finished: 'Terminé',
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles] || styles.waiting
        }`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Chargement des statistiques...
          </p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <TrendingUp className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-xl font-bold mb-2">Erreur</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error || 'Impossible de charger les statistiques'}
            </p>
            <button
              onClick={() => fetchDashboardStats()}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700"
            >
              Réessayer
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              📊 Tableau de bord
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Vue d'ensemble de vos quiz et sessions
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/quiz/new')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition shadow-lg flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            Nouveau Quiz
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Quiz créés"
            value={stats.kpi.totalQuiz}
            icon={BarChart3}
            color="purple"
          />
          <StatCard
            title="Sessions lancées"
            value={stats.kpi.totalSessions}
            icon={Calendar}
            color="blue"
          />
          <StatCard
            title="Joueurs total"
            value={stats.kpi.totalPlayers}
            icon={Users}
            color="green"
          />
          <StatCard
            title="Questions créées"
            value={stats.kpi.totalQuestions}
            icon={HelpCircle}
            color="orange"
          />
        </div>

        {/* Graphique sessions par jour */}
        <Card>
          <SessionsChart data={stats.sessionsPerDay} />
        </Card>

        {/* Graphiques et listes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart types de questions */}
          <Card>
            <QuestionTypesPieChart data={stats.questionTypes} />
          </Card>

          {/* Stockage */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Stockage utilisé
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <HardDrive className="w-12 h-12 text-purple-600" />
                <div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.storage.estimatedGB} GB
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.storage.mediaCount} fichiers média
                  </div>
                </div>
              </div>
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      (parseFloat(stats.storage.estimatedGB) / 10) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Estimation basée sur {stats.storage.mediaCount} médias (~2 MB chacun)
              </p>
            </div>
          </Card>
        </div>

        {/* Top Quiz */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Top 5 Quiz les plus joués
          </h3>
          {stats.topQuiz.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Aucun quiz créé pour le moment
            </p>
          ) : (
            <div className="space-y-3">
              {stats.topQuiz.map((quiz, index) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition cursor-pointer"
                  onClick={() => navigate(`/admin/quiz/${quiz.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0
                          ? 'bg-yellow-500'
                          : index === 1
                          ? 'bg-gray-400'
                          : index === 2
                          ? 'bg-orange-500'
                          : 'bg-purple-500'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {quiz.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {quiz.sessionsCount} session{quiz.sessionsCount > 1 ? 's' : ''}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Sessions récentes */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Sessions récentes
          </h3>
          {stats.recentSessions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Aucune session créée pour le moment
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Quiz
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Code
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Statut
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Joueurs
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentSessions.map((session) => (
                    <tr
                      key={session.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
                      onClick={() => navigate(`/master/${session.id}`)}
                    >
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">
                        {session.quizTitle}
                      </td>
                      <td className="py-3 px-4">
                        <code className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-sm font-mono">
                          {session.inviteCode}
                        </code>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(session.status)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {session.playersCount}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(session.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
