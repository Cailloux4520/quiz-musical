import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import api from '../services/api';
import { 
  Upload, 
  Music, 
  Image as ImageIcon, 
  Trash2, 
  Search,
  X,
  Play,
  Pause,
  ArrowLeft
} from 'lucide-react';

interface Media {
  id: string;
  filename: string;
  filepath: string;
  url: string;
  type: 'audio' | 'image';
  format: string;
  size: number;
  duration?: number;
  createdAt: string;
}

interface MediaListResponse {
  media: Media[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export const MediaLibrary: React.FC = () => {
  const navigate = useNavigate();
  
  // État
  const [media, setMedia] = useState<Media[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'audio' | 'image'>('all');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});

  // Charger les médias
  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (searchTerm) params.search = searchTerm;
      if (typeFilter !== 'all') params.type = typeFilter;

      const response = await api.get<MediaListResponse>('/media', { params });
      setMedia(response.data.media);
      setTotal(response.data.total);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Erreur chargement médias:', error);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, typeFilter]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  // Upload fichiers
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    // Upload fichier par fichier
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validation côté client
      const isAudio = file.type.startsWith('audio/');
      const isImage = file.type.startsWith('image/');
      
      if (!isAudio && !isImage) {
        toast.error(`${file.name}: Format non supporté`);
        continue;
      }

      const maxSize = isAudio ? 20 * 1024 * 1024 : 5 * 1024 * 1024; // 20MB audio, 5MB image
      if (file.size > maxSize) {
        toast.error(`${file.name}: Fichier trop volumineux (max ${isAudio ? '20MB' : '5MB'})`);
        continue;
      }

      formData.append('file', file);

      try {
        await api.post('/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success(`✅ ${file.name} uploadé`);
      } catch (error: any) {
        toast.error(`Erreur upload ${file.name}: ${error.response?.data?.error || error.message}`);
      }

      formData.delete('file');
    }

    setUploading(false);
    loadMedia(); // Recharger la liste
  };

  // Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Supprimer média
  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce média ?')) return;

    try {
      await api.delete(`/media/${id}`);
      toast.success('🗑️ Média supprimé');
      loadMedia();
    } catch (error: any) {
      toast.error(`Erreur suppression: ${error.response?.data?.error || error.message}`);
    }
  };

  // Player audio
  const toggleAudio = (mediaId: string, url: string) => {
    if (playingAudio === mediaId) {
      // Pause
      audioElements[mediaId]?.pause();
      setPlayingAudio(null);
    } else {
      // Arrêter l'audio précédent
      if (playingAudio) {
        audioElements[playingAudio]?.pause();
      }

      // Créer ou récupérer l'élément audio
      let audio = audioElements[mediaId];
      if (!audio) {
        audio = new Audio(url);
        audio.addEventListener('ended', () => setPlayingAudio(null));
        setAudioElements({ ...audioElements, [mediaId]: audio });
      }

      audio.play();
      setPlayingAudio(mediaId);
    }
  };

  // Formater la taille
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Formater la durée
  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/admin')}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Retour
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">
              Médiathèque
            </h1>
          </div>
          <div className="text-sm text-gray-600">
            {total} média{total > 1 ? 's' : ''}
          </div>
        </div>

        {/* Zone d'upload */}
        <Card className="mb-6">
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept="audio/*,image/*"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            
            <Upload className="mx-auto mb-4 text-gray-400" size={48} />
            
            {uploading ? (
              <p className="text-lg font-semibold text-blue-600">Upload en cours...</p>
            ) : (
              <>
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Glissez vos fichiers ici ou cliquez pour parcourir
                </p>
                <p className="text-sm text-gray-500">
                  Audio: MP3, WAV, OGG (max 20MB) • Images: JPG, PNG, WEBP (max 5MB)
                </p>
              </>
            )}
          </div>
        </Card>

        {/* Filtres */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Rechercher par nom de fichier..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant={typeFilter === 'all' ? 'primary' : 'secondary'}
              onClick={() => { setTypeFilter('all'); setPage(1); }}
            >
              Tous
            </Button>
            <Button
              variant={typeFilter === 'audio' ? 'primary' : 'secondary'}
              onClick={() => { setTypeFilter('audio'); setPage(1); }}
              className="flex items-center gap-2"
            >
              <Music size={18} />
              Audio
            </Button>
            <Button
              variant={typeFilter === 'image' ? 'primary' : 'secondary'}
              onClick={() => { setTypeFilter('image'); setPage(1); }}
              className="flex items-center gap-2"
            >
              <ImageIcon size={18} />
              Images
            </Button>
          </div>
        </div>

        {/* Liste des médias */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : media.length === 0 ? (
          <Card className="text-center py-12 text-gray-500">
            {searchTerm || typeFilter !== 'all' ? 'Aucun média trouvé' : 'Aucun média uploadé'}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {media.map((item) => (
              <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow">
                {/* Preview */}
                <div className="mb-3 bg-gray-100 rounded-lg overflow-hidden h-48 flex items-center justify-center">
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.filename}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <Music className="mx-auto mb-2 text-blue-500" size={64} />
                      <button
                        onClick={() => toggleAudio(item.id, item.url)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        {playingAudio === item.id ? (
                          <>
                            <Pause size={18} />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play size={18} />
                            Écouter
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Infos */}
                <h3 className="font-semibold text-gray-800 mb-2 truncate" title={item.filename}>
                  {item.filename}
                </h3>
                
                <div className="text-sm text-gray-600 space-y-1 mb-3">
                  <div className="flex justify-between">
                    <span>Format:</span>
                    <span className="font-medium uppercase">{item.format}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taille:</span>
                    <span className="font-medium">{formatSize(item.size)}</span>
                  </div>
                  {item.type === 'audio' && (
                    <div className="flex justify-between">
                      <span>Durée:</span>
                      <span className="font-medium">{formatDuration(item.duration)}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <Button
                  variant="danger"
                  onClick={() => handleDelete(item.id)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Supprimer
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Précédent
            </Button>
            <span className="px-4 py-2 text-gray-700">
              Page {page} / {totalPages}
            </span>
            <Button
              variant="secondary"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Suivant
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
