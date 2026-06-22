import React, { useEffect } from 'react';
import { Trophy, Crown, Medal } from 'lucide-react';

interface PodiumPlayer {
  rank: number;
  nickname: string;
  score: number;
  team?: {
    name: string;
    color: string;
  } | null;
}

interface Podium3DProps {
  top3: PodiumPlayer[];
  type?: 'players' | 'teams';
}

export const Podium3D: React.FC<Podium3DProps> = ({ top3 }) => {
  const [first, second, third] = top3;

  // Animations d'apparition
  useEffect(() => {
    const podiumElements = document.querySelectorAll('.podium-item');
    podiumElements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('podium-visible');
      }, index * 300);
    });
  }, []);

  const getPodiumHeight = (rank: number) => {
    if (rank === 1) return 'h-64';
    if (rank === 2) return 'h-48';
    if (rank === 3) return 'h-40';
    return 'h-32';
  };

  const getIcon = (rank: number) => {
    if (rank === 1)
      return <Crown className="w-12 h-12 md:w-16 md:h-16 text-yellow-400 animate-bounce" />;
    if (rank === 2)
      return <Medal className="w-10 h-10 md:w-12 md:h-12 text-gray-400" />;
    if (rank === 3)
      return <Medal className="w-10 h-10 md:w-12 md:h-12 text-orange-400" />;
    return <Trophy className="w-8 h-8 text-purple-400" />;
  };

  const getBgGradient = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 via-yellow-500 to-yellow-600';
    if (rank === 2) return 'from-gray-300 via-gray-400 to-gray-500';
    if (rank === 3) return 'from-orange-400 via-orange-500 to-orange-600';
    return 'from-purple-400 to-purple-600';
  };

  const renderPlayer = (player: PodiumPlayer | undefined) => {
    if (!player) return null;

    return (
      <div
        className={`podium-item podium-rank-${player.rank} opacity-0 transform scale-75 transition-all duration-700 ease-out`}
      >
        {/* Icône au-dessus */}
        <div className="flex justify-center mb-4">
          {getIcon(player.rank)}
        </div>

        {/* Carte joueur */}
        <div className="bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl p-4 md:p-6 relative overflow-hidden">
          {/* Gradient background */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${getBgGradient(
              player.rank
            )} opacity-10`}
          />

          {/* Contenu */}
          <div className="relative z-10 text-center">
            {/* Avatar */}
            <div
              className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full flex items-center justify-center text-white font-bold text-2xl md:text-3xl mb-3 shadow-lg"
              style={{
                backgroundColor: player.team?.color || '#9333ea',
              }}
            >
              {player.nickname.charAt(0).toUpperCase()}
            </div>

            {/* Nom */}
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1 truncate">
              {player.nickname}
            </h3>

            {/* Équipe */}
            {player.team && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 truncate">
                {player.team.name}
              </p>
            )}

            {/* Score */}
            <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400">
              {player.score}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">points</p>
          </div>
        </div>

        {/* Socle du podium */}
        <div
          className={`bg-gradient-to-br ${getBgGradient(
            player.rank
          )} ${getPodiumHeight(
            player.rank
          )} flex items-center justify-center rounded-b-2xl shadow-2xl transform perspective-1000`}
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          <div className="text-5xl md:text-7xl font-black text-white opacity-50">
            {player.rank}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="py-8">
      {/* Podium 3D */}
      <div className="flex items-end justify-center gap-4 md:gap-8 max-w-4xl mx-auto">
        {/* 2ème place (gauche) */}
        <div className="flex-1 max-w-xs">
          {second && renderPlayer(second)}
        </div>

        {/* 1ère place (centre, plus haut) */}
        <div className="flex-1 max-w-xs transform scale-110 z-10">
          {first && renderPlayer(first)}
        </div>

        {/* 3ème place (droite) */}
        <div className="flex-1 max-w-xs">
          {third && renderPlayer(third)}
        </div>
      </div>

      {/* CSS personnalisé pour les animations */}
      <style>{`
        .podium-visible {
          opacity: 1 !important;
          transform: scale(1) !important;
        }

        .podium-rank-1 {
          animation: bounceIn 0.8s ease-out 0.6s both, pulse 2s ease-in-out 1.5s infinite;
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(-100px);
          }
          50% {
            transform: scale(1.05) translateY(0);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1.1);
          }
          50% {
            transform: scale(1.15);
          }
        }

        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};
