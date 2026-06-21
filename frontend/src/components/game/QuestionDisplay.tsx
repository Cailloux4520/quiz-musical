import React, { useRef, useEffect } from 'react';
import { Volume2, Image as ImageIcon } from 'lucide-react';

interface QuestionDisplayProps {
  question: string;
  questionIndex: number;
  totalQuestions: number;
  audioUrl?: string | null;
  imageUrl?: string | null;
  type: string;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  questionIndex,
  totalQuestions,
  audioUrl,
  imageUrl,
  type,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Auto-play audio si c'est un blind test
  useEffect(() => {
    if (audioUrl && audioRef.current && type.includes('blind')) {
      audioRef.current.play().catch((err) => {
        console.log('Autoplay bloqué:', err);
      });
    }
  }, [audioUrl, type]);

  return (
    <div className="w-full">
      {/* Numéro de question */}
      <div className="text-center mb-4">
        <div className="inline-block bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold">
          Question {questionIndex + 1} / {totalQuestions}
        </div>
      </div>

      {/* Image si disponible */}
      {imageUrl && (
        <div className="mb-4 relative w-full h-48 md:h-64 rounded-xl overflow-hidden shadow-lg">
          <img
            src={imageUrl}
            alt="Question"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 p-2 rounded-full">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
        </div>
      )}

      {/* Audio player si disponible */}
      {audioUrl && (
        <div className="mb-4">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-xl shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Volume2 className="w-6 h-6 text-white animate-pulse" />
              <span className="text-white font-bold text-sm">
                Écoutez l'extrait
              </span>
            </div>
            <audio
              ref={audioRef}
              src={audioUrl}
              controls
              className="w-full"
              style={{
                height: '40px',
                borderRadius: '8px',
              }}
            />
          </div>
        </div>
      )}

      {/* Texte de la question */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-center text-gray-900 dark:text-white">
          {question}
        </h2>
      </div>
    </div>
  );
};
