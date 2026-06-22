import React from 'react';
import { ThemeConfig } from '../../types/theme';
import { Trophy, Star, CheckCircle, XCircle } from 'lucide-react';

interface ThemePreviewProps {
  theme: ThemeConfig;
}

export const ThemePreview: React.FC<ThemePreviewProps> = ({ theme }) => {
  const themeStyles = {
    '--primary': theme.primaryColor,
    '--secondary': theme.secondaryColor,
    '--accent': theme.accentColor,
    '--bg': theme.backgroundColor,
    '--text': theme.textColor,
    '--success': theme.successColor,
    '--error': theme.errorColor,
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSize === 'sm' ? '14px' : theme.fontSize === 'lg' ? '18px' : '16px',
  } as React.CSSProperties;

  return (
    <div 
      className="border rounded-lg p-6 shadow-lg"
      style={{
        ...themeStyles,
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
      }}
    >
      <h3 className="text-2xl font-bold mb-4" style={{ color: theme.primaryColor }}>
        Prévisualisation du Thème
      </h3>
      
      {/* Boutons */}
      <div className="space-y-3 mb-6">
        <button 
          className="px-6 py-3 rounded-lg font-semibold w-full"
          style={{ 
            backgroundColor: theme.primaryColor,
            color: '#fff'
          }}
        >
          Bouton Principal
        </button>
        <button 
          className="px-6 py-3 rounded-lg font-semibold w-full"
          style={{ 
            backgroundColor: theme.secondaryColor,
            color: '#fff'
          }}
        >
          Bouton Secondaire
        </button>
      </div>

      {/* Question simulée */}
      <div 
        className="p-4 rounded-lg mb-4"
        style={{ 
          backgroundColor: theme.accentColor + '20',
          borderLeft: `4px solid ${theme.accentColor}`
        }}
      >
        <p className="font-semibold mb-2">Question: Quel artiste a chanté "Thriller" ?</p>
        <div className="space-y-2">
          {['Michael Jackson', 'Prince', 'Madonna', 'Whitney Houston'].map((option, i) => (
            <div 
              key={i}
              className="p-2 rounded cursor-pointer hover:opacity-80"
              style={{ 
                backgroundColor: i === 0 ? theme.primaryColor + '30' : 'transparent',
                border: `1px solid ${theme.textColor}40`
              }}
            >
              {option}
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-2 mb-4">
        <div 
          className="flex items-center gap-2 p-3 rounded-lg"
          style={{ backgroundColor: theme.successColor + '20' }}
        >
          <CheckCircle size={20} style={{ color: theme.successColor }} />
          <span style={{ color: theme.successColor }}>Réponse correcte !</span>
        </div>
        <div 
          className="flex items-center gap-2 p-3 rounded-lg"
          style={{ backgroundColor: theme.errorColor + '20' }}
        >
          <XCircle size={20} style={{ color: theme.errorColor }} />
          <span style={{ color: theme.errorColor }}>Mauvaise réponse</span>
        </div>
      </div>

      {/* Podium simulé */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { rank: 2, name: 'Joueur 2', score: 850 },
          { rank: 1, name: 'Joueur 1', score: 950 },
          { rank: 3, name: 'Joueur 3', score: 750 },
        ].map((player, i) => (
          <div 
            key={i}
            className="p-3 rounded-lg"
            style={{ 
              backgroundColor: player.rank === 1 ? theme.primaryColor + '30' : theme.backgroundColor,
              border: `2px solid ${player.rank === 1 ? theme.primaryColor : theme.textColor}40`
            }}
          >
            {player.rank === 1 && <Trophy className="mx-auto mb-1" style={{ color: theme.primaryColor }} size={24} />}
            {player.rank === 2 && <Star className="mx-auto mb-1" style={{ color: theme.secondaryColor }} size={20} />}
            <div className="font-bold">{player.name}</div>
            <div style={{ color: theme.accentColor }}>{player.score} pts</div>
          </div>
        ))}
      </div>
    </div>
  );
};
