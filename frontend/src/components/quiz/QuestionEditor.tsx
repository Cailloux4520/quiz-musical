import React, { useState } from 'react';
import { Trash2, Plus, X, Music, Image as ImageIcon, Video, ListChecks } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { MediaSelector } from '../media/MediaSelector';

// Types de questions disponibles
export const QUESTION_TYPES = [
  { value: 'text_qcm', label: 'QCM Texte', icon: ListChecks, description: 'Question à choix multiples classique' },
  { value: 'text_free', label: 'Texte Libre', icon: ListChecks, description: 'Réponse libre avec variantes acceptées' },
  { value: 'image_qcm', label: 'QCM Image', icon: ImageIcon, description: 'QCM avec une image' },
  { value: 'audio_qcm', label: 'QCM Audio', icon: Music, description: 'QCM avec un extrait audio' },
  { value: 'blind_test', label: 'Blind Test', icon: Music, description: 'Deviner artiste et/ou titre' },
  { value: 'album_cover', label: 'Pochette d\'Album', icon: ImageIcon, description: 'Deviner depuis une pochette' },
  { value: 'youtube', label: 'Vidéo YouTube', icon: Video, description: 'Question avec vidéo YouTube' },
];

export interface Question {
  id?: string;
  question: string;
  type: string;
  options?: string[];
  correctAnswer?: string;
  acceptedAnswers?: string[];
  caseSensitive?: boolean;
  points?: number;
  timeLimit?: number;
  imageId?: string;
  imageUrl?: string;
  audioId?: string;
  audioUrl?: string;
  youtubeUrl?: string;
  startTime?: number;
  endTime?: number;
  duration?: number;
  showVideoAfterAnswer?: boolean;
}

interface QuestionEditorProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  questions,
  onQuestionsChange,
}) => {
  const [mediaSelector, setMediaSelector] = useState<{
    show: boolean;
    type: 'audio' | 'image';
    questionIndex: number;
  } | null>(null);

  const addQuestion = () => {
    const newQuestion: Question = {
      question: '',
      type: 'text_qcm',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 100,
      timeLimit: 30,
    };
    onQuestionsChange([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    onQuestionsChange(updated);
  };

  const deleteQuestion = (index: number) => {
    onQuestionsChange(questions.filter((_, i) => i !== index));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === questions.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...questions];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onQuestionsChange(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    const options = [...(updated[questionIndex].options || [])];
    options[optionIndex] = value;
    updated[questionIndex] = { ...updated[questionIndex], options };
    onQuestionsChange(updated);
  };

  const addAcceptedAnswer = (questionIndex: number) => {
    const updated = [...questions];
    const acceptedAnswers = [...(updated[questionIndex].acceptedAnswers || [])];
    acceptedAnswers.push('');
    updated[questionIndex] = { ...updated[questionIndex], acceptedAnswers };
    onQuestionsChange(updated);
  };

  const updateAcceptedAnswer = (questionIndex: number, answerIndex: number, value: string) => {
    const updated = [...questions];
    const acceptedAnswers = [...(updated[questionIndex].acceptedAnswers || [])];
    acceptedAnswers[answerIndex] = value;
    updated[questionIndex] = { ...updated[questionIndex], acceptedAnswers };
    onQuestionsChange(updated);
  };

  const removeAcceptedAnswer = (questionIndex: number, answerIndex: number) => {
    const updated = [...questions];
    const acceptedAnswers = (updated[questionIndex].acceptedAnswers || []).filter((_, i) => i !== answerIndex);
    updated[questionIndex] = { ...updated[questionIndex], acceptedAnswers };
    onQuestionsChange(updated);
  };

  const handleMediaSelect = (media: any) => {
    if (!mediaSelector) return;

    const { questionIndex, type } = mediaSelector;
    const updates: Partial<Question> = {};

    if (type === 'audio') {
      updates.audioId = media.id;
      updates.audioUrl = media.url;
      updates.duration = media.duration;
    } else {
      updates.imageId = media.id;
      updates.imageUrl = media.url;
    }

    updateQuestion(questionIndex, updates);
    setMediaSelector(null);
  };

  const renderQuestionTypeFields = (question: Question, index: number) => {
    switch (question.type) {
      case 'text_qcm':
      case 'image_qcm':
      case 'audio_qcm':
        return (
          <div className="space-y-3">
            {question.type === 'image_qcm' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-200">Image</label>
                {question.imageUrl ? (
                  <div className="relative">
                    <img src={question.imageUrl} alt="Question" className="w-full max-h-48 object-contain rounded border" />
                    <button
                      type="button"
                      onClick={() => updateQuestion(index, { imageId: undefined, imageUrl: undefined })}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setMediaSelector({ show: true, type: 'image', questionIndex: index })}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <ImageIcon size={18} />
                    Sélectionner une image
                  </Button>
                )}
              </div>
            )}

            {question.type === 'audio_qcm' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-200">Fichier Audio</label>
                {question.audioUrl ? (
                  <div className="p-3 bg-gray-700 rounded border border-gray-600 flex items-center justify-between">
                    <audio controls src={question.audioUrl} className="flex-1" />
                    <button
                      type="button"
                      onClick={() => updateQuestion(index, { audioId: undefined, audioUrl: undefined })}
                      className="ml-3 text-red-500 hover:text-red-600"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setMediaSelector({ show: true, type: 'audio', questionIndex: index })}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Music size={18} />
                    Sélectionner un audio
                  </Button>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-200">Options de réponse</label>
              {(question.options || []).map((option, optIndex) => (
                <div key={optIndex} className="flex gap-2 mb-2">
                  <Input
                    value={option}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOption(index, optIndex, e.target.value)}
                    placeholder={`Option ${optIndex + 1}`}
                    required
                  />
                  <input
                    type="radio"
                    name={`correct-${index}`}
                    checked={question.correctAnswer === String(optIndex)}
                    onChange={() => updateQuestion(index, { correctAnswer: String(optIndex) })}
                    className="w-6 h-6"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'text_free':
      case 'blind_test':
      case 'album_cover':
        return (
          <div className="space-y-3">
            {question.type === 'album_cover' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-200">Pochette d'Album</label>
                {question.imageUrl ? (
                  <div className="relative">
                    <img src={question.imageUrl} alt="Pochette" className="w-full max-h-48 object-contain rounded border" />
                    <button
                      type="button"
                      onClick={() => updateQuestion(index, { imageId: undefined, imageUrl: undefined })}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setMediaSelector({ show: true, type: 'image', questionIndex: index })}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <ImageIcon size={18} />
                    Sélectionner une pochette
                  </Button>
                )}
              </div>
            )}

            {question.type === 'blind_test' && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-200">Extrait Audio</label>
                {question.audioUrl ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-700 rounded border border-gray-600 flex items-center justify-between">
                      <audio controls src={question.audioUrl} className="flex-1" />
                      <button
                        type="button"
                        onClick={() => updateQuestion(index, { audioId: undefined, audioUrl: undefined, startTime: undefined, endTime: undefined })}
                        className="ml-3 text-red-500 hover:text-red-600"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        label="Début (secondes)"
                        value={question.startTime || 0}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestion(index, { startTime: parseInt(e.target.value) })}
                        min={0}
                        max={question.duration || 300}
                      />
                      <Input
                        type="number"
                        label="Fin (secondes)"
                        value={question.endTime || question.duration || 30}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestion(index, { endTime: parseInt(e.target.value) })}
                        min={question.startTime || 0}
                        max={question.duration || 300}
                      />
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setMediaSelector({ show: true, type: 'audio', questionIndex: index })}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Music size={18} />
                    Sélectionner un audio
                  </Button>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-200">Réponse correcte</label>
              <Input
                value={question.correctAnswer || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestion(index, { correctAnswer: e.target.value })}
                placeholder="Réponse attendue"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-200">Variantes acceptées (optionnel)</label>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => addAcceptedAnswer(index)}
                  className="flex items-center gap-1"
                >
                  <Plus size={16} />
                  Ajouter
                </Button>
              </div>
              {(question.acceptedAnswers || []).map((answer, ansIndex) => (
                <div key={ansIndex} className="flex gap-2 mb-2">
                  <Input
                    value={answer}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateAcceptedAnswer(index, ansIndex, e.target.value)}
                    placeholder="Variante de réponse"
                  />
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => removeAcceptedAnswer(index, ansIndex)}
                  >
                    <X size={18} />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`case-sensitive-${index}`}
                checked={question.caseSensitive || false}
                onChange={(e) => updateQuestion(index, { caseSensitive: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor={`case-sensitive-${index}`} className="text-sm text-gray-200">
                Sensible à la casse
              </label>
            </div>
          </div>
        );

      case 'youtube':
        return (
          <div className="space-y-3">
            <Input
              label="URL YouTube"
              value={question.youtubeUrl || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestion(index, { youtubeUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                label="Début (secondes)"
                value={question.startTime || 0}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestion(index, { startTime: parseInt(e.target.value) })}
                min={0}
              />
              <Input
                type="number"
                label="Fin (secondes)"
                value={question.endTime || 30}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestion(index, { endTime: parseInt(e.target.value) })}
                min={question.startTime || 0}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`show-video-${index}`}
                checked={question.showVideoAfterAnswer || false}
                onChange={(e) => updateQuestion(index, { showVideoAfterAnswer: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor={`show-video-${index}`} className="text-sm text-gray-200">
                Afficher la vidéo complète après la réponse
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Questions ({questions.length})</h3>
        <Button type="button" onClick={addQuestion} className="flex items-center gap-2">
          <Plus size={18} />
          Ajouter une question
        </Button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
          Aucune question. Cliquez sur "Ajouter une question" pour commencer.
        </div>
      ) : (
        questions.map((question, index) => (
          <div key={index} className="border border-gray-600 rounded-lg p-4 bg-gray-800 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-300">#{index + 1}</span>
                <select
                  value={question.type}
                  onChange={(e) => updateQuestion(index, { type: e.target.value })}
                  className="px-3 py-1 border border-gray-600 rounded bg-gray-700 text-white text-sm font-medium"
                >
                  {QUESTION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => moveQuestion(index, 'up')}
                  disabled={index === 0}
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => moveQuestion(index, 'down')}
                  disabled={index === questions.length - 1}
                >
                  ↓
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => deleteQuestion(index)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Input
                label="Énoncé de la question"
                value={question.question}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestion(index, { question: e.target.value })}
                placeholder="Ex: Qui a chanté 'Thriller' ?"
                required
              />

              {renderQuestionTypeFields(question, index)}

              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  label="Points"
                  value={question.points || 100}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestion(index, { points: parseInt(e.target.value) })}
                  min={1}
                />
                <Input
                  type="number"
                  label="Temps limite (secondes)"
                  value={question.timeLimit || 30}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestion(index, { timeLimit: parseInt(e.target.value) })}
                  min={5}
                  max={120}
                />
              </div>
            </div>
          </div>
        ))
      )}

      {/* Media Selector Modal */}
      {mediaSelector?.show && (
        <MediaSelector
          type={mediaSelector.type}
          onSelect={handleMediaSelect}
          onClose={() => setMediaSelector(null)}
        />
      )}
    </div>
  );
};
