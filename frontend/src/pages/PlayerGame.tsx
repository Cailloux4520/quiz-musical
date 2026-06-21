import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { socket } from '../services/socket';

export const PlayerGame: React.FC = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<any>(null);

  const nickname = location.state?.nickname;
  const sessionId = location.state?.sessionId;

  useEffect(() => {
    if (!nickname || !sessionId) {
      navigate(`/join/${inviteCode}`);
      return;
    }

    // Connexion socket
    socket.connect();

    socket.emit('player:join', {
      sessionId,
      nickname,
    });

    socket.on('player:joined:success', () => {
      setConnected(true);
    });

    socket.on('game:state', (state: any) => {
      setGameState(state);
    });

    return () => {
      socket.off('player:joined:success');
      socket.off('game:state');
    };
  }, [nickname, sessionId]);

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
        <Card className="text-center">
          <div className="animate-pulse">
            <p className="text-xl font-bold mb-2">Connexion...</p>
            <p className="text-gray-600 dark:text-gray-400">
              En tant que {nickname}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">🎵 Quiz Musical</h1>
          <p className="text-xl">Bienvenue {nickname} !</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Code: {inviteCode}
          </p>
        </Card>

        <Card>
          {gameState?.status === 'waiting' ? (
            <div className="text-center py-12">
              <div className="animate-bounce mb-4">
                <p className="text-6xl">⏳</p>
              </div>
              <p className="text-2xl font-bold mb-2">
                En attente du démarrage...
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Le maître du jeu va bientôt lancer la partie
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Le jeu démarre bientôt !
              </p>
            </div>
          )}
        </Card>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-white hover:underline"
          >
            Quitter la partie
          </button>
        </div>
      </div>
    </div>
  );
};
