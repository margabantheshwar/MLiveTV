
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { 
  Loader2, 
  AlertCircle, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings,
  Check
} from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title: string;
  autoPlay?: boolean;
}

interface QualityLevel {
  index: number;
  height: number;
  label: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title, autoPlay = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  // Player State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  // Quality State
  const [qualities, setQualities] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = Auto
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const controlTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Determine type
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');

  // --- Helpers ---

  const getEmbedUrl = (rawUrl: string) => {
    if (rawUrl.includes('embed/')) return rawUrl;
    if (rawUrl.includes('watch?v=')) return rawUrl.replace('watch?v=', 'embed/');
    if (rawUrl.includes('youtu.be/')) return rawUrl.replace('youtu.be/', 'youtube.com/embed/');
    return rawUrl;
  };

  const formatQualityLabel = (height: number) => {
    if (height >= 2160) return '4K';
    if (height >= 1440) return '2K';
    if (height >= 1080) return '1080p';
    if (height >= 720) return '720p';
    if (height >= 480) return '480p';
    if (height >= 360) return '360p';
    return `${height}p`;
  };

  // --- Interaction Handlers ---

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlTimeoutRef.current) clearTimeout(controlTimeoutRef.current);
    controlTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isSettingsOpen) setShowControls(false);
    }, 3000);
  };
  
  // Mobile Tap Handler
  const handleTap = (e: React.MouseEvent) => {
    // If clicking on specific controls, don't toggle
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
        return;
    }

    if (isSettingsOpen) {
        setIsSettingsOpen(false);
        return;
    }

    setShowControls(!showControls);
    if (!showControls) {
         if (controlTimeoutRef.current) clearTimeout(controlTimeoutRef.current);
         controlTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
         }, 3000);
    }
  };

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(e => console.error("Play failed", e));
      } else {
        videoRef.current.pause();
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const newMuted = !videoRef.current.muted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (newMuted) setVolume(0);
      else setVolume(1);
    }
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error("Error attempting to enable fullscreen:", err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  }, []);

  const changeQuality = (levelIndex: number) => {
    setCurrentQuality(levelIndex);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
    }
    setIsSettingsOpen(false);
  };

  // --- Effects ---

  // Handle Fullscreen change events (ESC key etc)
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Main Player Logic
  useEffect(() => {
    setLoading(true);
    setError(null);
    setQualities([]);
    setCurrentQuality(-1);
    
    if (isYouTube) {
      setLoading(false);
      return; 
    }

    const video = videoRef.current;
    if (!video) return;

    // Reset state
    video.volume = volume;
    video.muted = isMuted;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onLoaded = () => setLoading(false);
    const onError = () => {
      setError("Playback error. Stream might be offline.");
      setLoading(false);
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('loadeddata', onLoaded);
    video.addEventListener('error', onError);

    if (Hls.isSupported() && url.endsWith('.m3u8')) {
      if (hlsRef.current) hlsRef.current.destroy();
      
      const hls = new Hls({
        capLevelToPlayerSize: true, // Optimize initial quality
        autoStartLoad: true,
      });
      hlsRef.current = hls;

      hls.loadSource(url);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        const levels = data.levels.map((l, idx) => ({
          index: idx,
          height: l.height,
          label: formatQualityLabel(l.height)
        })).sort((a, b) => b.height - a.height); // Highest to lowest

        setQualities(levels);
        setLoading(false);
        if (autoPlay) video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
    } else {
      // Native Support (Safari/MP4)
      video.src = url;
      video.load();
      if (autoPlay) {
         const playPromise = video.play();
         if (playPromise !== undefined) {
            playPromise.catch(() => {
               // Autoplay prevented
            });
         }
      }
    }

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('loadeddata', onLoaded);
      video.removeEventListener('error', onError);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [url, isYouTube]);

  // --- Render ---

  if (isYouTube) {
    return (
      <div className="w-full bg-black md:rounded-xl overflow-hidden shadow-2xl aspect-video relative group">
        <iframe
          src={getEmbedUrl(url)}
          title={title}
          className="w-full h-full border-none"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="w-full bg-black md:rounded-xl overflow-hidden shadow-2xl relative aspect-video group select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={handleTap}
    >
      {/* Title Overlay (only when controls are visible) */}
      <div className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <h2 className="text-white font-bold text-lg drop-shadow-md truncate pr-8">{title}</h2>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 pointer-events-none">
          <Loader2 className="w-12 h-12 text-[#00d1ff] animate-spin" />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-30 text-center p-4">
          <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
          <p className="text-gray-300 text-sm">{error}</p>
        </div>
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
      />

      {/* Center Play Button (Big) - Show if paused or if controls visible on touch */}
      {(!isPlaying || showControls) && !loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className={`bg-black/40 backdrop-blur-sm p-4 rounded-full border border-white/20 shadow-xl transition-opacity duration-300 ${isPlaying ? 'opacity-0 md:opacity-0' : 'opacity-100'}`}>
             {isPlaying ? <Pause className="w-10 h-10 text-white fill-white" /> : <Play className="w-10 h-10 text-white fill-white translate-x-1" />}
          </div>
        </div>
      )}

      {/* Custom Control Bar */}
      <div 
        className={`absolute bottom-0 left-0 right-0 px-4 pb-4 pt-12 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-20 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex items-center gap-4">
          
          {/* Play/Pause */}
          <button onClick={togglePlay} className="text-white hover:text-[#00d1ff] transition-colors focus:outline-none p-1">
            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
          </button>

          {/* Volume Group - Hidden on small mobile to save space */}
          <div className="flex items-center gap-2 group/vol hidden sm:flex">
            <button onClick={toggleMute} className="text-white hover:text-[#00d1ff] transition-colors">
              {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
            <div className="w-0 overflow-hidden group-hover/vol:w-24 transition-all duration-300 ease-in-out flex items-center">
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#00d1ff]" 
              />
            </div>
          </div>

          {/* LIVE Badge */}
          <div className="flex items-center gap-2 px-2 py-1 bg-red-600/20 rounded border border-red-500/30 ml-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-500 text-[10px] md:text-xs font-bold tracking-wider">LIVE</span>
          </div>

          <div className="flex-1" />

          {/* Settings (Quality) */}
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(!isSettingsOpen); }}
              className={`text-white transition-colors p-2 rounded-full hover:bg-white/10 ${isSettingsOpen ? 'text-[#00d1ff] rotate-45' : ''}`}
            >
              <Settings size={22} />
            </button>
            
            {/* Settings Menu */}
            {isSettingsOpen && (
               <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#15181a]/95 backdrop-blur-md border border-gray-700 rounded-lg shadow-xl overflow-hidden animate-fade-in-up">
                  <div className="px-4 py-2 border-b border-gray-700 bg-white/5">
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quality</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto custom-scrollbar">
                    {qualities.length > 0 ? (
                      <>
                        <button 
                          onClick={() => changeQuality(-1)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#00d1ff]/20 text-gray-200 hover:text-white flex items-center justify-between"
                        >
                          <span>Auto</span>
                          {currentQuality === -1 && <Check size={14} className="text-[#00d1ff]" />}
                        </button>
                        {qualities.map((q) => (
                          <button
                            key={q.index}
                            onClick={() => changeQuality(q.index)}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#00d1ff]/20 text-gray-200 hover:text-white flex items-center justify-between"
                          >
                            <span>{q.label}</span>
                            {currentQuality === q.index && <Check size={14} className="text-[#00d1ff]" />}
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 italic">Auto only</div>
                    )}
                  </div>
               </div>
            )}
          </div>

          {/* Fullscreen */}
          <button onClick={toggleFullscreen} className="text-white hover:text-[#00d1ff] transition-colors p-2 rounded-full hover:bg-white/10">
            {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
