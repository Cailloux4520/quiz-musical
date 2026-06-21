import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Leaderboard } from '../components/game/Leaderboard';
import { socket } from '../services/socket';
import { Trophy, Download, Home } from 'lucide-react';

interface Player {
  rank: number;
  id: string;
  nickname: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  team?: {
    id: string;
    name: string;
    color: string;
  } | null;
}

interface Team {
  rank: number;
  id: string;
  name: string;
  color: string;
  score: number;
  playerCount: number;
  players: Array<{
    id: string;
    nickname: string;
    score: number;
  }>;
}

interface SessionResults {
  players: Player[];
  teams: Team[];
  sessionId: string;
  quizTitle: string;
}

export const ResultsPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<SessionResults | null>(null);
  const [showTeams, setShowTeams] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
      return;
    }

    // Connexion socket
    socket.connect();

    // Demander les résultats finaux
    socket.emit('session:results', { sessionId });

    socket.on('session:results', (data: SessionResults) => {
      setResults(data);
      setLoading(false);
    });

    return () => {
      socket.off('session:results');
    };
  }, [sessionId, navigate]);

  const handleDownloadResults = () => {
    if (!results) return;

    // Créer un CSV des résultats
    const csvHeader = 'Rang,Pseudo,Score,Bonnes,Mauvaises,Équipe\n';
    const csvRows = results.players
      .map(
        (p) =>
          `${p.rank},"${p.nickname}",${p.score},${p.correctCount},${p.wrongCount},"${
            p.team?.name || 'Solo'
          }"`
      )
      .join('\n');

    const csv = csvHeader + csvRows;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resultats-${results.quizTitle || 'quiz'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4">
        <Card className="text-center">
          <div className="animate-pulse">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <p className="text-xl font-bold">Chargement des résultats...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4">
        <Card className="text-center">
          <p className="text-xl font-bold mb-4">Résultats non disponibles</p>
          <button
            onClick={() => navigate('/')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700"
          >
            Retour à l'accueil
          </button>
        </Card>
      </div>
    );
  }

  const topPlayer = results.players[0];
  const topTeam = results.teams.length > 0 ? results.teams[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="text-center">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            Résultats Finaux
          </h1>
          {results.quizTitle && (
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {results.quizTitle}
            </p>
          )}
        </Card>

        {/* Podium */}
        <Card>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              🏆 Champion
            </h2>
            {topPlayer && (
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
                <div className="text-5xl font-bold mb-2">{topPlayer.nickname}</div>
                <div className="text-3xl font-bold">{topPlayer.score} points</div>
                {topPlayer.team && (
                  <div className="text-lg mt-2 opacity-90">{topPlayer.team.name}</div>
                )}
              </div>
            )}

            {topTeam && (
              <div className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl shadow-lg">
                <div className="text-2xl font-bold mb-1">Équipe gagnante</div>
                <div className="text-3xl font-bold">{topTeam.name}</div>
                <div className="text-xl">{topTeam.score} points</div>
              </div>
            )}
          </div>
        </Card>

        {/* Classement complet */}
        <Card>
          <Leaderboard
            players={results.players}
            teams={results.teams}
            showTeams={showTeams}
            maxPlayers={50}
          />

          {/* Boutons de basculement */}
          {results.teams.length > 0 && (
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => setShowTeams(false)}
                className={`px-6 py-2 rounded-lg font-bold transition ${
                  !showTeams
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Classement Joueurs
              </button>
              <button
                onClick={() => setShowTeams(true)}
                className={`px-6 py-2 rounded-lg font-bold transition ${
                  showTeams
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Classement Équipes
              </button>
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleDownloadResults}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Télécharger les résultats (CSV)
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-700 transition flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
};
