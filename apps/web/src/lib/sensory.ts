"use client";

class SensoryManager {
  private static instance: SensoryManager;
  private audioEnabled: boolean = true;

  private constructor() {}

  static getInstance() {
    if (!SensoryManager.instance) {
      SensoryManager.instance = new SensoryManager();
    }
    return SensoryManager.instance;
  }

  setAudioEnabled(enabled: boolean) {
    this.audioEnabled = enabled;
  }

  playSfx(type: "POP" | "SUCCESS" | "TICK" | "NOTIFICATION" | "ERROR") {
    if (typeof window === "undefined" || !this.audioEnabled) return;

    const frequencies: Record<string, number> = {
      POP: 440,
      SUCCESS: 880,
      TICK: 220,
      NOTIFICATION: 660,
      ERROR: 110,
    };

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type === "SUCCESS" ? "triangle" : "sine";
    osc.frequency.setValueAtTime(frequencies[type] || 440, ctx.currentTime);
    
    if (type === "POP") {
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
    }

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  vibrate(pattern: number | number[] = 10) {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  }

  celebrate() {
    if (typeof window === "undefined") return;
    import("canvas-confetti").then((confetti) => {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti.default({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti.default({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    });
  }
}

export const sensory = SensoryManager.getInstance();
