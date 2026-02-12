import { useState, useRef, useEffect, useCallback } from 'react';

const MUSIC_URL = '/music.mp3';
const BAR_W = 2;
const GAP = 3;
const STEP = BAR_W + GAP;
const LERP = 0.3;

// Focus on the interesting mid-range
const BIN_START = 0.24;  // skip bottom 24%
const BIN_END   = 0.65;  // skip top 35%

export default function MusicPlayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);
  const connectedRef = useRef(false);
  const smoothedRef = useRef<Float32Array | null>(null);

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(() => {
    const s = localStorage.getItem('refine-volume');
    return s ? parseFloat(s) : 0.5;
  });

  const volRef = useRef(volume);
  const playRef = useRef(playing);
  const draggingRef = useRef(false);
  const dragStartYRef = useRef(0);
  const dragStartVolRef = useRef(0);
  const dragDistRef = useRef(0);

  useEffect(() => { volRef.current = volume; }, [volume]);
  useEffect(() => { playRef.current = playing; }, [playing]);

  useEffect(() => {
    const audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = '';
      cancelAnimationFrame(rafRef.current);
      ctxRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    localStorage.setItem('refine-volume', String(volume));
  }, [volume]);

  const ensureAnalyser = useCallback(() => {
    if (connectedRef.current) return;
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.4;
    const src = ctx.createMediaElementSource(audioRef.current!);
    src.connect(analyser);
    analyser.connect(ctx.destination);
    ctxRef.current = ctx;
    analyserRef.current = analyser;
    connectedRef.current = true;
  }, []);

  // ---------- draw ----------
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) { rafRef.current = requestAnimationFrame(draw); return; }
    const c = canvas.getContext('2d');
    if (!c) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    c.clearRect(0, 0, w, h);
    const count = Math.floor(w / STEP);
    const analyser = analyserRef.current;
    const isPlaying = playRef.current;
    const vol = volRef.current;

    if (!smoothedRef.current || smoothedRef.current.length !== count) {
      smoothedRef.current = new Float32Array(count);
    }
    const sm = smoothedRef.current;

    if (isPlaying && analyser) {
      const freq = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(freq);
      const total = freq.length;
      const lo = Math.floor(total * BIN_START);
      const hi = Math.floor(total * BIN_END);
      const range = hi - lo;

      for (let i = 0; i < count; i++) {
        const idx = lo + Math.floor((i / count) * range);
        const raw = freq[idx] / 255;
        sm[i] += (raw - sm[i]) * LERP;
        const v = sm[i] * vol;
        const barH = Math.max(2, v * h * 0.95);
        const x = i * STEP;
        const y = (h - barH) / 2;
        const g = Math.round(180 - v * 80);
        c.fillStyle = `rgb(${g},${g},${g})`;
        c.fillRect(x, y, BAR_W, barH);
      }
    } else {
      for (let i = 0; i < count; i++) {
        sm[i] *= 0.93;
        const x = i * STEP;
        const s = Math.sin((i / count) * Math.PI * 6) * 0.3 + 0.5;
        const barH = 2 + s * 3;
        const y = (h - barH) / 2;
        c.fillStyle = 'rgb(209,213,219)';
        c.fillRect(x, y, BAR_W, barH);
      }
    }

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  // ---------- mouse ----------
  const onDown = useCallback((e: React.MouseEvent) => {
    draggingRef.current = true;
    dragStartYRef.current = e.clientY;
    dragStartVolRef.current = volRef.current;
    dragDistRef.current = 0;
    e.preventDefault();
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      dragDistRef.current += Math.abs(e.movementY);
      const dy = dragStartYRef.current - e.clientY;
      const v = Math.max(0, Math.min(1, dragStartVolRef.current + dy / 120));
      setVolume(v);
    };

    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      if (dragDistRef.current < 5) {
        const audio = audioRef.current;
        if (!audio) return;
        if (playRef.current) {
          audio.pause();
          setPlaying(false);
        } else {
          ensureAnalyser();
          if (ctxRef.current?.state === 'suspended') ctxRef.current.resume();
          audio.play().catch(() => {});
          setPlaying(true);
        }
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [ensureAnalyser]);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={onDown}
      className="h-8 w-full max-w-[240px] cursor-grab active:cursor-grabbing select-none"
      title={playing ? 'Click to pause \u00b7 Drag up/down for volume' : 'Click to play music'}
    />
  );
}
