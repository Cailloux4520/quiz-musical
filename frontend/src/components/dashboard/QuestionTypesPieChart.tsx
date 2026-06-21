import React from 'react';

interface QuestionTypesPieChartProps {
  data: Array<{ type: string; count: number }>;
}

const QUESTION_TYPE_LABELS: Record<string, string> = {
  text: 'Texte',
  image: 'Image',
  audio: 'Audio',
  blind_test: 'Blind Test',
  mcq: 'QCM',
  'video-clip-year': 'Année Clip Vidéo',
  'music-80s': 'Musique 80s',
  'music-90s': 'Musique 90s',
  'video-game': 'Jeux Vidéo',
  'movie-music': 'Musique de Film',
};

const COLORS = [
  '#9333ea', // purple-600
  '#3b82f6', // blue-600
  '#10b981', // green-600
  '#f59e0b', // orange-600
  '#ec4899', // pink-600
  '#8b5cf6', // violet-600
  '#06b6d4', // cyan-600
  '#f97316', // orange-500
];

export const QuestionTypesPieChart: React.FC<QuestionTypesPieChartProps> = ({
  data,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Aucune question disponible
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);
  let currentAngle = 0;

  const slices = data.map((item, index) => {
    const percentage = (item.count / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;

    return {
      ...item,
      percentage,
      startAngle,
      endAngle: currentAngle,
      color: COLORS[index % COLORS.length],
    };
  });

  const radius = 80;
  const centerX = 100;
  const centerY = 100;

  const createArc = (
    startAngle: number,
    endAngle: number,
    radius: number
  ): string => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M',
      start.x,
      start.y,
      'A',
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      'L',
      centerX,
      centerY,
      'Z',
    ].join(' ');
  };

  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Répartition des types de questions
      </h3>

      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Pie Chart SVG */}
        <div className="flex-shrink-0">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {slices.map((slice, index) => (
              <g key={index}>
                <path
                  d={createArc(slice.startAngle, slice.endAngle, radius)}
                  fill={slice.color}
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                  }}
                />
              </g>
            ))}
            {/* Cercle blanc au centre pour faire un donut */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius * 0.6}
              fill="white"
              className="dark:fill-gray-800"
            />
            {/* Texte total au centre */}
            <text
              x={centerX}
              y={centerY - 5}
              textAnchor="middle"
              className="text-2xl font-bold fill-gray-900 dark:fill-white"
            >
              {total}
            </text>
            <text
              x={centerX}
              y={centerY + 15}
              textAnchor="middle"
              className="text-xs fill-gray-500 dark:fill-gray-400"
            >
              questions
            </text>
          </svg>
        </div>

        {/* Légende */}
        <div className="flex-1 space-y-2">
          {slices.map((slice, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {QUESTION_TYPE_LABELS[slice.type] || slice.type}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {slice.count}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
                  {slice.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
