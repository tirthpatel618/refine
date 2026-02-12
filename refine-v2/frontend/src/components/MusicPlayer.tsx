import { useState, useRef, useEffect, useCallback } from 'react';

const MUSIC_URL = '/music.mp3';

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(true);
  const [volume, setVolume] = useState(() => {
    const stored = localStorage.getItem('refine-volume');
    return stored ? parseFloat(stored) : 0.5;
  });
  const [showSlider, setShowSlider] = useState(false);

  useEffect(() => {
    const audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audio.volume = volume;
    audio.addEventListener('error', () => setAvailable(false));
    audio.addEventListener('canplaythrough', () => setAvailable(true));
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    localStorage.setItem('refine-volume', String(volume));
  }, [volume]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setPlaying(!playing);
  }, [playing]);

  // Waveform amplitude scales with volume when playing
  const amp = playing ? volume : 0;

  if (!available) return null;

  return (
    <div className="relative flex items-center">
      <button
        onClick={togglePlay}
        onMouseEnter={() => setShowSlider(true)}
        onMouseLeave={() => setShowSlider(false)}
        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
        title={playing ? 'Pause music' : 'Play music'}
      >
        <WaveformIcon amplitude={amp} />
      </button>

      {/* Volume slider */}
      {showSlider && playing && (
        <div
          className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50"
          onMouseEnter={() => setShowSlider(true)}
          onMouseLeave={() => setShowSlider(false)}
        >
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 accent-gray-900"
          />
        </div>
      )}
    </div>
  );
}

function WaveformIcon({ amplitude }: { amplitude: number }) {
  // 3 bars that scale height based on amplitude
  const bars = [0.5, 1, 0.65];
  const baseHeight = 3;
  const maxExtraHeight = 10;

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="text-gray-500">
      {bars.map((scale, i) => {
        const h = baseHeight + maxExtraHeight * scale * amplitude;
        const x = 2 + i * 5;
        const y = 8 - h / 2;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width="3"
            rx="1.5"
            height={h}
            fill="currentColor"
            className="transition-all duration-300"
          />
        );
      })}
    </svg>
  );
}
