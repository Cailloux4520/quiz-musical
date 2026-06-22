import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Users, UserPlus, User } from 'lucide-react';
import api from '../services/api';
import socket from '../services/socket';
import logoSvg from '../assets/logo.svg';

interface Team {
  id: string;
  name: string;
  color: string;
  score: number;
  players: Array<{ id: string; nickname: string; score: number }>;
}

type JoinMode = 'solo' | 'create-team' | 'join-team';

export const PlayerJoinPage: React.FC = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [joinMode, setJoinMode] = useState<JoinMode | null>(null);
  const [teamName, setTeamName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    if (inviteCode) {
      checkSession();
    }
  }, [inviteCode]);

  useEffect(() => {
    if (sessionId && joinMode === 'join-team') {
      fetchTeams();
      
      // Écouter les mises à jour des équipes
      socket.on('team:created', handleTeamUpdate);
      socket.on('team:updated', handleTeamUpdate);

      return () => {
        socket.off('team:created', handleTeamUpdate);
        socket.off('team:updated', handleTeamUpdate);
      };
    }
  }, [sessionId, joinMode]);

  const checkSession = async () => {
    try {
      const response = await api.get(`/session/${inviteCode}`);
      const session = response.data.session;

      if (session.status !== 'waiting') {
        setError('Cette session a déjà commencé ou est terminée');
        return;
      }

      setSessionId(session.id);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Code de session invalide');
    }
  };

  const fetchTeams = () => {
    if (sessionId) {
      socket.emit('teams:get', { sessionId });
      socket.once('teams:list', (data: { teams: Team[] }) => {
        setTeams(data.teams);
      });
    }
  };

  const handleTeamUpdate = (data: { team: Team }) => {
    setTeams((prevTeams) => {
      const index = prevTeams.findIndex((t) => t.id === data.team.id);
      if (index >= 0) {
        const newTeams = [...prevTeams];
        newTeams[index] = data.team;
        return newTeams;
      }
      return [...prevTeams, data.team];
    });
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let teamId: string | undefined;

      // Créer une équipe si nécessaire
      if (joinMode === 'create-team') {
        if (!teamName.trim()) {
          setError('Veuillez entrer un nom d\'équipe');
          setLoading(false);
          return;
        }

        // Créer l'équipe via Socket
        socket.emit('team:create', { sessionId, teamName: teamName.trim() });
        
        // Attendre la confirmation
        await new Promise<void>((resolve, reject) => {
          socket.once('team:created', (data: { team: Team }) => {
            teamId = data.team.id;
            resolve();
          });
          socket.once('error', (data: { message: string }) => {
            reject(new Error(data.message));
          });
          
          // Timeout après 5 secondes
          setTimeout(() => reject(new Error('Timeout création équipe')), 5000);
        });
      } else if (joinMode === 'join-team') {
        if (!selectedTeamId) {
          setError('Veuillez sélectionner une équipe');
          setLoading(false);
          return;
        }
        teamId = selectedTeamId;
      }

      // Rediriger vers la page de jeu avec les infos
      navigate(`/play/${inviteCode}`, {
        state: { 
          nickname, 
          sessionId,
          teamId,
        },
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion');
      setLoading(false);
    }
  };

  if (error && !sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">❌ Erreur</h1>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={() => navigate('/')}>Retour</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <div className="flex flex-col items-center mb-6">
          <img src={logoSvg} alt="MyQuiz Logo" className="w-16 h-16 mb-2" />
          <h2 className="text-2xl font-bold">MyQuiz</h2>
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
            className="mb-4"
          />

          {!joinMode ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mode de jeu
              </p>
              
              <button
                type="button"
                onClick={() => setJoinMode('solo')}
                className="w-full flex items-center gap-3 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
              >
                <User className="w-6 h-6 text-purple-500" />
                <div className="text-left">
                  <div className="font-medium">Jouer seul</div>
                  <div className="text-sm text-gray-500">Mode individuel</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setJoinMode('create-team')}
                className="w-full flex items-center gap-3 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <UserPlus className="w-6 h-6 text-blue-500" />
                <div className="text-left">
                  <div className="font-medium">Créer une équipe</div>
                  <div className="text-sm text-gray-500">Nouvelle équipe</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setJoinMode('join-team')}
                className="w-full flex items-center gap-3 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 dark:hover:border-green-400 transition-colors"
              >
                <Users className="w-6 h-6 text-green-500" />
                <div className="text-left">
                  <div className="font-medium">Rejoindre une équipe</div>
                  <div className="text-sm text-gray-500">Équipe existante</div>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {joinMode === 'create-team' && (
                <Input
                  label="Nom de l'équipe"
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Entrez le nom de votre équipe"
                  required
                  maxLength={30}
                />
              )}

              {joinMode === 'join-team' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Choisissez une équipe
                  </label>
                  {teams.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Aucune équipe disponible. Créez-en une !
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {teams.map((team) => (
                        <button
                          key={team.id}
                          type="button"
                          onClick={() => setSelectedTeamId(team.id)}
                          className={`w-full p-3 border-2 rounded-lg text-left transition-colors ${
                            selectedTeamId === team.id
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : 'border-gray-300 dark:border-gray-600 hover:border-green-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: team.color }}
                              />
                              <span className="font-medium">{team.name}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {team.players.length} joueur{team.players.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setJoinMode(null);
                    setTeamName('');
                    setSelectedTeamId('');
                    setError('');
                  }}
                  className="flex-1"
                >
                  Retour
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? 'Connexion...' : 'Rejoindre'}
                </Button>
              </div>
            </div>
          )}

          {joinMode === 'solo' && !error && (
            <div className="mt-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setJoinMode(null)}
                  className="flex-1"
                >
                  Retour
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? 'Connexion...' : 'Rejoindre'}
                </Button>
              </div>
            </div>
          )}
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Prêt à tester vos connaissances musicales ?</p>
        </div>
      </Card>
    </div>
  );
};
