import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { WaitingRoom } from '../components/game/WaitingRoom';
import { QuestionDisplay } from '../components/game/QuestionDisplay';
import { AnswerButton } from '../components/game/AnswerButton';
import { CircularTimer } from '../components/game/CircularTimer';
import { socket } from '../services/socket';
import { Trophy, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

interface Player {
  id: string;
  nickname: string;
  score: number;
  teamId?: string | null;
}

interface Team {
  id: string;
  name: string;
  color: string;
  score: number;
  players: Player[];
}

interface Question {
  id: string;
  type: string;
  question: string;
  choices: string[];
  timeLimit: number;
  audioUrl?: string | null;
  imageUrl?: string | null;
  youtubeUrl?: string | null;
  questionIndex: number;
  totalQuestions: number;
}

interface AnswerResult {
  isCorrect: boolean;
  pointsEarned: number;
  newScore: number;
}

interface QuestionEndData {
  questionId: string;
  correctIndex: number;
  correctAnswer: string;
}

type GamePhase = 'waiting' | 'question' | 'answered' | 'results' | 'finished';

export const PlayerGame: React.FC = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [connected, setConnected] = useState(false);
  const [phase, setPhase] = useState<GamePhase>('waiting');
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [playerId, setPlayerId] = useState<string>('');
  
  // Question state
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [questionEnd, setQuestionEnd] = useState<QuestionEndData | null>(null);
  const [playerScore, setPlayerScore] = useState(0);

  const nickname = location.state?.nickname;
  const sessionId = location.state?.sessionId;
  const teamId = location.state?.teamId;

  useEffect(() => {
    if (!nickname || !sessionId) {
      navigate(`/join/${inviteCode}`);
      return;
    }

    // Connexion socket
    socket.connect();

    socket.emit('player:join', {
      sessionId,
      nickname,
      teamId: teamId || undefined,
    });

    socket.on('player:joined', (data: { player: Player }) => {
      setConnected(true);
      setPlayerId(data.player.id);
      setPlayerScore(data.player.score);
      // Demander la liste des équipes
      socket.emit('teams:get', { sessionId });
    });

    socket.on('player:new', (data: { player: Player }) => {
      setPlayers((prev) => [...prev, data.player]);
    });

    socket.on('teams:list', (data: { teams: Team[] }) => {
      setTeams(data.teams);
      const allPlayers: Player[] = [];
      data.teams.forEach((team) => {
        allPlayers.push(...team.players);
      });
      setPlayers(allPlayers);
    });

    socket.on('team:created', (data: { team: Team }) => {
      setTeams((prev) => [...prev, data.team]);
    });

    socket.on('team:updated', (data: { team: Team }) => {
      setTeams((prev) => {
        const index = prev.findIndex((t) => t.id === data.team.id);
        if (index >= 0) {
          const newTeams = [...prev];
          newTeams[index] = data.team;
          return newTeams;
        }
        return prev;
      });
    });

    // Événements de jeu
    socket.on('session:started', () => {
      setPhase('waiting');
    });

    socket.on('question:started', (data: Question) => {
      setCurrentQuestion(data);
      setSelectedAnswer(null);
      setAnswerResult(null);
      setQuestionEnd(null);
      setPhase('question');
    });

    socket.on('answer:recorded', (data: AnswerResult) => {
      setAnswerResult(data);
      setPlayerScore(data.newScore);
      setPhase('answered');
    });

    socket.on('question:ended', (data: QuestionEndData) => {
      setQuestionEnd(data);
      setPhase('results');
    });

    socket.on('session:finished', (data: { sessionId: string }) => {
      // Rediriger vers la page de résultats
      setTimeout(() => {
        navigate(`/results/${data.sessionId || sessionId}`);
      }, 2000); // 2 secondes de délai pour voir le message de fin
      setPhase('finished');
    });

    return () => {
      socket.off('player:joined');
      socket.off('player:new');
      socket.off('teams:list');
      socket.off('team:created');
      socket.off('team:updated');
      socket.off('session:started');
      socket.off('question:started');
      socket.off('answer:recorded');
      socket.off('question:ended');
      socket.off('session:finished');
    };
  }, [nickname, sessionId, inviteCode, navigate]);

  const handleAnswerSelect = (choiceIndex: number) => {
    if (selectedAnswer !== null || !currentQuestion) return;

    setSelectedAnswer(choiceIndex);

    // Calculer le temps écoulé depuis le début de la question
    const timeElapsed = currentQuestion.timeLimit; // Pour l'instant, simulé

    socket.emit('answer:submit', {
      sessionId,
      playerId,
      questionId: currentQuestion.id,
      choiceIndex,
      timeElapsed,
    });
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4">
        <Card className="text-center">
          <div className="animate-pulse">
            <p className="text-xl font-bold mb-2">Connexion...</p>
            <p className="text-gray-600 dark:text-gray-400">
              En tant que {nickname}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 p-2 md:p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header avec score */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Joueur</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {nickname}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Score</p>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {playerScore}
              </p>
            </div>
          </div>
        </div>

        {/* Salle d'attente */}
        {phase === 'waiting' && (
          <Card>
            <WaitingRoom
              players={players}
              teams={teams}
              code={inviteCode || ''}
            />
          </Card>
        )}

        {/* Question en cours */}
        {phase === 'question' && currentQuestion && (
          <div className="space-y-4">
            {/* Question */}
            <QuestionDisplay
              question={currentQuestion.question}
              questionIndex={currentQuestion.questionIndex}
              totalQuestions={currentQuestion.totalQuestions}
              audioUrl={currentQuestion.audioUrl}
              imageUrl={currentQuestion.imageUrl}
              type={currentQuestion.type}
            />

            {/* Timer */}
            <div className="flex justify-center">
              <CircularTimer
                duration={currentQuestion.timeLimit}
                onComplete={() => {
                  if (selectedAnswer === null) {
                    setPhase('answered');
                  }
                }}
              />
            </div>

            {/* Grille de réponses 2x2 */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {currentQuestion.choices.map((choice, index) => (
                <AnswerButton
                  key={index}
                  label={String.fromCharCode(65 + index)} // A, B, C, D
                  text={choice}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null}
                  isSelected={selectedAnswer === index}
                />
              ))}
            </div>
          </div>
        )}

        {/* Réponse enregistrée */}
        {phase === 'answered' && answerResult && (
          <Card className="text-center py-12">
            <div className="mb-6">
              {answerResult.isCorrect ? (
                <CheckCircle className="w-24 h-24 text-green-500 mx-auto animate-bounce" />
              ) : (
                <XCircle className="w-24 h-24 text-red-500 mx-auto animate-bounce" />
              )}
            </div>
            <h2 className="text-3xl font-bold mb-4">
              {answerResult.isCorrect ? 'Bonne réponse !' : 'Mauvaise réponse'}
            </h2>
            {answerResult.pointsEarned > 0 && (
              <div className="flex items-center justify-center gap-2 text-2xl font-bold text-green-600">
                <TrendingUp className="w-8 h-8" />
                +{answerResult.pointsEarned} points
              </div>
            )}
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              En attente de la question suivante...
            </p>
          </Card>
        )}

        {/* Résultats de la question */}
        {phase === 'results' && currentQuestion && questionEnd && (
          <div className="space-y-4">
            <QuestionDisplay
              question={currentQuestion.question}
              questionIndex={currentQuestion.questionIndex}
              totalQuestions={currentQuestion.totalQuestions}
              audioUrl={currentQuestion.audioUrl}
              imageUrl={currentQuestion.imageUrl}
              type={currentQuestion.type}
            />

            {/* Grille avec réponse correcte */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {currentQuestion.choices.map((choice, index) => (
                <AnswerButton
                  key={index}
                  label={String.fromCharCode(65 + index)}
                  text={choice}
                  onClick={() => {}}
                  disabled={true}
                  isSelected={selectedAnswer === index}
                  isCorrect={index === questionEnd.correctIndex}
                  showResult={true}
                />
              ))}
            </div>

            <Card className="text-center bg-green-50 dark:bg-green-900">
              <p className="text-lg font-bold text-green-800 dark:text-green-100">
                ✓ Bonne réponse : {questionEnd.correctAnswer}
              </p>
            </Card>
          </div>
        )}

        {/* Session terminée */}
        {phase === 'finished' && (
          <Card className="text-center py-12">
            <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">Quiz Terminé !</h2>
            <p className="text-2xl font-bold text-purple-600 mb-6">
              Score final : {playerScore} points
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700 transition"
            >
              Retour à l'accueil
            </button>
          </Card>
        )}

        {/* Bouton quitter (sauf si terminé) */}
        {phase !== 'finished' && (
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-white hover:underline text-sm"
            >
              Quitter la partie
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
