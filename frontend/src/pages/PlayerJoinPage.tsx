import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import api from '../services/api';

export const PlayerJoinPage: React.FC = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Vérifier que la session existe
      const response = await api.get(`/session/${inviteCode}`);
      const session = response.data.session;

      if (session.status !== 'waiting') {
        setError('Cette session a déjà commencé ou est terminée');
        setLoading(false);
        return;
      }

      // Rediriger vers la page de jeu avec les infos
      navigate(`/play/${inviteCode}`, {
        state: { nickname, sessionId: session.id },
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Code de session invalide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2">🎵</h1>
          <h2 className="text-2xl font-bold">Quiz Musical</h2>
        </div>

        {inviteCode && (
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Code de session
            </p>
            <p className="text-3xl font-bold tracking-wider">{inviteCode}</p>
          </div>
        )}

        <form onSubmit={handleJoin}>
          <Input
            label="Votre pseudo"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Entrez votre pseudo"
            required
            maxLength={20}
          />

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Connexion...' : 'Rejoindre la partie'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Prêt à tester vos connaissances musicales ?</p>
        </div>
      </Card>
    </div>
  );
};
