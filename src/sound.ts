/**
 * Web Audio API synthesizer for retro/arcade sound effects in Balloon Pop.
 * Self-contained, dynamic, and does not require external audio files.
 */

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function playPopSound(type: 'standard' | 'heavy' | 'spiky' | 'bomb' | 'golden') {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'standard') {
      // Clean bubble pop sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.start(now);
      osc.stop(now + 0.13);
    } else if (type === 'heavy') {
      // Deeper, punchier double pop
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.15);

      gainNode.gain.setValueAtTime(0.4, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'spiky') {
      // Sharper, snappy prick
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);

      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'golden') {
      // Chime-like shiny pop
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.12);

      // Add a secondary resonance oscillator for metal chime texture
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1200, now);
      osc2.frequency.exponentialRampToValueAtTime(2400, now + 0.15);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      gainNode.gain.setValueAtTime(0.25, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      gain2.gain.setValueAtTime(0.15, now);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.22);
      osc2.stop(now + 0.22);
    } else if (type === 'bomb') {
      // Low boom / explosion sound
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(30, now + 0.4);

      // Low pass filter to make it sound muffled and booming
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);

      osc.disconnect(gainNode);
      osc.connect(filter);
      filter.connect(gainNode);

      gainNode.gain.setValueAtTime(0.5, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

      osc.start(now);
      osc.stop(now + 0.5);
    }
  } catch (e) {
    console.warn('Audio play failure:', e);
  }
}

export function playZapSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Fast electrical sparks (lightning crack)
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = Math.random() > 0.5 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(200 + Math.random() * 800, now + i * 0.05);
      osc.frequency.exponentialRampToValueAtTime(50, now + i * 0.05 + 0.12);

      gainNode.gain.setValueAtTime(0.15, now + i * 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.12);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.13);
    }
  } catch (e) {
    console.warn('Zap audio failure:', e);
  }
}

export function playSlowMoSound(isActive: boolean) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;
    osc.type = 'sine';

    if (isActive) {
      // Cool wind down / pitch bend downwards
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);

      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    } else {
      // Wind up / release pitch bend upwards
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.4);

      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    }

    osc.start(now);
    osc.stop(now + 0.5);
  } catch (e) {
    console.warn('SlowMo audio failure:', e);
  }
}

export function playHeartLossSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.setValueAtTime(130, now + 0.1);
    osc.frequency.setValueAtTime(90, now + 0.2);

    gainNode.gain.setValueAtTime(0.4, now);
    gainNode.gain.linearRampToValueAtTime(0.01, now + 0.35);

    osc.start(now);
    osc.stop(now + 0.36);
  } catch (e) {
    console.warn('Heart Loss audio failure:', e);
  }
}

export function playLevelUpSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Star-like sparkling chime chord (pentatonic scale ascending)
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C major pentatonic
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      
      gainNode.gain.setValueAtTime(0.15, now + idx * 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.3);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.32);
    });
  } catch (e) {
    console.warn('Level up audio failure:', e);
  }
}

export function playGameOverSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Descending melancholy arpeggio
    const notes = [440.00, 392.00, 349.23, 293.66, 220.00]; // A min7 descending
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);

      gainNode.gain.setValueAtTime(0.2, now + idx * 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.15 + 0.5);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 0.55);
    });
  } catch (e) {
    console.warn('Game over audio failure:', e);
  }
}
