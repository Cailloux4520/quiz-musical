import React, { useState, useEffect } from 'react';
import { X, Search, Play, Pause, Music } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface Media {
  id: string;
  filename: string;
  filepath: string;
  url: string;
  type: 'audio' | 'image';
  format: string;
  size: number;
  duration?: number;
}

interface MediaSelectorProps {
  type: 'audio' | 'image' | 'all';
  onSelect: (media: Media) => void;
  onClose: () => void;
  selectedId?: string;
}

export const MediaSelector: React.FC<MediaSelectorProps> = ({
  type,
  onSelect,
  onClose,
  selectedId,
}) => {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioElements] = useState<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    loadMedia();
  }, [searchTerm, type]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 100 };
      if (searchTerm) params.search = searchTerm;
      if (type !== 'all') params.type = type;

      const response = await api.get('/media', { params });
      setMedia(response.data.media);
    } catch (error) {
      console.error('Erreur chargement médias:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAudio = (mediaId: string, url: string) => {
    if (playingAudio === mediaId) {
      audioElements[mediaId]?.pause();
      setPlayingAudio(null);
    } else {
      if (playingAudio) {
        audioElements[playingAudio]?.pause();
      }

      let audio = audioElements[mediaId];
      if (!audio) {
        audio = new Audio(url);
        audio.addEventListener('ended', () => setPlayingAudio(null));
        audioElements[mediaId] = audio;
      }

      audio.play();
      setPlayingAudio(mediaId);
    }
  };

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Sélectionner {type === 'audio' ? 'un audio' : type === 'image' ? 'une image' : 'un média'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Aucun média trouvé
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {media.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className={`
                    cursor-pointer border-2 rounded-lg p-3 transition-all hover:shadow-lg
                    ${selectedId === item.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                  `}
                >
                  {/* Preview */}
                  <div className="mb-2 bg-gray-100 rounded overflow-hidden h-32 flex items-center justify-center">
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt={item.filename}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <Music className="mx-auto text-blue-500" size={48} />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAudio(item.id, item.url);
                          }}
                          className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          {playingAudio === item.id ? (
                            <>
                              <Pause size={12} />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play size={12} />
                              Play
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <p className="text-sm font-medium truncate mb-1" title={item.filename}>
                    {item.filename}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span className="uppercase">{item.format}</span>
                    {item.type === 'audio' && (
                      <span>{formatDuration(item.duration)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
};
