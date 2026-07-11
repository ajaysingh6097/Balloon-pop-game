import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState, GameMode, BalloonData, PopEffectData, ScoreRecord, GameSettings } from './types';
import {
  playPopSound,
  playZapSound,
  playSlowMoSound,
  playHeartLossSound,
  playLevelUpSound,
  playGameOverSound,
  setSoundEnabled,
} from './sound';
import Balloon from './components/Balloon';
import PopParticles from './components/PopParticles';
import WelcomeScreen from './components/WelcomeScreen';
import SettingsModal from './components/SettingsModal';
import GameOverScreen from './components/GameOverScreen';
import {
  Pause,
  Settings,
  Heart,
  Volume2,
  VolumeX,
  RefreshCw,
  Zap,
  Sparkles,
  HelpCircle,
  Play,
  RotateCcw,
} from 'lucide-react';

// Balloon color library matching the high-vibrancy Pop-Art design system
const BALLOON_COLORS = [
  '#00baff', // Sky Blue
  '#fd4bb6', // Hot Pink
  '#cdac00', // Sunny Yellow
  '#ba1a1a', // Crimson/Red
  '#22c55e', // Lime Green
];

// Calming pastel palette for stress-free Zen Mode
const PASTEL_COLORS = [
  '#a5f3fc', // Soft Cyan
  '#fbcfe8', // Soft Pink
  '#fef08a', // Soft Yellow
  '#fca5a5', // Soft Red
  '#bbf7d0', // Soft Green
];

const getColorName = (color: string): string => {
  switch (color) {
    case '#00baff': return 'Sky Blue';
    case '#fd4bb6': return 'Hot Pink';
    case '#cdac00': return 'Sunny Yellow';
    case '#ba1a1a': return 'Crimson Red';
    case '#22c55e': return 'Lime Green';
    case '#a5f3fc': return 'Cozy Cyan';
    case '#fbcfe8': return 'Fluffy Pink';
    case '#fef08a': return 'Warm Yellow';
    case '#fca5a5': return 'Peach Red';
    case '#bbf7d0': return 'Mint Green';
    default: return 'Balloon';
  }
};

export default function App() {
  // Game state
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [gameMode, setGameMode] = useState<GameMode>('endless');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [hearts, setHearts] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [balloons, setBalloons] = useState<BalloonData[]>([]);
  const [popEffects, setPopEffects] = useState<PopEffectData[]>([]);
  const [balloonsPopped, setBalloonsPopped] = useState(0);

  // States for dynamic game modes
  const [targetColor, setTargetColor] = useState<string>('#00baff');
  const [colorTimer, setColorTimer] = useState<number>(7);
  const [windForce, setWindForce] = useState<number>(0); // Horizontal wind offset
  const [windState, setWindState] = useState<'left' | 'right' | 'none'>('none');
  const windChangeCounterRef = useRef<number>(0);

  // Level Clear notification state
  const [levelGoalProgress, setLevelGoalProgress] = useState(0);
  const [showLevelCleared, setShowLevelCleared] = useState(false);

  // Settings & Storage
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    difficulty: 'medium',
  });
  const [highScores, setHighScores] = useState<ScoreRecord[]>([]);
  const [isNewRecord, setIsNewRecord] = useState(false);

  // UI Modals
  const [showSettings, setShowSettings] = useState(false);

  // Powerups cooldowns & active states (in seconds)
  const [cooldownZap, setCooldownZap] = useState(0); // 0 = ready, positive is seconds left
  const [cooldownSlow, setCooldownSlow] = useState(0);
  const [isZapFlash, setIsZapFlash] = useState(false);
  const [isSlowed, setIsSlowed] = useState(false);

  // Container dimensions
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Timers and delta refs to handle smooth updates
  const spawnTimerRef = useRef<number>(0);
  const gameLoopRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const escapedIdsRef = useRef<Set<string>>(new Set());

  // Sync sounds state with our sound system helper
  useEffect(() => {
    setSoundEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Load High Scores and Settings on mount
  useEffect(() => {
    const storedScores = localStorage.getItem('balloon_pop_highscores');
    if (storedScores) {
      try {
        setHighScores(JSON.parse(storedScores));
      } catch (e) {
        console.error('Error loading high scores:', e);
      }
    }
    const storedSettings = localStorage.getItem('balloon_pop_settings');
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        setSettings(parsed);
        setSoundEnabled(parsed.soundEnabled);
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
  }, []);

  // Save Settings when changed
  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    localStorage.setItem('balloon_pop_settings', JSON.stringify(newSettings));
  };

  // Clear leaderboard records
  const handleClearHighScores = () => {
    localStorage.removeItem('balloon_pop_highscores');
    setHighScores([]);
  };

  // Resize listener
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Prevent 0 width/height issue
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [gameState]);

  // Goal targets per level in Levels Mode
  const getLevelGoal = (lvl: number) => {
    return 10 + lvl * 5; // Level 1: 15, Level 2: 20, etc.
  };

  // Compute spawn interval based on level & difficulty (in seconds)
  const getSpawnInterval = () => {
    if (gameMode === 'zen') return 1.4; // steady, relaxing spawn pace
    if (gameMode === 'chaos') return 0.55; // high intensity rapid spawns!

    let base = 1.6; // medium difficulty
    if (settings.difficulty === 'easy') base = 2.2;
    if (settings.difficulty === 'hard') base = 1.1;

    // Faster spawns at higher levels
    const levelFactor = Math.pow(0.92, level - 1);
    return Math.max(0.4, base * levelFactor);
  };

  // Speed factor based on level & difficulty
  const getSpeedFactor = () => {
    if (gameMode === 'zen') return 0.11; // leisurely 11% screen height per second
    if (gameMode === 'chaos') return 0.20; // naturally speedy gusts

    let base = 0.16; // 16% screen height per second
    if (settings.difficulty === 'easy') base = 0.11;
    if (settings.difficulty === 'hard') base = 0.22;

    const levelFactor = 1 + (level - 1) * 0.08;
    return base * levelFactor;
  };

  // Start a new game session
  const handleStartGame = (mode: GameMode) => {
    setGameMode(mode);
    setScore(0);
    setLevel(1);
    setBalloonsPopped(0);
    setLevelGoalProgress(0);
    setCooldownZap(0);
    setCooldownSlow(0);
    setIsSlowed(false);
    setIsZapFlash(false);
    setBalloons([]);
    setPopEffects([]);
    setIsNewRecord(false);

    // Mode-specific HUD initialization
    if (mode === 'endless' || mode === 'levels' || mode === 'chaos') {
      setHearts(3);
      setTimeLeft(0);
    } else if (mode === 'colorChase') {
      setHearts(3);
      setTimeLeft(0);
      const initialColor = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
      setTargetColor(initialColor);
      setColorTimer(7);
    } else if (mode === 'zen') {
      setHearts(999); // Placeholder for endless/infinite calm
      setTimeLeft(0);
    } else {
      // Time Attack
      setHearts(0);
      setTimeLeft(60);
    }

    // Reset chaos wind state
    setWindForce(0);
    setWindState('none');
    windChangeCounterRef.current = 0;

    setGameState('playing');
    lastTimeRef.current = performance.now();
    spawnTimerRef.current = 0;
  };

  // Pause toggle
  const togglePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
      lastTimeRef.current = performance.now();
    }
  };

  // Generate balloon data with unique properties
  const spawnBalloon = () => {
    // Decide type based on level
    const rand = Math.random();
    let type: BalloonData['type'] = 'standard';
    let hits = 1;
    let size = 96; // base size
    let color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
    let points = 100;

    if (gameMode === 'zen') {
      // Warm relaxing colors & peaceful non-bomb elements
      color = PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
      if (rand > 0.9) {
        type = 'golden';
        color = '#fbbf24'; // beautiful golden accent
        points = 1000;
        size = 90;
      } else if (rand > 0.78) {
        type = 'spiky';
        points = 500;
        size = 85;
      } else if (rand > 0.58) {
        type = 'heavy';
        hits = 2;
        size = 110;
        points = 250;
      }
    } else if (gameMode === 'chaos') {
      // Chaos mode has all active and intense elements from the get-go
      if (rand > 0.82) {
        type = 'golden';
        color = '#fbbf24';
        points = 1000;
        size = 90;
      } else if (rand > 0.6) {
        type = 'bomb';
        color = '#1e293b';
        points = -500;
        size = 80;
      } else if (rand > 0.45) {
        type = 'spiky';
        color = '#cdac00';
        points = 500;
        size = 85;
      } else if (rand > 0.25) {
        type = 'heavy';
        hits = 2;
        size = 110;
        points = 250;
      }
    } else if (gameMode === 'levels') {
      // Unlock new types based on level progress
      if (level >= 2 && rand > 0.8) {
        type = 'heavy';
        hits = 2;
        size = 110;
        points = 250;
      } else if (level >= 4 && rand > 0.65 && rand <= 0.8) {
        type = 'spiky';
        color = '#cdac00'; // Sunny Yellow
        points = 500;
        size = 85;
      } else if (level >= 6 && rand > 0.55 && rand <= 0.65) {
        type = 'bomb';
        color = '#1e293b'; // Slate charcoal/black
        points = -500; // Popping subtracts score
        size = 80;
      } else if (level >= 8 && rand > 0.48 && rand <= 0.55) {
        type = 'golden';
        color = '#fbbf24'; // Shiny Amber/Golden
        points = 1000;
        size = 90;
      }
    } else {
      // Endless, Color Chase, or Time Attack unlocks based on current score
      const milestone = score;
      if (milestone > 15000 && rand > 0.85) {
        type = 'golden';
        color = '#fbbf24';
        points = 1000;
        size = 90;
      } else if (milestone > 8000 && rand > 0.72) {
        type = 'bomb';
        color = '#1e293b';
        points = -500;
        size = 80;
      } else if (milestone > 4000 && rand > 0.58) {
        type = 'spiky';
        color = '#cdac00';
        points = 500;
        size = 85;
      } else if (milestone > 1500 && rand > 0.45) {
        type = 'heavy';
        hits = 2;
        size = 110;
        points = 250;
      }
    }

    // Set coordinates
    const newBalloon: BalloonData = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      color,
      x: 10 + Math.random() * 80, // percentage 10% to 90%
      y: -0.1, // starting just below screen bounds
      speed: (0.85 + Math.random() * 0.4) * getSpeedFactor(), // speed multiplier per second
      points,
      maxHits: hits,
      hitsRemaining: hits,
      size,
      phase: Math.random() * Math.PI * 2, // wave offset
      waveSpeed: 1.5 + Math.random() * 2, // wave frequency
      waveAmplitude: 3 + Math.random() * 5, // percentage offset amplitude
    };

    setBalloons((prev) => [...prev, newBalloon]);
  };

  // Pop handling trigger
  const handlePop = (id: string, clientX: number, clientY: number) => {
    if (gameState !== 'playing') return;

    setBalloons((prev) => {
      const matchIndex = prev.findIndex((b) => b.id === id);
      if (matchIndex === -1) return prev;

      const balloon = prev[matchIndex];

      // Play Pop Sound
      playPopSound(balloon.type);

      // Handle heavy double hits
      if (balloon.type === 'heavy' && balloon.hitsRemaining > 1) {
        const updated = [...prev];
        updated[matchIndex] = {
          ...balloon,
          hitsRemaining: balloon.hitsRemaining - 1,
          size: balloon.size * 0.85, // visual crunch
        };

        // Little text puff indicating "Hit!"
        createPopEffect(clientX, clientY, balloon.color, 'CRACK!');
        return updated;
      }

      // Complete Pop Action
      const updated = prev.filter((b) => b.id !== id);

      let pointsEarned = balloon.points;
      let scoreChangeText = `+${pointsEarned}`;

      if (balloon.type === 'bomb') {
        pointsEarned = -500;
        scoreChangeText = '-500';

        // Subtract heart or time (except Zen Mode)
        if (gameMode === 'timeAttack') {
          setTimeLeft((t) => Math.max(0, t - 5));
          scoreChangeText = '-5s / -500';
        } else if (gameMode === 'zen') {
          scoreChangeText = '-500'; // no life loss in Zen mode
        } else {
          setHearts((h) => {
            const next = h - 1;
            if (next <= 0) handleGameOver();
            return next;
          });
          playHeartLossSound();
        }
      } else {
        // Successful Non-bomb Pop
        setBalloonsPopped((cnt) => cnt + 1);

        // Color Chase specific combo or penalty
        if (gameMode === 'colorChase') {
          if (balloon.color === targetColor) {
            pointsEarned = balloon.points * 3;
            scoreChangeText = `COMBO x3! +${pointsEarned}`;
          } else {
            pointsEarned = -150;
            scoreChangeText = `WRONG COLOR! -150`;
          }
        }

        if (gameMode === 'levels') {
          setLevelGoalProgress((p) => {
            const next = p + 1;
            const target = getLevelGoal(level);
            if (next >= target) {
              triggerLevelClear();
            }
            return next;
          });
        }

        // Time Attack Bonus for Golden
        if (balloon.type === 'golden' && gameMode === 'timeAttack') {
          setTimeLeft((t) => Math.min(120, t + 3));
          scoreChangeText = '+3s / +1000';
        }
      }

      // Add points to Score
      setScore((s) => Math.max(0, s + pointsEarned));

      // Spawn pop particles
      createPopEffect(clientX, clientY, balloon.color, scoreChangeText);

      return updated;
    });
  };

  // Level Clear process
  const triggerLevelClear = () => {
    if (level >= 15) {
      // Completed last level! Game Won
      handleGameOver();
      return;
    }

    setGameState('paused');
    setShowLevelCleared(true);
    playLevelUpSound();

    // 2.5 seconds break before starting next level
    setTimeout(() => {
      setShowLevelCleared(false);
      setLevel((lvl) => {
        const nextLvl = lvl + 1;
        setLevelGoalProgress(0);
        return nextLvl;
      });
      setBalloons([]);
      setGameState('playing');
      lastTimeRef.current = performance.now();
    }, 2500);
  };

  // Pop visual overlays and score texts
  const createPopEffect = (x: number, y: number, color: string, text: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newEffect: PopEffectData = { id, x, y, color, pointsText: text };
    setPopEffects((prev) => [...prev, newEffect]);

    // Cleanup effect in 1s
    setTimeout(() => {
      setPopEffects((prev) => prev.filter((e) => e.id !== id));
    }, 1000);
  };

  // Flash Zap Powerup
  const activateZap = () => {
    if (cooldownZap > 0 || gameState !== 'playing') return;

    // Set full screen zap flash and trigger sounds
    setIsZapFlash(true);
    playZapSound();
    setTimeout(() => setIsZapFlash(false), 500);

    // Pop all non-bomb balloons on screen
    setBalloons((prev) => {
      let totalPops = 0;
      let pointsEarned = 0;

      prev.forEach((b) => {
        if (b.type !== 'bomb' && b.y > 0 && b.y < 1.0) {
          totalPops++;
          pointsEarned += b.points;

          // Virtual coordinates for particle burst (spread out across screen)
          const absX = (b.x / 100) * dimensions.width;
          const absY = dimensions.height - (b.y * dimensions.height);
          createPopEffect(absX, absY, b.color, `+${b.points}`);
        }
      });

      if (totalPops > 0) {
        setScore((s) => s + pointsEarned);
        setBalloonsPopped((cnt) => cnt + totalPops);

        if (gameMode === 'levels') {
          setLevelGoalProgress((p) => {
            const next = p + totalPops;
            const target = getLevelGoal(level);
            if (next >= target) {
              triggerLevelClear();
            }
            return next;
          });
        }
      }

      // Filter out balloons that got zapped
      return prev.filter((b) => b.type === 'bomb' || b.y <= 0 || b.y >= 1.0);
    });

    // Start 8 seconds cooldown
    setCooldownZap(8);
  };

  // Eco Bubble Powerup
  const activateSlow = () => {
    if (cooldownSlow > 0 || gameState !== 'playing') return;

    setIsSlowed(true);
    playSlowMoSound(true);

    // After 5s slow mo duration, restore
    setTimeout(() => {
      setIsSlowed(false);
      if (gameState === 'playing') playSlowMoSound(false);
    }, 5000);

    // Start 12 seconds cooldown
    setCooldownSlow(12);
  };

  // Game Over handling
  const handleGameOver = () => {
    setGameState('gameOver');
    playGameOverSound();

    // Check record
    setIsNewRecord(false);
    setScore((finalScore) => {
      const modeScores = highScores.filter((s) => s.mode === gameMode);
      const isRecord =
        finalScore > 0 &&
        (modeScores.length < 5 || finalScore > modeScores[modeScores.length - 1].score);
      setIsNewRecord(isRecord);
      return finalScore;
    });
  };

  // Save Name and Score to Local Storage
  const handleSaveScore = (name: string) => {
    const record: ScoreRecord = {
      name,
      score,
      level,
      mode: gameMode,
      date: new Date().toLocaleDateString(),
    };

    const nextScores = [...highScores, record]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Keep top 10

    setHighScores(nextScores);
    localStorage.setItem('balloon_pop_highscores', JSON.stringify(nextScores));
    setIsNewRecord(false);
  };

  // Main game play frame loops
  useEffect(() => {
    if (gameState !== 'playing') return;

    const frameUpdate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const elapsed = (timestamp - lastTimeRef.current) / 1000; // seconds
      lastTimeRef.current = timestamp;

      // 1. Spawning balloons timer ticking
      spawnTimerRef.current += elapsed;
      const currentInterval = getSpawnInterval();
      if (spawnTimerRef.current >= currentInterval) {
        spawnBalloon();
        spawnTimerRef.current = 0;
      }

      // 2. Physics & Motion update loop
      setBalloons((prev) => {
        let escapedCount = 0;

        // Clean up escapedIdsRef of stale IDs that are no longer in prev
        const currentIds = new Set(prev.map((b) => b.id));
        for (const id of Array.from(escapedIdsRef.current)) {
          if (!currentIds.has(id)) {
            escapedIdsRef.current.delete(id);
          }
        }

        const updated = prev
          .map((b) => {
            // Check if active Slow powerup slows rising speed
            const currentSpeed = isSlowed ? b.speed * 0.35 : b.speed;
            const nextY = b.y + currentSpeed * elapsed;

            // Apply horizontal wind force in Chaos Mode
            let nextX = b.x;
            if (gameMode === 'chaos') {
              const currentWind = isSlowed ? windForce * 0.35 : windForce;
              nextX = b.x + currentWind * elapsed;
              // Bouncing borders
              if (nextX < 8) nextX = 8;
              if (nextX > 92) nextX = 92;
            }

            // Update sine waving phase
            const waveFrequency = isSlowed ? b.waveSpeed * 0.5 : b.waveSpeed;
            const nextPhase = b.phase + waveFrequency * elapsed;

            return {
              ...b,
              x: nextX,
              y: nextY,
              phase: nextPhase,
            };
          })
          .filter((b) => {
            // Keep balloons unless they float off screen at top (y >= 1.15)
            if (b.y >= 1.15) {
              if (b.type !== 'bomb') {
                if (gameMode === 'colorChase') {
                  // Only lose health if a balloon of the active target color escapes!
                  if (b.color === targetColor) {
                    if (!escapedIdsRef.current.has(b.id)) {
                      escapedIdsRef.current.add(b.id);
                      escapedCount++;
                    }
                  }
                } else {
                  if (!escapedIdsRef.current.has(b.id)) {
                    escapedIdsRef.current.add(b.id);
                    escapedCount++;
                  }
                }
              }
              return false; // clean up
            }
            return true;
          });

        // Escaped balloons subtract life in all modes except Zen (at most 1 heart per tick)
        if (escapedCount > 0 && gameMode !== 'zen') {
          setHearts((h) => {
            const next = h - 1;
            if (next <= 0) {
              // Trigger Game Over inside setBalloons callback by async frame
              setTimeout(() => handleGameOver(), 0);
            }
            return Math.max(0, next);
          });
          playHeartLossSound();
        }

        return updated;
      });

      // Continue game loop
      gameLoopRef.current = requestAnimationFrame(frameUpdate);
    };

    gameLoopRef.current = requestAnimationFrame(frameUpdate);
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [gameState, level, isSlowed, gameMode, windForce, targetColor]);

  // Handle ticking down game timers and powerup cooldowns
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      // 1. Cooldowns tick down every second
      setCooldownZap((z) => Math.max(0, z - 1));
      setCooldownSlow((s) => Math.max(0, s - 1));

      // 2. Time Attack remaining ticking
      if (gameMode === 'timeAttack') {
        setTimeLeft((time) => {
          if (time <= 1) {
            handleGameOver();
            return 0;
          }
          return time - 1;
        });
      }

      // 3. Color Chase color-shift countdown
      if (gameMode === 'colorChase') {
        setColorTimer((t) => {
          if (t <= 1) {
            const remainingColors = BALLOON_COLORS.filter((c) => c !== targetColor);
            const nextColor = remainingColors[Math.floor(Math.random() * remainingColors.length)];
            setTargetColor(nextColor);
            return 7;
          }
          return t - 1;
        });
      }

      // 4. Chaos Mode Wind shifts
      if (gameMode === 'chaos') {
        windChangeCounterRef.current += 1;
        if (windChangeCounterRef.current >= 4) {
          windChangeCounterRef.current = 0;
          const coinFlip = Math.random();
          if (coinFlip < 0.35) {
            setWindState('left');
            setWindForce(-22 - Math.random() * 20); // blowing west
          } else if (coinFlip < 0.7) {
            setWindState('right');
            setWindForce(22 + Math.random() * 20); // blowing east
          } else {
            setWindState('none');
            setWindForce(0);
          }
        }
      }

      // 5. Score progression translates to Level ups (endless, chase, and chaos)
      if (gameMode === 'endless' || gameMode === 'colorChase' || gameMode === 'chaos') {
        setLevel((currentLvl) => {
          // Auto level-up every 3000 points
          const expectedLvl = Math.min(15, Math.floor(score / 3000) + 1);
          if (expectedLvl > currentLvl) {
            playLevelUpSound();
          }
          return expectedLvl;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, gameMode, score, targetColor]);

  // Keyboard shortcut listener to make game highly reactive and interactive on desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === ' ' || e.key.toLowerCase() === 'z') {
        e.preventDefault();
        activateZap();
      }
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        activateSlow();
      }
      if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        togglePause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, cooldownZap, cooldownSlow]);

  // Main UI router
  if (gameState === 'welcome') {
    return (
      <>
        <WelcomeScreen
          onStartGame={handleStartGame}
          highScores={highScores}
          settings={settings}
          onToggleSound={() =>
            handleUpdateSettings({
              ...settings,
              soundEnabled: !settings.soundEnabled,
            })
          }
          onOpenSettings={() => setShowSettings(true)}
        />
        {showSettings && (
          <SettingsModal
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onClearHighScores={handleClearHighScores}
            onClose={() => setShowSettings(false)}
            onBackToMenu={() => setGameState('welcome')}
            inGame={false}
          />
        )}
      </>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`h-screen w-screen relative select-none overflow-hidden font-sans transition-all duration-700 ${
        isSlowed ? 'bg-emerald-50/10' : ''
      }`}
      style={{
        background: isSlowed
          ? 'linear-gradient(180deg, #a7f3d0 0%, #f0fdf4 100%)'
          : 'linear-gradient(180deg, #81cfff 0%, #f7f9fb 100%)',
      }}
    >
      {/* Full screen Flash Overlay for Zap powerup */}
      {isZapFlash && <div className="absolute inset-0 bg-white z-40 zap-flash-overlay pointer-events-none" />}

      {/* Screen tint/overlay for Slow powerup */}
      {isSlowed && (
        <div className="absolute inset-0 pointer-events-none z-30 ring-32 ring-emerald-400/20 mix-blend-color-burn animate-pulse" />
      )}

      {/* HUD Top Bar */}
      <header className="fixed top-0 left-0 w-full z-40 px-6 py-4 flex justify-between items-start pointer-events-none">
        
        {/* Left HUD Panel: Score & Level info */}
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          <div className="glass-panel px-5 py-1.5 rounded-lg flex items-center gap-3">
            <span className="font-headline font-black text-xl md:text-2xl text-primary tracking-tight">
              Score: {score.toLocaleString()}
            </span>
          </div>
          <div className="bg-secondary px-3 py-1 rounded-full w-fit shadow-sm flex items-center gap-1">
            <span className="font-headline text-xs font-black text-white uppercase tracking-wider">
              Level {level}
            </span>
            {gameMode === 'levels' && (
              <span className="text-[10px] text-pink-100 font-mono">
                ({levelGoalProgress}/{getLevelGoal(level)})
              </span>
            )}
            {(gameMode === 'endless' || gameMode === 'colorChase' || gameMode === 'chaos') && (
              <span className="text-[9px] text-pink-100 font-sans font-black uppercase tracking-wider">
                (Progressive)
              </span>
            )}
          </div>
        </div>

        {/* Center HUD Panel: Health/Timer with Mode specific info overlays */}
        <div className="flex flex-col items-center gap-2 pointer-events-auto max-w-[260px] md:max-w-xs text-center">
          
          {/* Cute Active Mode Pill */}
          <div className="bg-white/90 backdrop-blur-md px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-700 shadow-sm border border-white flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            <span>
              {gameMode === 'timeAttack' ? 'Time Attack' :
               gameMode === 'colorChase' ? 'Color Chase' :
               gameMode === 'chaos' ? 'Chaos Storm' :
               gameMode === 'zen' ? 'Zen Relax' :
               gameMode === 'levels' ? 'Levels' : 'Endless'}
            </span>
          </div>

          {gameMode === 'timeAttack' ? (
            /* Time Attack Countdown */
            <div className={`glass-panel px-6 py-2 rounded-full flex items-center gap-2 font-headline font-black text-lg ${
              timeLeft <= 10 ? 'text-red-600 animate-bounce shadow-md' : 'text-primary'
            }`}>
              <span className="material-symbols-outlined text-xl">timer</span>
              <span>{timeLeft}s</span>
            </div>
          ) : gameMode === 'zen' ? (
            /* Zen Mode Calmness indicator */
            <div className="glass-panel px-5 py-1.5 rounded-full flex items-center gap-1.5 text-emerald-700 font-headline font-black text-xs shadow-sm bg-emerald-50/85">
              <span className="animate-spin text-sm">🌸</span>
              <span>Stress-Free Calm</span>
            </div>
          ) : (
            /* Endless/Levels/Chaos/Chase Hearts */
            <div className="glass-panel px-5 py-2 rounded-full flex gap-2">
              {[1, 2, 3].map((heart) => (
                <Heart
                  key={heart}
                  className={`w-5 h-5 transition-all duration-300 ${
                    heart <= hearts
                      ? 'text-red-500 fill-red-500 heart-pulse'
                      : 'text-slate-300 fill-slate-100 scale-90'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Color Chase HUD Overlay */}
          {gameMode === 'colorChase' && (
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="bg-white/95 border px-4 py-2 rounded-xl flex items-center gap-2.5 shadow-md border-slate-200 mt-1"
              style={{ borderColor: targetColor, boxShadow: `0 4px 12px ${targetColor}30` }}
            >
              <div className="w-4 h-4 rounded-full shadow-inner animate-pulse shrink-0" style={{ backgroundColor: targetColor }} />
              <div className="flex flex-col text-left">
                <span className="text-[8px] font-black uppercase text-slate-400 leading-none">Target Color</span>
                <span className="text-xs font-black text-slate-800 font-headline leading-tight">
                  POP {getColorName(targetColor).toUpperCase()}!
                </span>
              </div>
              <div className="ml-1 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-slate-600">
                {colorTimer}s
              </div>
            </motion.div>
          )}

          {/* Chaos Wind HUD Overlay */}
          {gameMode === 'chaos' && windState !== 'none' && (
            <div className="bg-white/95 border border-slate-200 px-3.5 py-1.5 rounded-xl flex items-center gap-2 shadow-md mt-1 animate-pulse">
              <span className="text-sm animate-bounce">🌪️</span>
              <div className="flex flex-col text-left">
                <span className="text-[8px] font-black uppercase text-slate-400 leading-none">Wind Force</span>
                <span className="text-xs font-black text-slate-800 font-headline leading-tight">
                  BLOWING {windState === 'left' ? 'WEST ⟵' : 'EAST ⟶'}
                </span>
              </div>
              <span className="text-[8px] font-mono font-black bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded uppercase leading-none">
                Active
              </span>
            </div>
          )}
        </div>

        {/* Right HUD Panel: Action Buttons */}
        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={togglePause}
            className="w-12 h-12 glass-panel rounded-full flex items-center justify-center text-primary hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer border border-white/20"
            title="Pause Game (P)"
          >
            {gameState === 'paused' ? <Play className="w-5 h-5 fill-primary" /> : <Pause className="w-5 h-5 fill-primary" />}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="w-12 h-12 glass-panel rounded-full flex items-center justify-center text-slate-600 hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer border border-white/20"
            title="Settings"
          >
            <span className="material-symbols-outlined text-xl">settings</span>
          </button>
        </div>
      </header>

      {/* Main Game Stage / Canvas */}
      <main className="relative w-full h-full overflow-hidden" id="game-canvas">
        {/* Render Floating Balloons */}
        {balloons.map((balloon) => (
          <Balloon
            key={balloon.id}
            balloon={balloon}
            containerWidth={dimensions.width}
            containerHeight={dimensions.height}
            onPop={handlePop}
          />
        ))}

        {/* Dynamic Pop Animation Particle Overlay */}
        <PopParticles effects={popEffects} />

        {/* Static decorative vector background clouds */}
        <div className="absolute top-[20%] left-[8%] w-48 h-12 bg-white/20 rounded-full blur-xs pointer-events-none" />
        <div className="absolute bottom-[35%] right-[10%] w-64 h-16 bg-white/15 rounded-full blur-xs pointer-events-none" />
      </main>

      {/* Bottom Tray for Power-ups */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex gap-6 items-end">
        {/* Flash Zap Power-up */}
        <div className="group relative flex flex-col items-center gap-1.5">
          <span className="font-headline font-bold text-[11px] text-primary bg-white/80 px-3 py-0.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Flash Zap (Spacebar)
          </span>
          <button
            onClick={activateZap}
            disabled={cooldownZap > 0 || gameState !== 'playing'}
            className={`relative w-20 h-20 glass-panel rounded-xl flex items-center justify-center overflow-hidden border-2 border-primary-container shadow-xl transition-all duration-200 ${
              cooldownZap > 0 ? 'opacity-80 scale-95' : 'hover:scale-110 active:scale-95 cursor-pointer'
            }`}
          >
            <Zap className={`w-9 h-9 ${cooldownZap > 0 ? 'text-slate-400' : 'text-primary'}`} />
            
            {/* Cooldown growing overlay */}
            {cooldownZap > 0 && (
              <div
                className="absolute bottom-0 left-0 w-full bg-black/30 transition-all duration-300 flex items-center justify-center font-mono font-bold text-xs text-white"
                style={{ height: `${(cooldownZap / 8) * 100}%` }}
              >
                <span>{cooldownZap}s</span>
              </div>
            )}
            <div className="absolute inset-0 border-t-2 border-white/40 pointer-events-none" />
          </button>
        </div>

        {/* Eco Bubble Slowdown Power-up */}
        <div className="group relative flex flex-col items-center gap-1.5">
          <span className="font-headline font-bold text-[11px] text-secondary bg-white/80 px-3 py-0.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Eco Bubble (B)
          </span>
          <button
            onClick={activateSlow}
            disabled={cooldownSlow > 0 || gameState !== 'playing'}
            className={`relative w-20 h-20 glass-panel rounded-xl flex items-center justify-center overflow-hidden border-2 border-secondary-container shadow-xl transition-all duration-200 ${
              cooldownSlow > 0 ? 'opacity-80 scale-95' : 'hover:scale-110 active:scale-95 cursor-pointer'
            }`}
          >
            <Sparkles className={`w-9 h-9 ${cooldownSlow > 0 ? 'text-slate-400' : 'text-secondary'}`} />
            
            {/* Cooldown growing overlay */}
            {cooldownSlow > 0 && (
              <div
                className="absolute bottom-0 left-0 w-full bg-black/30 transition-all duration-300 flex items-center justify-center font-mono font-bold text-xs text-white"
                style={{ height: `${(cooldownSlow / 12) * 100}%` }}
              >
                <span>{cooldownSlow}s</span>
              </div>
            )}
            <div className="absolute inset-0 border-t-2 border-white/40 pointer-events-none" />
          </button>
        </div>
      </nav>

      {/* PAUSE OVERLAY */}
      {gameState === 'paused' && !showLevelCleared && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-40">
          <div className="glass-panel p-8 rounded-lg shadow-2xl flex flex-col items-center text-center gap-5 max-w-sm w-full mx-6 animate-scale-up">
            <h2 className="font-headline text-3xl font-black text-primary">Game Paused</h2>
            <p className="text-sm text-slate-500">Take a deep breath. Press resume to continue popping!</p>
            <div className="flex flex-col gap-2.5 w-full">
              <button
                onClick={togglePause}
                className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-headline font-bold text-base shadow-md hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-white" /> Resume Game
              </button>
              <button
                onClick={() => setGameState('welcome')}
                className="w-full py-3.5 bg-primary hover:bg-primary/95 text-white rounded-xl font-headline font-bold text-base shadow-md hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Back to Main Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEVEL CLEARED OVERLAY */}
      <AnimatePresence>
        {showLevelCleared && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-primary-container/20 backdrop-blur-xs flex items-center justify-center z-40"
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -5 }}
              animate={{ scale: 1.1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 10 }}
              className="glass-panel p-8 rounded-lg shadow-2xl flex flex-col items-center text-center gap-4 max-w-md w-full mx-6"
            >
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-white text-3xl animate-bounce shadow-lg">
                🏆
              </div>
              <div>
                <h2 className="font-headline text-3xl font-black text-primary">Level Completed!</h2>
                <p className="text-sm font-semibold text-slate-500 mt-1">Get ready for Level {level + 1}</p>
              </div>
              <div className="text-xs text-slate-500 bg-white/50 border border-slate-100 px-4 py-2 rounded-xl mt-2 w-full font-medium">
                *The next level increases rising velocity and spawns spikier, heavier balloons!
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SETTINGS MODAL */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClearHighScores={handleClearHighScores}
          onClose={() => setShowSettings(false)}
          onBackToMenu={() => setGameState('welcome')}
          inGame={true}
        />
      )}

      {/* GAME OVER SCREEN */}
      {gameState === 'gameOver' && (
        <GameOverScreen
          score={score}
          level={level}
          mode={gameMode}
          balloonsPopped={balloonsPopped}
          onRestart={() => handleStartGame(gameMode)}
          onBackToMenu={() => setGameState('welcome')}
          onSaveScore={handleSaveScore}
          isNewRecord={isNewRecord}
        />
      )}
    </div>
  );
}
