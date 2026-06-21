import React, { useEffect, useState } from 'react';

interface CircularTimerProps {
  duration: number; // en secondes
  onComplete?: () => void;
  size?: number;
  strokeWidth?: number;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({
  duration,
  onComplete,
  size = 120,
  strokeWidth = 8,
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(true);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (timeLeft / duration) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Couleur du timer selon le temps restant
  const getColor = () => {
    if (progress > 66) return '#4ade80'; // vert
    if (progress > 33) return '#facc15'; // jaune
    return '#ef4444'; // rouge
  };

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft <= 0 && onComplete) {
        onComplete();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [timeLeft, isRunning, onComplete]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* SVG Circle */}
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-100 ease-linear"
        />
      </svg>

      {/* Time Display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {Math.ceil(timeLeft)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            secondes
          </div>
        </div>
      </div>
    </div>
  );
};
