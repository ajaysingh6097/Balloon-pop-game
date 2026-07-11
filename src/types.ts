export type BalloonType = 'standard' | 'heavy' | 'spiky' | 'bomb' | 'golden';

export interface BalloonData {
  id: string;
  type: BalloonType;
  color: string;
  x: number; // percentage (0 - 100)
  y: number; // progress (0 to 1.2, where 1.2 is fully off screen)
  speed: number; // speed modifier per frame
  points: number;
  maxHits: number;
  hitsRemaining: number;
  size: number; // pixels
  phase: number; // offset for waving movement
  waveSpeed: number;
  waveAmplitude: number; // percentage offset
}

export type GameMode = 'endless' | 'timeAttack' | 'levels' | 'zen' | 'colorChase' | 'chaos';

export type GameState = 'welcome' | 'playing' | 'paused' | 'gameOver';

export interface PopEffectData {
  id: string;
  x: number; // viewport absolute px or percentage
  y: number;
  color: string;
  pointsText?: string;
}

export interface ScoreRecord {
  name: string;
  score: number;
  level: number;
  mode: GameMode;
  date: string;
}

export interface GameSettings {
  soundEnabled: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}
