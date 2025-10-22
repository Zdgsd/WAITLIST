import React, { useState, useEffect, useRef } from 'react';

interface RadioWidgetProps {
  soundCloudUserId: string;
}

declare global {
  interface Window {
    SC: any;
  }
}

const RadioWidget: React.FC<RadioWidgetProps> = ({ soundCloudUserId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.7);
  const [tracks, setTracks] = useState<string[]>([]);
  const [showPlayer, setShowPlayer] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<any>(null);

  // Fetch tracks from SoundCloud channel
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        // In a real implementation, we would use the SoundCloud API
        // For now, we'll use a predefined list of tracks from the channel
        const trackUrls = [
          'https://soundcloud.com/ramy-ben-abdallah-667542423/abdou-bamba',
          'https://soundcloud.com/ramy-ben-abdallah-667542423/ta7iya-missaoui',
          'https://soundcloud.com/ramy-ben-abdallah-667542423/tunisie-2030',
          'https://soundcloud.com/ramy-ben-abdallah-667542423/tunisian-revolution-2',
          'https://soundcloud.com/ramy-ben-abdallah-667542423/faceless-1',
          'https://soundcloud.com/ramy-ben-abdallah-667542423/phenomena',
          'https://soundcloud.com/ramy-ben-abdallah-667542423/jawna-bh'
        ];
        setTracks(trackUrls);
      } catch (error) {
        console.error('Error fetching SoundCloud tracks:', error);
      }
    };

    fetchTracks();
  }, [soundCloudUserId]);

  // Load SoundCloud Widget API
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://w.soundcloud.com/player/api.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      // Widget API will be available globally
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const playRandomTrack = () => {
    if (tracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * tracks.length);
      const trackUrl = tracks[randomIndex];
      setCurrentTrack(trackUrl);
      setIsPlaying(true);
      setShowPlayer(true);
      
      // Create iframe for the track
      if (iframeRef.current) {
        const iframe = document.createElement('iframe');
        iframe.width = '100%';
        iframe.height = '166';
        iframe.scrolling = 'no';
        iframe.frameBorder = 'no';
        iframe.allow = 'autoplay';
        iframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&color=%2300ff66&auto_play=true&buying=false&sharing=false&download=false&show_artwork=false&show_playcount=false&show_user=false&single_active=true`;
        
        // Clear the previous iframe and append the new one
        if (iframeRef.current.firstChild) {
          iframeRef.current.removeChild(iframeRef.current.firstChild);
        }
        iframeRef.current.appendChild(iframe);
        
        // Initialize widget when iframe loads
        iframe.onload = () => {
          if (window.SC && iframe) {
            widgetRef.current = window.SC.Widget(iframe);
            
            // Bind events
            widgetRef.current.bind(window.SC.Widget.Events.PLAY, () => {
              setIsPlaying(true);
            });
            
            widgetRef.current.bind(window.SC.Widget.Events.PAUSE, () => {
              setIsPlaying(false);
            });
            
            widgetRef.current.bind(window.SC.Widget.Events.FINISH, () => {
              setIsPlaying(false);
            });
          }
        };
      }
    }
  };

  const togglePlayPause = () => {
    if (!currentTrack) {
      playRandomTrack();
    } else {
      if (widgetRef.current) {
        if (isPlaying) {
          widgetRef.current.pause();
        } else {
          widgetRef.current.play();
        }
      }
    }
  };

  const stopPlayback = () => {
    if (widgetRef.current) {
      widgetRef.current.pause();
    }
    setIsPlaying(false);
    setShowPlayer(false);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (widgetRef.current) {
      widgetRef.current.setVolume(newVolume * 100);
    }
  };

  // Generate bars for the equalizer visualization
  const generateEQBars = () => {
    return Array.from({ length: 15 }, (_, i) => (
      <div 
        key={i}
        className="w-1 bg-[var(--terminal-green)] mx-0.5 rounded-sm"
        style={{ 
          height: `${Math.floor(Math.random() * 30) + 5}px`,
          animation: `pulse ${0.5 + Math.random() * 1}s infinite alternate`
        }}
      ></div>
    ));
  };

  return (
    <div className="fixed top-4 right-16 z-[1002] flex space-x-2">
      {/* Play button - always visible */}
      <button
        onClick={() => {
          if (showPlayer) {
            togglePlayPause();
          } else {
            playRandomTrack();
          }
        }}
        className="p-2 transition-opacity hover:opacity-80"
        aria-label={isPlaying ? "Pause Radio" : "Play Radio"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[var(--terminal-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          {isPlaying ? (
            <>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </>
          ) : (
            <>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </>
          )}
        </svg>
      </button>
      
      {/* Expanded player */}
      {showPlayer && (
        <div className="bg-black/80 backdrop-blur-md border border-[var(--terminal-green)]/30 rounded-lg p-4 crt-terminal-box w-64 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--terminal-green)]/5 to-transparent" />
          <div className="absolute inset-0 pointer-events-none opacity-20" 
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(47, 221, 108, 0.1) 2px,
                rgba(47, 221, 108, 0.1) 4px
              )`
            }}
          />
          
          {/* Decorative elements */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full border-2 border-[var(--terminal-green)]/10"></div>
          <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full border-2 border-[var(--terminal-green)]/10"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[var(--terminal-green)] text-lg font-mono">SOUNDCLOUD RADIO</h3>
              <button 
                onClick={stopPlayback}
                className="p-1 text-gray-400 hover:text-[var(--terminal-green)]"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {/* Track info */}
            <div className="mb-4 h-8 flex items-center">
              {currentTrack ? (
                <div className="flex items-center w-full">
                  <div className="w-3 h-3 rounded-full bg-[var(--terminal-green)] mr-2 animate-pulse"></div>
                  <p className="text-white/90 text-sm truncate">
                    {currentTrack.split('/').pop()?.replace(/-/g, ' ')}
                  </p>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No track selected</p>
              )}
            </div>
            
            {/* Equalizer visualization */}
            <div className="flex items-end justify-center h-8 mb-4">
              {generateEQBars()}
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-center space-x-6 mb-4">
              <button 
                onClick={playRandomTrack}
                className="p-2 text-[var(--terminal-green)] hover:bg-[var(--terminal-green)] hover:text-black rounded-full border border-[var(--terminal-green)]/50 hover:border-[var(--terminal-green)] transition-all duration-200"
                aria-label="Next Track"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
                </svg>
              </button>
              
              <button 
                onClick={togglePlayPause}
                className="p-3 text-[var(--terminal-green)] hover:bg-[var(--terminal-green)] hover:text-black rounded-full border border-[var(--terminal-green)]/50 hover:border-[var(--terminal-green)] transition-all duration-200"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* Volume control */}
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--terminal-green)]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--terminal-green)]"
              />
            </div>
            
            {/* Hidden iframe container */}
            <div ref={iframeRef} className="hidden"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RadioWidget;