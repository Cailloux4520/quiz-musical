import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: 'purple' | 'blue' | 'green' | 'orange' | 'pink';
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'purple',
  subtitle,
}) => {
  const colorClasses = {
    purple: 'from-purple-500 to-purple-600 text-purple-600',
    blue: 'from-blue-500 to-blue-600 text-blue-600',
    green: 'from-green-500 to-green-600 text-green-600',
    orange: 'from-orange-500 to-orange-600 text-orange-600',
    pink: 'from-pink-500 to-pink-600 text-pink-600',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </h3>
        <div
          className={`p-3 rounded-lg bg-gradient-to-br ${
            colorClasses[color].split(' ')[0]
          } ${colorClasses[color].split(' ')[1]}`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="space-y-1">
        <div
          className={`text-3xl font-bold ${
            colorClasses[color].split(' ')[2]
          } dark:text-white`}
        >
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
