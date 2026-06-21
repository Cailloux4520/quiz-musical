import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
            🎵 Quiz Musical
          </h1>
          <p className="text-xl md:text-2xl text-white mb-12">
            Créez des quiz musicaux immersifs et animez des soirées
            inoubliables en temps réel
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="text-left">
              <h3 className="text-2xl font-bold mb-3">🎨 Pour les Organisateurs</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Créez vos quiz personnalisés avec extraits audio, images et
                thèmes visuels. Animez la soirée depuis l'écran maître.
              </p>
              <Button onClick={() => navigate('/login')} className="w-full">
                Espace Admin
              </Button>
            </Card>

            <Card className="text-left">
              <h3 className="text-2xl font-bold mb-3">🎮 Pour les Joueurs</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Rejoignez une partie avec un simple code, répondez depuis votre
                téléphone et grimpez au classement !
              </p>
              <Button onClick={() => navigate('/join')} className="w-full">
                Rejoindre une partie
              </Button>
            </Card>
          </div>

          <div className="text-white text-sm">
            <p>✨ Sans inscription • ⚡ Temps réel • 📱 Multi-appareils</p>
          </div>
        </div>
      </div>
    </div>
  );
};
