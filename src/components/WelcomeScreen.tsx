import React from 'react';
import { motion } from 'motion/react';
import { GameMode, ScoreRecord, GameSettings } from '../types';
import {
  Play,
  Trophy,
  Volume2,
  VolumeX,
  Clock,
  Award,
  Heart,
  Smile,
  Palette,
  Wind,
  Sparkles,
  Settings,
} from 'lucide-react';

interface WelcomeScreenProps {
  onStartGame: (mode: GameMode) => void;
  highScores: ScoreRecord[];
  settings: GameSettings;
  onToggleSound: () => void;
  onOpenSettings: () => void;
}

export default function WelcomeScreen({
  onStartGame,
  highScores,
  settings,
  onToggleSound,
  onOpenSettings,
}: WelcomeScreenProps) {
  const modesList = [
    {
      id: 'endless' as GameMode,
      name: 'Endless Mode',
      desc: '3 Hearts. Speed rises continuously. Pop all, let nothing slip past!',
      icon: <Heart className="w-5 h-5 text-red-500 fill-red-400" />,
      colorClass: 'border-red-400/20 hover:border-red-400 bg-red-50/10 hover:bg-red-50/25',
      badge: 'Classic',
      badgeColor: 'bg-red-500',
    },
    {
      id: 'timeAttack' as GameMode,
      name: 'Time Attack',
      desc: '60s rush. Gold balloons add time (+3s), dangerous black bombs subtract (-5s)!',
      icon: <Clock className="w-5 h-5 text-blue-500" />,
      colorClass: 'border-blue-400/20 hover:border-blue-400 bg-blue-50/10 hover:bg-blue-50/25',
      badge: 'Speedy',
      badgeColor: 'bg-blue-500',
    },
    {
      id: 'levels' as GameMode,
      name: 'Level Challenge',
      desc: '15 Levels of popping trial. Achieve specific targets to unlock new balloons.',
      icon: <Award className="w-5 h-5 text-yellow-600" />,
      colorClass: 'border-yellow-400/20 hover:border-yellow-400 bg-yellow-50/10 hover:bg-yellow-50/25',
      badge: 'Campaign',
      badgeColor: 'bg-yellow-500',
    },
    {
      id: 'zen' as GameMode,
      name: 'Zen Relax',
      desc: 'No stress, no penalties, no bombs. Just calming pastel balloons and cozy pop tunes.',
      icon: <Smile className="w-5 h-5 text-emerald-500" />,
      colorClass: 'border-emerald-400/20 hover:border-emerald-400 bg-emerald-50/10 hover:bg-emerald-50/25',
      badge: 'Relaxing',
      badgeColor: 'bg-emerald-500',
    },
    {
      id: 'colorChase' as GameMode,
      name: 'Color Chase',
      desc: 'A target color rotates every 7 seconds. Pop that color for 3x score. Avoid others!',
      icon: <Palette className="w-5 h-5 text-purple-500" />,
      colorClass: 'border-purple-400/20 hover:border-purple-400 bg-purple-50/10 hover:bg-purple-50/25',
      badge: 'Focus',
      badgeColor: 'bg-purple-500',
    },
    {
      id: 'chaos' as GameMode,
      name: 'Chaos Storm',
      desc: 'Savage wind gusts blow balloons sideways! Insane spawn rates and heavy bombs.',
      icon: <Wind className="w-5 h-5 text-orange-500 animate-pulse" />,
      colorClass: 'border-orange-400/20 hover:border-orange-400 bg-orange-50/10 hover:bg-orange-50/25',
      badge: 'Extreme',
      badgeColor: 'bg-orange-500',
    },
  ];

  const getModeShortLabel = (mode: string) => {
    switch (mode) {
      case 'timeAttack':
        return 'Time';
      case 'colorChase':
        return 'Chase';
      case 'chaos':
        return 'Chaos';
      case 'zen':
        return 'Zen';
      default:
        return mode;
    }
  };

  return (
    <div className="h-screen w-full overflow-y-auto overflow-x-hidden px-4 md:px-6 py-10 flex flex-col items-center justify-start bg-gradient-to-b from-[#81cfff] to-[#f7f9fb] text-on-background select-none relative">
      
      {/* Decorative Interactive Background Clouds */}
      <motion.div
        animate={{ x: [-100, 1500] }}
        transition={{ duration: 75, repeat: Infinity, ease: 'linear' }}
        className="absolute top-16 left-0 opacity-15 pointer-events-none select-none"
      >
        <svg width="220" height="120" viewBox="0 0 220 120" fill="white">
          <path d="M50 80 A30 30 0 0 1 80 50 A40 40 0 0 1 150 40 A30 30 0 0 1 190 70 A25 25 0 0 1 170 110 L50 110 Z" />
        </svg>
      </motion.div>
      <motion.div
        animate={{ x: [1400, -200] }}
        transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-24 right-0 opacity-10 pointer-events-none select-none"
      >
        <svg width="280" height="150" viewBox="0 0 280 150" fill="white">
          <path d="M60 100 A35 35 0 0 1 100 60 A50 50 0 0 1 190 50 A40 40 0 0 1 240 90 A30 30 0 0 1 220 140 L60 140 Z" />
        </svg>
      </motion.div>

      {/* Header Bar */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-8 relative z-10">
        <div className="flex gap-2">
          <button
            onClick={onToggleSound}
            className="w-12 h-12 glass-panel rounded-full flex items-center justify-center text-primary hover:scale-110 active:scale-95 hover:bg-white transition-all shadow-md cursor-pointer"
            title={settings.soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
          >
            {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <button
            onClick={onOpenSettings}
            className="w-12 h-12 glass-panel rounded-full flex items-center justify-center text-primary hover:scale-110 active:scale-95 hover:bg-white transition-all shadow-md cursor-pointer"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
        <div className="glass-panel px-4 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold text-primary shadow-xs">
          <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
          <span>v1.5 Extended Client</span>
        </div>
      </div>

      {/* Hero Logo / Title */}
      <div className="flex flex-col items-center text-center max-w-xl mb-12 relative z-10">
        <motion.div
          animate={{
            y: [0, -18, 0],
            rotate: [0, 3, -3, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative mb-5 w-32 h-40 flex items-center justify-center"
        >
          {/* Main Display Balloon with Shiny Light reflection */}
          <div className="w-24 h-28 bg-gradient-to-tr from-[#fd4bb6] to-[#ffafd5] rounded-full relative shadow-xl flex flex-col justify-between overflow-visible">
            <div className="absolute top-[12%] left-[15%] w-[25%] h-[15%] bg-white/50 rounded-full rotate-[-30deg]" />
            <div className="absolute inset-0 flex items-center justify-center text-white text-4xl select-none">
              🎈
            </div>
            {/* Knot */}
            <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-3.5 h-2.5 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#fd4bb6]" />
            {/* Thread */}
            <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 w-[2px] h-6 bg-slate-700/30" />
          </div>

          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-3 -right-3 text-yellow-300"
          >
            <Sparkles className="w-6 h-6 drop-shadow-xs" />
          </motion.div>
        </motion.div>

        <h1 className="font-headline text-5xl md:text-6xl font-black tracking-tight text-[#00658d] drop-shadow-sm mb-3">
          Balloon Pop
        </h1>
        <p className="font-sans text-sm md:text-base text-slate-600 max-w-md font-medium leading-relaxed">
          An exuberant, physics-inspired arcade web game. Trigger power-ups, pop special elements, and compete for global records!
        </p>
      </div>

      {/* Bento Layout Board */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Side: Game Modes Grid (Lg - 7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-lg flex flex-col gap-5 shadow-lg border border-white/45">
          <div className="flex justify-between items-center border-b border-slate-200/50 pb-3">
            <h2 className="font-headline text-2xl font-black text-primary flex items-center gap-2">
              <Play className="w-5 h-5 fill-primary text-primary" /> Choose Your Adventure
            </h2>
            <span className="text-[10px] font-bold text-secondary uppercase bg-secondary-fixed px-2.5 py-0.5 rounded-full">
              6 Modes Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {modesList.map((m) => (
              <motion.button
                key={m.id}
                onClick={() => onStartGame(m.id)}
                whileHover={{ scale: 1.025, y: -2 }}
                whileTap={{ scale: 0.975 }}
                className={`text-left p-4 rounded-xl border flex flex-col justify-between items-start transition-all cursor-pointer relative overflow-hidden group shadow-xs ${m.colorClass}`}
              >
                {/* Floating shine indicator inside card */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full translate-x-6 -translate-y-6 group-hover:scale-150 transition-all duration-500" />
                
                <div className="w-full">
                  <div className="flex justify-between items-center w-full mb-2">
                    <div className="w-10 h-10 rounded-xl bg-white/80 shadow-xs flex items-center justify-center border border-white/40">
                      {m.icon}
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded-full ${m.badgeColor}`}>
                      {m.badge}
                    </span>
                  </div>
                  <h3 className="font-headline font-black text-slate-800 text-base mb-1">
                    {m.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-normal">
                    {m.desc}
                  </p>
                </div>

                <div className="w-full flex justify-end mt-4 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform items-center gap-0.5">
                  <span>Launch Mode</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Right Side: Balloon Spec Library & Records (Lg - 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Balloon Specs Bento */}
          <div className="glass-panel p-6 rounded-lg shadow-lg border border-white/45">
            <h2 className="font-headline text-lg font-black text-primary mb-4 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-lg">bubble_chart</span> Specs Library
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {/* Standard */}
              <div className="bg-white/40 border border-slate-100 p-2.5 rounded-xl flex flex-col items-center text-center shadow-xs">
                <div className="w-7 h-9 bg-[#00baff] rounded-full relative mb-1.5">
                  <div className="absolute top-[10%] left-[10%] w-[25%] h-[15%] bg-white/40 rounded-full" />
                </div>
                <span className="font-headline text-[11px] font-black text-slate-700">Standard</span>
                <span className="text-[9px] text-slate-500 font-mono font-bold mt-0.5">+100</span>
              </div>
              {/* Heavy */}
              <div className="bg-white/40 border border-slate-100 p-2.5 rounded-xl flex flex-col items-center text-center shadow-xs">
                <div className="w-9 h-11 bg-[#b5007d] border-2 border-white/35 rounded-full relative mb-1.5">
                  <div className="absolute top-[10%] left-[10%] w-[25%] h-[15%] bg-white/40 rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white">2x</div>
                </div>
                <span className="font-headline text-[11px] font-black text-slate-700">Heavy</span>
                <span className="text-[9px] text-slate-500 font-mono font-bold mt-0.5">+250</span>
              </div>
              {/* Spiky */}
              <div className="bg-white/40 border border-slate-100 p-2.5 rounded-xl flex flex-col items-center text-center shadow-xs">
                <div className="w-7 h-9 bg-[#cdac00] border-2 border-dashed border-white/50 rounded-full relative mb-1.5">
                  <div className="absolute top-[10%] left-[10%] w-[25%] h-[15%] bg-white/40 rounded-full" />
                </div>
                <span className="font-headline text-[11px] font-black text-slate-700">Spiky</span>
                <span className="text-[9px] text-slate-500 font-mono font-bold mt-0.5">+500</span>
              </div>
              {/* Golden */}
              <div className="bg-white/40 border border-slate-100 p-2.5 rounded-xl flex flex-col items-center text-center shadow-xs">
                <div className="w-7 h-9 bg-yellow-400 rounded-full relative mb-1.5 shadow-[0_0_8px_rgba(250,204,21,0.4)]">
                  <div className="absolute top-[10%] left-[10%] w-[25%] h-[15%] bg-white/40 rounded-full" />
                </div>
                <span className="font-headline text-[11px] font-black text-yellow-700">Golden</span>
                <span className="text-[9px] text-slate-500 font-mono font-bold mt-0.5">+1000</span>
              </div>
              {/* Bomb */}
              <div className="bg-white/40 border border-slate-100 p-2.5 rounded-xl flex flex-col items-center text-center col-span-2 shadow-xs">
                <div className="w-7 h-9 bg-slate-900 border border-red-500 rounded-full relative mb-1.5 flex items-center justify-center">
                  <div className="absolute top-[10%] left-[10%] w-[25%] h-[15%] bg-white/40 rounded-full" />
                  <span className="text-red-500 text-xs font-bold font-mono">☠</span>
                </div>
                <span className="font-headline text-[11px] font-black text-slate-700">Bomb Balloon</span>
                <span className="text-[9px] text-red-500 font-mono font-bold mt-0.5">-Heart / -5s</span>
              </div>
            </div>
          </div>

          {/* High Scores Board */}
          <div className="glass-panel p-6 rounded-lg shadow-lg border border-white/45 flex-1">
            <h2 className="font-headline text-lg font-black text-primary mb-3 flex items-center gap-1.5">
              <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Leaderboard Records
            </h2>
            {highScores.length === 0 ? (
              <div className="text-center py-5 bg-white/20 rounded-xl">
                <p className="text-xs text-slate-500 font-semibold">No scores registered yet. Claim 1st place!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[190px] overflow-y-auto pr-1">
                {highScores.slice(0, 5).map((record, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center px-4 py-2 bg-white/40 rounded-xl border border-slate-100/40 text-xs shadow-xs hover:bg-white/70 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                        index === 1 ? 'bg-slate-200 text-slate-800' :
                        index === 2 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="font-black text-slate-800">{record.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-slate-100 text-slate-500 uppercase tracking-widest scale-90">
                        {getModeShortLabel(record.mode)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-slate-500 text-[10px]">Lvl {record.level}</span>
                      <span className="font-black text-primary text-sm">{record.score.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
