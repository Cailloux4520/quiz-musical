import React from 'react';
import { Users, User } from 'lucide-react';

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

interface WaitingRoomProps {
  players: Player[];
  teams: Team[];
  code: string;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({
  players,
  teams,
  code,
}) => {
  const soloPlayers = players.filter((p) => !p.teamId);

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="animate-bounce mb-4">
          <p className="text-6xl">⏳</p>
        </div>
        <p className="text-2xl font-bold mb-2">En attente du démarrage...</p>
        <p className="text-gray-600 dark:text-gray-400">
          Le maître du jeu va bientôt lancer la partie
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-purple-100 dark:bg-purple-900/20 p-4 rounded-lg text-center">
          <User className="w-8 h-8 mx-auto mb-2 text-purple-600" />
          <p className="text-3xl font-bold">{players.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Joueurs</p>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-lg text-center">
          <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
          <p className="text-3xl font-bold">{teams.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Équipes</p>
        </div>
      </div>

      {/* Liste des équipes */}
      {teams.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Équipes ({teams.length})
          </h3>
          <div className="space-y-3">
            {teams.map((team) => (
              <div
                key={team.id}
                className="p-4 rounded-lg border-2 dark:border-gray-700"
                style={{
                  borderColor: team.color,
                  backgroundColor: `${team.color}15`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: team.color }}
                    />
                    <span className="font-bold text-lg">{team.name}</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {team.players.length} joueur{team.players.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {team.players.map((player) => (
                    <div
                      key={player.id}
                      className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-sm font-medium"
                      style={{ borderLeft: `3px solid ${team.color}` }}
                    >
                      {player.nickname}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Joueurs solo */}
      {soloPlayers.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <User className="w-5 h-5" />
            Joueurs individuels ({soloPlayers.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {soloPlayers.map((player) => (
              <div
                key={player.id}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-center font-medium"
              >
                {player.nickname}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code de session */}
      <div className="text-center pt-6 border-t dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          Code de session
        </p>
        <p className="text-3xl font-mono font-bold tracking-wider">{code}</p>
      </div>
    </div>
  );
};
