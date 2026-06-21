import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import api from '../services/api';
import { socket } from '../services/socket';

export const MasterGame: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
    setupSocketListeners();

    return () => {
      socket.off('player:joined');
      socket.off('player:left');
    };
  }, [sessionId]);

  const loadSession = async () => {
    try {
      const response = await api.get(`/session/${sessionId}`);
      setSession(response.data.session);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement session:', error);
      alert('Session non trouvée');
      navigate('/admin');
    }
  };

  const setupSocketListeners = () => {
    socket.on('player:joined', (data: any) => {
      setPlayers((prev) => [...prev, data.player]);
    });

    socket.on('player:left', (data: any) => {
      setPlayers((prev) => prev.filter((p) => p.id !== data.playerId));
    });
  };

  const handleEndSession = async () => {
    if (confirm('Voulez-vous vraiment terminer cette session ?')) {
      try {
        await api.delete(`/session/${sessionId}`);
        navigate('/admin');
      } catch (error) {
        console.error('Erreur fin session:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🎵 {session?.quiz?.title}</h1>
          <p className="text-xl">Code: {session?.inviteCode}</p>
        </div>

        {/* Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/10 backdrop-blur">
            <div className="text-center">
              <p className="text-3xl font-bold">{players.length}</p>
              <p className="text-sm">Joueurs connectés</p>
            </div>
          </Card>

          <Card className="bg-white/10 backdrop-blur">
            <div className="text-center">
              <p className="text-3xl font-bold">{session?.quiz?.questionsCount || 0}</p>
              <p className="text-sm">Questions</p>
            </div>
          </Card>

          <Card className="bg-white/10 backdrop-blur">
            <div className="text-center">
              <p className="text-3xl font-bold uppercase">{session?.status}</p>
              <p className="text-sm">Statut</p>
            </div>
          </Card>
        </div>

        {/* Players list */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Joueurs en attente
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {players.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 col-span-full text-center py-8">
                En attente de joueurs...
              </p>
            ) : (
              players.map((player) => (
                <div
                  key={player.id}
                  className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg text-center"
                >
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {player.nickname}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Controls */}
        <div className="flex gap-4 justify-center">
          <Button size="lg" disabled>
            Démarrer le quiz (À venir)
          </Button>
          <Button variant="danger" size="lg" onClick={handleEndSession}>
            Terminer la session
          </Button>
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-sm text-white/70">
          <p>Les joueurs peuvent rejoindre en utilisant le code: <span className="font-bold text-white">{session?.inviteCode}</span></p>
          <p className="mt-2">ou en accédant à: {window.location.origin}/join/{session?.inviteCode}</p>
        </div>
      </div>
    </div>
  );
};
