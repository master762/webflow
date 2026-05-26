const STORAGE_KEY = "codelingo-sound-enabled";

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored !== "false";
}

export function setSoundEnabled(enabled: boolean) {
  localStorage.setItem(STORAGE_KEY, String(enabled));
}

export function playCyberWinSound() {
  if (typeof window === "undefined" || !isSoundEnabled()) return;

  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const playTone = (
      freq: number,
      start: number,
      duration: number,
      gain = 0.08,
    ) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, start);
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(gain, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    playTone(523.25, now, 0.12);
    playTone(659.25, now + 0.1, 0.12);
    playTone(783.99, now + 0.2, 0.2, 0.06);

    setTimeout(() => ctx.close(), 600);
  } catch {
    /* ignore autoplay restrictions */
  }
}

export function playCyberErrorSound() {
  if (typeof window === "undefined" || !isSoundEnabled()) return;

  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.15);
    g.gain.setValueAtTime(0.04, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
    setTimeout(() => ctx.close(), 300);
  } catch {
    /* ignore */
  }
}
