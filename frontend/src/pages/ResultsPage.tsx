import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Leaderboard } from '../components/game/Leaderboard';
import { Podium3D } from '../components/game/Podium3D';
import { socket } from '../services/socket';
import { useVictorySound } from '../hooks/useVictorySound';
import { Trophy, Download, Home, Sparkles, Users, BarChart3 } from 'lucide-react';

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

interface SessionStats {
  totalPlayers: number;
  totalQuestions: number;
  totalAnswers: number;
  correctAnswers: number;
  correctPercentage: number;
  avgScore: number;
}

interface SessionResults {
  players: Player[];
  teams: Team[];
  top3Players: Player[];
  top3Teams: Team[];
  stats: SessionStats;
  sessionId: string;
  quizTitle: string;
}

export const ResultsPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<SessionResults | null>(null);
  const [showTeams, setShowTeams] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confettiLaunched, setConfettiLaunched] = useState(false);
  const { playVictorySound } = useVictorySound();

  // Lancer les confettis
  const launchConfetti = () => {
    // Jouer le son de victoire
    playVictorySound();

    // Vérifier si canvas-confetti est disponible
    // @ts-ignore
    if (typeof confetti !== 'undefined') {
      // Confettis dorés
      // @ts-ignore
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF8C00'],
      });

      // Confettis latéraux
      setTimeout(() => {
        // @ts-ignore
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#9333ea', '#ec4899', '#3b82f6'],
        });
        // @ts-ignore
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#9333ea', '#ec4899', '#3b82f6'],
        });
      }, 200);

      // Pluie de confettis finale
      setTimeout(() => {
        // @ts-ignore
        confetti({
          particleCount: 200,
          spread: 180,
          origin: { y: 0.3 },
          colors: ['#FFD700', '#FFA500', '#FF8C00', '#9333ea', '#ec4899'],
        });
      }, 400);
    }
  };

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
      console.log('Résultats reçus:', data);
      setResults(data);
      setLoading(false);
      
      // Lancer les confettis après 500ms (une seule fois au chargement)
      if (!confettiLaunched) {
        setTimeout(() => {
          setConfettiLaunched(true);
          launchConfetti();
        }, 500);
      }
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

  const topPlayer = results.top3Players[0];
  const topTeam = results.top3Teams.length > 0 ? results.top3Teams[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 p-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header avec sparkles */}
        <Card className="text-center bg-white/95 backdrop-blur">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-12 h-12 text-yellow-500 animate-pulse" />
            <Trophy className="w-16 h-16 text-yellow-500" />
            <Sparkles className="w-12 h-12 text-yellow-500 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            🎉 Résultats Finaux 🎉
          </h1>
          {results.quizTitle && (
            <p className="text-xl md:text-2xl font-bold text-gray-700 dark:text-gray-300">
              {results.quizTitle}
            </p>
          )}
        </Card>

        {/* Statistiques de session */}
        {results.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center bg-white/95 backdrop-blur">
              <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="text-3xl font-bold text-purple-600">
                {results.stats.totalPlayers}
              </div>
              <p className="text-sm text-gray-600">Joueurs</p>
            </Card>

            <Card className="text-center bg-white/95 backdrop-blur">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-3xl font-bold text-blue-600">
                {results.stats.totalQuestions}
              </div>
              <p className="text-sm text-gray-600">Questions</p>
            </Card>

            <Card className="text-center bg-white/95 backdrop-blur">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-3xl font-bold text-green-600">
                {results.stats.correctPercentage}%
              </div>
              <p className="text-sm text-gray-600">Bonnes réponses</p>
            </Card>

            <Card className="text-center bg-white/95 backdrop-blur">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <div className="text-3xl font-bold text-orange-600">
                {results.stats.avgScore}
              </div>
              <p className="text-sm text-gray-600">Score moyen</p>
            </Card>
          </div>
        )}

        {/* Podium 3D */}
        <Card className="bg-white/95 backdrop-blur">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
              🏆 Podium
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Top 3 {showTeams ? 'Équipes' : 'Joueurs'}
            </p>
          </div>

          <Podium3D
            top3={showTeams ? results.top3Teams : results.top3Players}
            type={showTeams ? 'teams' : 'players'}
          />

          {/* Boutons de basculement */}
          {results.teams.length > 0 && (
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => setShowTeams(false)}
                className={`px-6 py-3 rounded-xl font-bold transition transform hover:scale-105 ${
                  !showTeams
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                👤 Joueurs
              </button>
              <button
                onClick={() => setShowTeams(true)}
                className={`px-6 py-3 rounded-xl font-bold transition transform hover:scale-105 ${
                  showTeams
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                👥 Équipes
              </button>
            </div>
          )}
        </Card>

        {/* Classement complet */}
        <Card className="bg-white/95 backdrop-blur">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            📊 Classement Complet
          </h2>
          <Leaderboard
            players={results.players}
            teams={results.teams}
            showTeams={showTeams}
            maxPlayers={50}
          />
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleDownloadResults}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
          >
            <Download className="w-6 h-6" />
            Télécharger les résultats (CSV)
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-4 rounded-xl font-bold hover:from-gray-700 hover:to-gray-800 transition transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
          >
            <Home className="w-6 h-6" />
            Retour à l'accueil
          </button>
        </div>

        {/* Bouton confettis */}
        <div className="text-center">
          <button
            onClick={launchConfetti}
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-8 py-3 rounded-full font-bold hover:from-yellow-500 hover:to-yellow-700 transition transform hover:scale-110 shadow-lg animate-bounce"
          >
            ✨ Relancer les confettis ! ✨
          </button>
        </div>
      </div>
    </div>
  );
};
