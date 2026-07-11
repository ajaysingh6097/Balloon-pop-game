import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GameMode, ScoreRecord } from '../types';
import { Trophy, RefreshCw, Home, Sparkles, Check, ChevronRight } from 'lucide-react';

interface GameOverScreenProps {
  score: number;
  level: number;
  mode: GameMode;
  balloonsPopped: number;
  onRestart: () => void;
  onBackToMenu: () => void;
  onSaveScore: (name: string) => void;
  isNewRecord: boolean;
}

export default function GameOverScreen({
  score,
  level,
  mode,
  balloonsPopped,
  onRestart,
  onBackToMenu,
  onSaveScore,
  isNewRecord,
}: GameOverScreenProps) {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  // Auto focus name input
  useEffect(() => {
    if (isNewRecord) {
      const input = document.getElementById('record-name-input');
      if (input) input.focus();
    }
  }, [isNewRecord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSaveScore(name.trim());
    setSaved(true);
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'endless':
        return 'Endless';
      case 'timeAttack':
        return 'Time Attack';
      case 'levels':
        return 'Level Challenge';
      case 'zen':
        return 'Zen Relax';
      case 'colorChase':
        return 'Color Chase';
      case 'chaos':
        return 'Chaos Storm';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#81cfff]/80 to-[#f7f9fb] backdrop-blur-sm z-50 select-none overflow-y-auto overflow-x-hidden">
      <div className="min-h-full w-full flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-md bg-white/95 border border-white/50 backdrop-blur-lg p-5 md:p-6 rounded-2xl shadow-2xl flex flex-col gap-5 items-center text-center">
        {/* Cup Chime Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 100 }}
          className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center text-white shadow-lg relative"
        >
          <Trophy className="w-10 h-10 fill-yellow-200" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -top-1 -right-1 text-yellow-300"
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
        </motion.div>

        {/* Header */}
        <div>
          <h2 className="font-headline text-3xl font-black text-primary mb-1">
            {mode === 'levels' && level >= 15 ? 'Victory!' : 'Game Over'}
          </h2>
          <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-500 uppercase tracking-widest">
            {getModeLabel()} Mode
          </span>
        </div>

        {/* High Score Celebration */}
        {isNewRecord && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-secondary/10 border border-secondary/20 px-4 py-2 rounded-full flex items-center gap-2 animate-bounce mt-1"
          >
            <Sparkles className="w-4 h-4 text-secondary animate-spin" />
            <span className="font-headline font-bold text-xs text-[#b5007d] uppercase tracking-wider">
              New Personal Record!
            </span>
            <Sparkles className="w-4 h-4 text-secondary animate-spin" />
          </motion.div>
        )}

        {/* Statistics Board */}
        <div className="w-full grid grid-cols-2 gap-3 bg-white/40 p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex flex-col items-center justify-center p-3 bg-white/55 rounded-xl border border-white">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Score</span>
            <span className="font-headline font-black text-2xl text-primary mt-1">{score.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-white/55 rounded-xl border border-white">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Balloons Popped</span>
            <span className="font-headline font-black text-2xl text-[#b5007d] mt-1">{balloonsPopped}</span>
          </div>
          <div className="col-span-2 flex justify-between items-center px-4 py-2.5 bg-white/55 rounded-xl border border-white text-xs">
            <span className="text-slate-500 font-bold">Max Level Reached:</span>
            <span className="font-headline font-black text-base text-yellow-600">Level {level}</span>
          </div>
        </div>

        {/* Score Saving Form */}
        {isNewRecord && !saved && (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2.5 border-t border-b border-slate-200/50 py-4">
            <div className="text-left">
              <label htmlFor="record-name-input" className="font-headline font-bold text-xs text-slate-700 block mb-1">
                Enter your name for the Leaderboard:
              </label>
              <div className="flex gap-2">
                <input
                  id="record-name-input"
                  type="text"
                  maxLength={15}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Player One"
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white/50 text-sm font-semibold text-slate-800"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-container text-white rounded-xl font-headline font-bold text-sm shadow-md flex items-center gap-1 cursor-pointer transition-colors"
                >
                  Save <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        )}

        {saved && (
          <div className="w-full py-2 bg-green-50 border border-green-200 rounded-xl text-green-700 font-headline font-bold text-xs flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4" /> Score successfully registered!
          </div>
        )}

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onRestart}
            className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-headline font-bold text-base shadow-md hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} /> Play Again
          </button>
          <button
            onClick={onBackToMenu}
            className="w-full py-3.5 bg-primary hover:bg-primary/95 text-white rounded-xl font-headline font-bold text-base shadow-md hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" /> Back to Main Menu
          </button>
        </div>
      </div>
    </div>
  </div>
);
}
