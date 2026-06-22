import React from 'react';
import { Trophy, Crown } from 'lucide-react';

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

interface LeaderboardProps {
  players: Player[];
  teams?: Team[];
  showTeams?: boolean;
  highlightPlayerId?: string;
  maxPlayers?: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  players,
  teams = [],
  showTeams = false,
  highlightPlayerId,
  maxPlayers = 10,
}) => {
  const displayedPlayers = players.slice(0, maxPlayers);

  // Couleurs pour le podium
  const getPodiumColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600'; // Or
    if (rank === 2) return 'from-gray-300 to-gray-500'; // Argent
    if (rank === 3) return 'from-orange-400 to-orange-600'; // Bronze
    return 'from-gray-100 to-gray-200';
  };

  const getPodiumIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Trophy className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-6 h-6 text-orange-500" />;
    return null;
  };

  // const getEvolutionIcon = (evolution?: 'up' | 'down' | 'same') => {
  //   if (evolution === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
  //   if (evolution === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
  //   return <Minus className="w-4 h-4 text-gray-400" />;
  // };

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Classement
        </h2>
      </div>

      {/* Onglets Joueurs/Équipes */}
      {teams.length > 0 && (
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => {}}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
              !showTeams
                ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Joueurs
          </button>
          <button
            onClick={() => {}}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
              showTeams
                ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Équipes
          </button>
        </div>
      )}

      {/* Classement Joueurs */}
      {!showTeams && (
        <div className="space-y-2">
          {displayedPlayers.map((player, index) => {
            const isHighlighted = player.id === highlightPlayerId;
            const isPodium = player.rank <= 3;

            return (
              <div
                key={player.id}
                className={`
                  relative overflow-hidden rounded-xl transition-all duration-300
                  ${isPodium ? 'shadow-lg' : 'shadow'}
                  ${isHighlighted ? 'ring-4 ring-purple-500' : ''}
                `}
                style={{
                  animation: `slideIn 0.3s ease-out ${index * 0.05}s both`,
                }}
              >
                {/* Gradient background pour le podium */}
                {isPodium && (
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${getPodiumColor(
                      player.rank
                    )} opacity-20`}
                  />
                )}

                <div className="relative bg-white dark:bg-gray-800 p-4 flex items-center gap-4">
                  {/* Rang */}
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                    {isPodium ? (
                      getPodiumIcon(player.rank)
                    ) : (
                      <div className="text-2xl font-bold text-gray-400">
                        {player.rank}
                      </div>
                    )}
                  </div>

                  {/* Avatar (initiale) */}
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{
                      backgroundColor: player.team?.color || '#9333ea',
                    }}
                  >
                    {player.nickname.charAt(0).toUpperCase()}
                  </div>

                  {/* Info joueur */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 dark:text-white truncate">
                      {player.nickname}
                    </div>
                    {player.team && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {player.team.name}
                      </div>
                    )}
                    <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span className="text-green-600">✓ {player.correctCount}</span>
                      <span className="text-red-600">✗ {player.wrongCount}</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {player.score}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      points
                    </div>
                  </div>

                  {/* Évolution (optionnel) */}
                  {/* <div className="flex-shrink-0">
                    {getEvolutionIcon()}
                  </div> */}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Classement Équipes */}
      {showTeams && teams.length > 0 && (
        <div className="space-y-2">
          {teams.map((team, index) => {
            const isPodium = team.rank <= 3;

            return (
              <div
                key={team.id}
                className={`
                  relative overflow-hidden rounded-xl transition-all duration-300
                  ${isPodium ? 'shadow-lg' : 'shadow'}
                `}
                style={{
                  animation: `slideIn 0.3s ease-out ${index * 0.05}s both`,
                }}
              >
                {/* Gradient background */}
                {isPodium && (
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${getPodiumColor(
                      team.rank
                    )} opacity-20`}
                  />
                )}

                <div className="relative bg-white dark:bg-gray-800 p-4">
                  <div className="flex items-center gap-4 mb-3">
                    {/* Rang */}
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                      {isPodium ? (
                        getPodiumIcon(team.rank)
                      ) : (
                        <div className="text-2xl font-bold text-gray-400">
                          {team.rank}
                        </div>
                      )}
                    </div>

                    {/* Couleur équipe */}
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-full"
                      style={{ backgroundColor: team.color }}
                    />

                    {/* Info équipe */}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xl text-gray-900 dark:text-white truncate">
                        {team.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {team.playerCount} joueur{team.playerCount > 1 ? 's' : ''}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {team.score}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        points
                      </div>
                    </div>
                  </div>

                  {/* Liste joueurs */}
                  <div className="flex flex-wrap gap-2 pl-16">
                    {team.players.map((player) => (
                      <div
                        key={player.id}
                        className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                      >
                        {player.nickname}: {player.score}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Animation CSS */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};
