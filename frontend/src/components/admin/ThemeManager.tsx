import React, { useState, useEffect } from 'react';
import { Palette, Plus, Edit2, Trash2, Copy, Eye } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ThemeConfig } from '../../types/theme';
import { ThemeCustomizer } from './ThemeCustomizer';
import { ThemePreview } from './ThemePreview';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const ThemeManager: React.FC = () => {
  const [themes, setThemes] = useState<ThemeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [editingTheme, setEditingTheme] = useState<string | undefined>();
  const [previewTheme, setPreviewTheme] = useState<ThemeConfig | null>(null);

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/themes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setThemes(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des thèmes:', error);
      toast.error('Impossible de charger les thèmes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce thème ?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/themes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Thème supprimé');
      loadThemes();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du thème');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/themes/${id}/duplicate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Thème dupliqué');
      loadThemes();
    } catch (error) {
      console.error('Erreur lors de la duplication:', error);
      toast.error('Erreur lors de la duplication du thème');
    }
  };

  const handleEdit = (themeId: string) => {
    setEditingTheme(themeId);
    setShowCustomizer(true);
  };

  const handleCreate = () => {
    setEditingTheme(undefined);
    setShowCustomizer(true);
  };

  const handleSave = () => {
    loadThemes();
    setShowCustomizer(false);
    setEditingTheme(undefined);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Palette className="text-purple-500" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-white">Gestion des Thèmes</h1>
            <p className="text-gray-400 mt-1">Personnalisez l'apparence de vos quiz</p>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
        >
          <Plus size={20} />
          Créer un thème
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-purple-500 transition-colors"
          >
            {/* Preview miniature */}
            <div 
              className="h-32 p-4"
              style={{
                background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`,
              }}
            >
              <div className="flex gap-2">
                <div 
                  className="w-12 h-12 rounded"
                  style={{ backgroundColor: theme.accentColor }}
                />
                <div className="flex-1 space-y-2">
                  <div 
                    className="h-3 rounded"
                    style={{ backgroundColor: theme.backgroundColor, width: '80%' }}
                  />
                  <div 
                    className="h-3 rounded"
                    style={{ backgroundColor: theme.backgroundColor, width: '60%' }}
                  />
                </div>
              </div>
            </div>

            {/* Infos */}
            <div className="p-4">
              <h3 className="font-semibold text-white text-lg mb-2">{theme.name}</h3>
              <div className="flex gap-2 mb-3">
                <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                  {theme.template}
                </span>
                {theme.isPublic && (
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                    Public
                  </span>
                )}
              </div>
              
              {/* Palette de couleurs */}
              <div className="flex gap-1 mb-4">
                {[
                  theme.primaryColor,
                  theme.secondaryColor,
                  theme.accentColor,
                  theme.successColor,
                  theme.errorColor,
                ].map((color, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded border border-gray-700"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewTheme(theme)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                >
                  <Eye size={16} />
                  Voir
                </button>
                <button
                  onClick={() => handleEdit(theme.id!)}
                  className="flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDuplicate(theme.id!)}
                  className="flex items-center justify-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => handleDelete(theme.id!)}
                  className="flex items-center justify-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {themes.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Palette className="mx-auto text-gray-600 mb-4" size={64} />
            <p className="text-gray-400 text-lg">Aucun thème personnalisé</p>
            <p className="text-gray-500 mt-2">Créez votre premier thème pour commencer</p>
          </div>
        )}
      </div>

      {/* Customizer Modal */}
      {showCustomizer && (
        <ThemeCustomizer
          themeId={editingTheme}
          onSave={handleSave}
          onClose={() => {
            setShowCustomizer(false);
            setEditingTheme(undefined);
          }}
        />
      )}

      {/* Preview Modal */}
      {previewTheme && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewTheme(null)}
        >
          <div 
            className="max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-900 rounded-lg p-6 mb-4">
              <h2 className="text-2xl font-bold text-white mb-2">{previewTheme.name}</h2>
              <p className="text-gray-400">Template: {previewTheme.template}</p>
            </div>
            <ThemePreview theme={previewTheme} />
            <button
              onClick={() => setPreviewTheme(null)}
              className="mt-4 w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
