import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { QuestionEditor, Question } from '../components/quiz/QuestionEditor';
import { Upload, Download } from 'lucide-react';
import api from '../services/api';

// Thèmes disponibles avec icônes et fonds d'écran
const THEMES = [
  { 
    id: 'musique', 
    name: 'Musique', 
    icon: '🎵', 
    color: 'from-purple-600 via-pink-600 to-red-600',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1920&h=1080&fit=crop&q=80'
  },
  { 
    id: 'histoire', 
    name: 'Histoire', 
    icon: '📜', 
    color: 'from-amber-600 via-orange-600 to-red-700',
    image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=1920&h=1080&fit=crop&q=80'
  },
  { 
    id: 'geographie', 
    name: 'Géographie', 
    icon: '🌍', 
    color: 'from-green-600 via-teal-600 to-blue-600',
    image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1920&h=1080&fit=crop&q=80'
  },
  { 
    id: 'culture_generale', 
    name: 'Culture Générale', 
    icon: '📚', 
    color: 'from-indigo-600 via-purple-600 to-pink-600',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&h=1080&fit=crop&q=80'
  },
  { 
    id: 'cinema', 
    name: 'Cinéma', 
    icon: '🎬', 
    color: 'from-red-600 via-rose-600 to-pink-600',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&h=1080&fit=crop&q=80'
  },
  { 
    id: 'series_tv', 
    name: 'Séries TV', 
    icon: '📺', 
    color: 'from-blue-600 via-cyan-600 to-teal-600',
    image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=1920&h=1080&fit=crop&q=80'
  },
  { 
    id: 'anime_manga', 
    name: 'Animé/Manga', 
    icon: '🎌', 
    color: 'from-pink-600 via-purple-600 to-indigo-600',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&h=1080&fit=crop&q=80'
  },
];

export const QuizForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    theme: 'musique',
  });
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (isEdit) {
      loadQuiz();
    }
  }, [id]);

  const loadQuiz = async () => {
    try {
      const response = await api.get(`/quiz/${id}`);
      const quiz = response.data.quiz;
      setFormData({
        title: quiz.title,
        description: quiz.description || '',
        theme: quiz.theme,
      });
      
      // Charger les questions
      if (quiz.questions && quiz.questions.length > 0) {
        setQuestions(quiz.questions);
      }
    } catch (error) {
      console.error('Erreur chargement quiz:', error);
      toast.error('Erreur lors du chargement du quiz');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        questions: questions.map((q, index) => ({
          ...q,
          order: index,
        })),
      };

      if (isEdit) {
        await api.put(`/quiz/${id}`, payload);
        toast.success('🎵 Quiz modifié avec succès !');
      } else {
        await api.post('/quiz', payload);
        toast.success('🎉 Quiz créé avec succès !');
      }
      navigate('/admin');
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
      return;
    }

    setImportLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(`/quiz/${id}/import-excel`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = response.data;
      let message = `Import terminé ! ${result.success} question(s) importée(s)`;
      
      if (result.errors && result.errors.length > 0) {
        const errorPreview = result.errors.slice(0, 3).join(', ');
        toast.error(`${message}. Erreurs: ${errorPreview}${result.errors.length > 3 ? '...' : ''}`, {
          duration: 6000,
        });
      } else {
        toast.success(message);
      }
      
      // Recharger le quiz pour voir les nouvelles questions
      await loadQuiz();
    } catch (error: any) {
      console.error('Erreur import:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de l\'import');
    } finally {
      setImportLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExportExcel = async () => {
    if (!id) {
      toast.error('Veuillez d\'abord enregistrer le quiz');
      return;
    }

    try {
      const response = await api.get(`/quiz/${id}/export-excel`, {
        responseType: 'blob',
      });

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${formData.title || 'quiz'}_questions.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('💾 Fichier Excel exporté');
    } catch (error: any) {
      console.error('Erreur export:', error);
      toast.error('Erreur lors de l\'export');
    }
  };

  const downloadTemplate = () => {
    // Créer un template Excel vide avec les en-têtes
    const template = `Type,Question,Option 1,Option 2,Option 3,Option 4,Réponse Correcte,Variantes (séparées par |),Temps (sec),URL Audio,URL Image,URL YouTube,Début (sec),Fin (sec),Sensible Casse,Montrer Vidéo Après
text_qcm,Quelle est la couleur du ciel ?,Bleu,Rouge,Vert,Jaune,0,,30,,,,,,,Non
text_free,Qui a peint la Joconde ?,,,,,Léonard de Vinci,Leonardo da Vinci | Da Vinci,30,,,,,,,Non
blind_test,Quel est le titre de cette chanson ?,,,,,Bohemian Rhapsody,,30,https://exemple.com/audio.mp3,,,,0,30,Non,Non`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_questions.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">
              {isEdit ? 'Modifier le quiz' : 'Créer un quiz'}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Titre du quiz"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Quiz Rock des années 80"
              required
            />

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du quiz (optionnel)"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Thème du Quiz</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, theme: theme.id })}
                    className={`
                      relative overflow-hidden rounded-xl border-2 transition-all duration-200
                      ${formData.theme === theme.id
                        ? 'border-blue-500 ring-4 ring-blue-200 dark:ring-blue-800 scale-105'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:scale-102'
                      }
                    `}
                  >
                    {/* En-tête avec titre et icône */}
                    <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 px-3 py-3 z-10">
                      <div className="flex items-center gap-2 justify-center">
                        <span className="text-2xl">{theme.icon}</span>
                        <span className="text-sm font-bold text-white">
                          {theme.name}
                        </span>
                      </div>
                    </div>
                    
                    {/* Image de fond thématique */}
                    <div className="relative h-32 overflow-hidden">
                      <img 
                        src={theme.image} 
                        alt={theme.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay gradient pour améliorer la lisibilité */}
                      <div className={`
                        absolute inset-0 bg-gradient-to-br ${theme.color} opacity-30
                        ${formData.theme === theme.id ? 'opacity-40' : ''}
                      `} />
                    </div>
                    
                    {/* Checkmark de sélection */}
                    {formData.theme === theme.id && (
                      <div className="absolute top-2 right-2 z-20">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Import/Export Excel */}
            {isEdit && (
              <div className="pt-6 border-t dark:border-gray-700">
                <h3 className="text-lg font-bold mb-3">Import/Export Excel</h3>
                <div className="flex flex-wrap gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleImportExcel}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={importLoading}
                    className="flex items-center gap-2"
                  >
                    <Upload size={18} />
                    {importLoading ? 'Import en cours...' : 'Importer depuis Excel'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleExportExcel}
                    className="flex items-center gap-2"
                  >
                    <Download size={18} />
                    Exporter vers Excel
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={downloadTemplate}
                    className="flex items-center gap-2"
                  >
                    <Download size={18} />
                    Télécharger template
                  </Button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  💡 Importez/exportez vos questions en masse depuis Excel. Le template vous montre le format attendu.
                </p>
              </div>
            )}

            {/* Éditeur de questions */}
            <div className="pt-6 border-t dark:border-gray-700">
              <QuestionEditor questions={questions} onQuestionsChange={setQuestions} />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Créer'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/admin')}
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
