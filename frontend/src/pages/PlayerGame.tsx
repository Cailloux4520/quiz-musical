import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { WaitingRoom } from '../components/game/WaitingRoom';
import { socket } from '../services/socket';

interface Player {
  id: string;
  nickname: string;
  score: number;
  teamId?: string | null;
}

interface Team {
  id: string;
  name: string;
  color: string;
  score: number;
  players: Player[];
}

export const PlayerGame: React.FC = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  const nickname = location.state?.nickname;
  const sessionId = location.state?.sessionId;
  const teamId = location.state?.teamId;

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
      teamId: teamId || undefined,
    });

    socket.on('player:joined', (data: { player: Player }) => {
      setConnected(true);
      // Demander la liste des équipes
      socket.emit('teams:get', { sessionId });
    });

    socket.on('player:new', (data: { player: Player }) => {
      setPlayers((prev) => [...prev, data.player]);
    });

    socket.on('teams:list', (data: { teams: Team[] }) => {
      setTeams(data.teams);
      // Reconstruire la liste des joueurs à partir des équipes et des joueurs solo
      const allPlayers: Player[] = [];
      data.teams.forEach((team) => {
        allPlayers.push(...team.players);
      });
      setPlayers(allPlayers);
    });

    socket.on('team:created', (data: { team: Team }) => {
      setTeams((prev) => [...prev, data.team]);
    });

    socket.on('team:updated', (data: { team: Team }) => {
      setTeams((prev) => {
        const index = prev.findIndex((t) => t.id === data.team.id);
        if (index >= 0) {
          const newTeams = [...prev];
          newTeams[index] = data.team;
          return newTeams;
        }
        return prev;
      });
    });

    socket.on('game:state', (state: any) => {
      setGameState(state);
    });

    return () => {
      socket.off('player:joined');
      socket.off('player:new');
      socket.off('teams:list');
      socket.off('team:created');
      socket.off('team:updated');
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
        </Card>

        <Card>
          {gameState?.status === 'waiting' || !gameState ? (
            <WaitingRoom
              players={players}
              teams={teams}
              code={inviteCode || ''}
            />
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
