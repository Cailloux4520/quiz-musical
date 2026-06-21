import React from 'react';

interface AnswerButtonProps {
  label: string; // A, B, C, D
  text: string;
  onClick: () => void;
  disabled?: boolean;
  isSelected?: boolean;
  isCorrect?: boolean;
  showResult?: boolean;
}

// Couleurs Kahoot-style
const BUTTON_COLORS = {
  A: {
    bg: 'bg-red-500',
    hover: 'hover:bg-red-600',
    selected: 'ring-4 ring-red-700',
    text: 'text-white',
  },
  B: {
    bg: 'bg-blue-500',
    hover: 'hover:bg-blue-600',
    selected: 'ring-4 ring-blue-700',
    text: 'text-white',
  },
  C: {
    bg: 'bg-yellow-500',
    hover: 'hover:bg-yellow-600',
    selected: 'ring-4 ring-yellow-700',
    text: 'text-white',
  },
  D: {
    bg: 'bg-green-500',
    hover: 'hover:bg-green-600',
    selected: 'ring-4 ring-green-700',
    text: 'text-white',
  },
};

export const AnswerButton: React.FC<AnswerButtonProps> = ({
  label,
  text,
  onClick,
  disabled = false,
  isSelected = false,
  isCorrect,
  showResult = false,
}) => {
  const colorScheme = BUTTON_COLORS[label as keyof typeof BUTTON_COLORS] || BUTTON_COLORS.A;

  // Si on affiche les résultats
  const getResultClass = () => {
    if (!showResult) return '';
    if (isCorrect) return 'ring-4 ring-green-700 bg-green-600';
    if (isSelected && !isCorrect) return 'ring-4 ring-red-700 bg-red-600 opacity-50';
    return 'opacity-50';
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-full h-24 md:h-32 rounded-2xl
        flex flex-col items-center justify-center
        transition-all duration-200 transform
        ${colorScheme.bg} ${colorScheme.text}
        ${!disabled && !showResult ? colorScheme.hover : ''}
        ${!disabled && !showResult ? 'active:scale-95' : ''}
        ${isSelected && !showResult ? colorScheme.selected : ''}
        ${showResult ? getResultClass() : ''}
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        shadow-lg font-bold
      `}
    >
      {/* Label (A, B, C, D) */}
      <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
        <span className="text-lg font-black">{label}</span>
      </div>

      {/* Texte de la réponse */}
      <div className="px-12 py-4 text-center">
        <span className="text-sm md:text-base line-clamp-2">{text}</span>
      </div>

      {/* Icône de résultat */}
      {showResult && isCorrect && (
        <div className="absolute top-2 right-2">
          <svg
            className="w-8 h-8 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      {showResult && isSelected && !isCorrect && (
        <div className="absolute top-2 right-2">
          <svg
            className="w-8 h-8 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </button>
  );
};
