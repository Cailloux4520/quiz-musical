import React from 'react';

interface SessionsChartProps {
  data: Array<{ date: string; count: number }>;
}

export const SessionsChart: React.FC<SessionsChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Aucune donnée disponible
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const chartHeight = 200;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Sessions créées (30 derniers jours)
      </h3>
      <div className="overflow-x-auto">
        <div className="min-w-full" style={{ minWidth: '800px' }}>
          <div className="flex items-end justify-between gap-1 h-64 pb-8">
            {data.map((item, index) => {
              const height = maxCount > 0 ? (item.count / maxCount) * chartHeight : 0;
              const isWeekend =
                new Date(item.date).getDay() === 0 ||
                new Date(item.date).getDay() === 6;

              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center group relative"
                >
                  {/* Barre */}
                  <div
                    className={`w-full rounded-t transition-all duration-300 ${
                      item.count > 0
                        ? 'bg-gradient-to-t from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                    style={{ height: `${height}px` }}
                  />

                  {/* Tooltip au survol */}
                  {item.count > 0 && (
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                      <div className="font-semibold">{item.count} session{item.count > 1 ? 's' : ''}</div>
                      <div className="text-gray-300">
                        {new Date(item.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                    </div>
                  )}

                  {/* Date (tous les 5 jours ou si weekend) */}
                  {(index % 5 === 0 || isWeekend) && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 -rotate-45 origin-top-left">
                      {new Date(item.date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-t from-purple-500 to-purple-600" />
          <span>Sessions créées</span>
        </div>
        <div className="text-gray-400">
          Max: {maxCount} session{maxCount > 1 ? 's' : ''} / jour
        </div>
      </div>
    </div>
  );
};
