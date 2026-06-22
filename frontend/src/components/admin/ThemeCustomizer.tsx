import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Save, X, Copy, Palette, Type } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { ThemeConfig, ThemeTemplate } from '../../types/theme';
import { ThemePreview } from './ThemePreview';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AVAILABLE_FONTS = [
  { value: 'Inter', label: 'Inter (Default)' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Raleway', label: 'Raleway' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Nunito', label: 'Nunito' },
  { value: 'Ubuntu', label: 'Ubuntu' },
];

const FONT_SIZES = [
  { value: 'sm', label: 'Petit (14px)' },
  { value: 'base', label: 'Moyen (16px)' },
  { value: 'lg', label: 'Grand (18px)' },
];

interface ThemeCustomizerProps {
  themeId?: string;
  onSave?: (theme: ThemeConfig) => void;
  onClose?: () => void;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ 
  themeId, 
  onSave, 
  onClose 
}) => {
  const [templates, setTemplates] = useState<ThemeTemplate[]>([]);
  const [theme, setTheme] = useState<ThemeConfig>({
    name: 'Mon Thème Personnalisé',
    template: 'custom',
    primaryColor: '#8b5cf6',
    secondaryColor: '#ec4899',
    accentColor: '#3b82f6',
    backgroundColor: '#1f2937',
    textColor: '#f3f4f6',
    successColor: '#10b981',
    errorColor: '#ef4444',
    fontFamily: 'Inter',
    fontSize: 'base',
    isPublic: false,
  });
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
    if (themeId) {
      loadTheme(themeId);
    }
  }, [themeId]);

  const loadTemplates = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/themes/templates`);
      setTemplates(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error);
      toast.error('Impossible de charger les templates');
    }
  };

  const loadTheme = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/themes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTheme(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement du thème:', error);
      toast.error('Impossible de charger le thème');
    }
  };

  const applyTemplate = (template: ThemeTemplate) => {
    setTheme(prev => ({
      ...prev,
      ...template,
      template: template.template as ThemeConfig['template'],
      fontSize: template.fontSize as ThemeConfig['fontSize'],
      name: prev.name,
      id: prev.id,
    }));
    toast.success(`Template "${template.name}" appliqué`);
  };

  const updateColor = (field: keyof ThemeConfig, color: string) => {
    setTheme(prev => ({ ...prev, [field]: color }));
  };

  const handleSave = async () => {
    if (!theme.name.trim()) {
      toast.error('Veuillez donner un nom à votre thème');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      let savedTheme;
      if (themeId) {
        // Mise à jour
        const response = await axios.put(
          `${API_URL}/api/themes/${themeId}`,
          theme,
          { headers }
        );
        savedTheme = response.data;
        toast.success('Thème mis à jour avec succès');
      } else {
        // Création
        const response = await axios.post(
          `${API_URL}/api/themes`,
          theme,
          { headers }
        );
        savedTheme = response.data;
        toast.success('Thème créé avec succès');
      }

      if (onSave) {
        onSave(savedTheme);
      }
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde du thème');
    } finally {
      setLoading(false);
    }
  };

  const ColorPickerButton: React.FC<{
    label: string;
    field: keyof ThemeConfig;
    color: string;
  }> = ({ label, field, color }) => (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <div 
        className="w-full h-12 rounded-lg border-2 border-gray-600 cursor-pointer flex items-center justify-between px-3 hover:border-purple-500 transition-colors"
        onClick={() => setActiveColorPicker(activeColorPicker === field ? null : field as string)}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded border-2 border-gray-700"
            style={{ backgroundColor: color }}
          />
          <span className="font-mono text-sm">{color}</span>
        </div>
        <Palette size={20} className="text-gray-400" />
      </div>
      
      {activeColorPicker === field && (
        <div className="absolute z-50 mt-2 p-3 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
          <HexColorPicker 
            color={color} 
            onChange={(newColor) => updateColor(field, newColor)}
          />
          <input
            type="text"
            value={color}
            onChange={(e) => updateColor(field, e.target.value)}
            className="w-full mt-3 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono text-sm"
            placeholder="#000000"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Palette className="text-purple-500" size={28} />
            <h2 className="text-2xl font-bold text-white">
              {themeId ? 'Modifier le thème' : 'Créer un thème personnalisé'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="text-gray-400" size={24} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration */}
          <div className="space-y-6">
            {/* Nom du thème */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom du thème
              </label>
              <input
                type="text"
                value={theme.name}
                onChange={(e) => setTheme(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: Thème Corporate 2024"
              />
            </div>

            {/* Templates prédéfinis */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <Copy className="inline mr-2" size={16} />
                Templates prédéfinis
              </label>
              <div className="grid grid-cols-2 gap-2">
                {templates.map((template) => (
                  <button
                    key={template.template}
                    onClick={() => applyTemplate(template)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      theme.template === template.template
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                    }`}
                  >
                    <div className="flex gap-2 mb-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: template.primaryColor }} />
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: template.secondaryColor }} />
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: template.accentColor }} />
                    </div>
                    <div className="text-sm font-medium text-white">
                      {template.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Couleurs */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                🎨 Palette de couleurs
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <ColorPickerButton 
                  label="Couleur Primaire" 
                  field="primaryColor" 
                  color={theme.primaryColor} 
                />
                <ColorPickerButton 
                  label="Couleur Secondaire" 
                  field="secondaryColor" 
                  color={theme.secondaryColor} 
                />
                <ColorPickerButton 
                  label="Couleur Accent" 
                  field="accentColor" 
                  color={theme.accentColor} 
                />
                <ColorPickerButton 
                  label="Fond" 
                  field="backgroundColor" 
                  color={theme.backgroundColor} 
                />
                <ColorPickerButton 
                  label="Texte" 
                  field="textColor" 
                  color={theme.textColor} 
                />
                <ColorPickerButton 
                  label="Succès" 
                  field="successColor" 
                  color={theme.successColor} 
                />
                <ColorPickerButton 
                  label="Erreur" 
                  field="errorColor" 
                  color={theme.errorColor} 
                />
              </div>
            </div>

            {/* Typographie */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                <Type className="inline mr-2" size={20} />
                Typographie
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Police de caractères
                  </label>
                  <select
                    value={theme.fontFamily}
                    onChange={(e) => setTheme(prev => ({ ...prev, fontFamily: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  >
                    {AVAILABLE_FONTS.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Taille de police
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {FONT_SIZES.map((size) => (
                      <button
                        key={size.value}
                        onClick={() => setTheme(prev => ({ ...prev, fontSize: size.value as 'sm' | 'base' | 'lg' }))}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          theme.fontSize === size.value
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                        }`}
                      >
                        <div className="text-sm text-white">{size.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Options */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={theme.isPublic}
                  onChange={(e) => setTheme(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-700 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-300">
                  Partager publiquement (visible dans le marketplace)
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                <Save size={20} />
                {loading ? 'Enregistrement...' : themeId ? 'Mettre à jour' : 'Créer le thème'}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>

          {/* Prévisualisation */}
          <div className="lg:sticky lg:top-24 h-fit">
            <h3 className="text-lg font-semibold text-white mb-4">
              👀 Prévisualisation en direct
            </h3>
            <ThemePreview theme={theme} />
          </div>
        </div>
      </div>
    </div>
  );
};
