import { useState } from 'react';
import { GameSettings } from '../types';
import { Volume2, VolumeX, ShieldAlert, Check, RefreshCw, Trash2, X } from 'lucide-react';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  onClearHighScores: () => void;
  onClose: () => void;
  onBackToMenu?: () => void;
  inGame?: boolean;
}

export default function SettingsModal({
  settings,
  onUpdateSettings,
  onClearHighScores,
  onClose,
  onBackToMenu,
  inGame = false,
}: SettingsModalProps) {
  const [confirmClear, setConfirmClear] = useState(false);

  const toggleSound = () => {
    onUpdateSettings({
      ...settings,
      soundEnabled: !settings.soundEnabled,
    });
  };

  const setDifficulty = (diff: 'easy' | 'medium' | 'hard') => {
    onUpdateSettings({
      ...settings,
      difficulty: diff,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex flex-col items-center justify-start md:justify-center p-4 z-50 select-none overflow-y-auto overflow-x-hidden">
      <div className="w-full max-w-md glass-panel p-6 rounded-lg relative shadow-2xl flex flex-col gap-6 animate-scale-up my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-200/50 pb-3">
          <span className="material-symbols-outlined text-primary text-3xl">settings</span>
          <h2 className="font-headline text-2xl font-bold text-primary">Game Settings</h2>
        </div>

        {/* Audio Toggle */}
        <div className="flex items-center justify-between bg-white/40 p-4 rounded-xl border border-slate-100/50">
          <div>
            <div className="font-headline font-bold text-slate-800 text-base">Sound Effects</div>
            <div className="text-xs text-on-surface-variant">Pop notes, powerups, chimes</div>
          </div>
          <button
            onClick={toggleSound}
            className={`w-14 h-8 rounded-full p-1 transition-all duration-300 cursor-pointer ${
              settings.soundEnabled ? 'bg-primary flex-row-reverse' : 'bg-slate-300 flex-row'
            } flex items-center justify-between relative`}
          >
            <span className={`w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center`}>
              {settings.soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-primary" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              )}
            </span>
            <span className="sr-only">Toggle Sound</span>
          </button>
        </div>

        {/* Difficulty Selection */}
        <div className="flex flex-col gap-2">
          <div className="font-headline font-bold text-slate-800 text-sm">Game Difficulty</div>
          <div className="grid grid-cols-3 gap-2">
            {(['easy', 'medium', 'hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`py-2.5 rounded-xl border font-headline font-bold text-sm transition-all cursor-pointer capitalize flex items-center justify-center gap-1 ${
                  settings.difficulty === diff
                    ? 'bg-primary text-white border-primary shadow-sm scale-102'
                    : 'bg-white/40 text-slate-600 border-slate-200 hover:bg-white/80'
                }`}
              >
                {settings.difficulty === diff && <Check className="w-4 h-4" />}
                {diff}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            *Difficulty adjusts initial spawn speed, balloon acceleration rates, and maximum concurrent balloons on screen.
          </p>
        </div>

        {/* Danger Zone: Clear Highscores */}
        <div className="border-t border-slate-200/50 pt-4 flex flex-col gap-2">
          <div className="font-headline font-bold text-slate-800 text-sm">Danger Zone</div>
          {confirmClear ? (
            <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex flex-col gap-2.5">
              <div className="flex gap-2 text-red-700 text-xs items-start">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Are you sure? This will delete all saved high scores permanently.</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onClearHighScores();
                    setConfirmClear(false);
                  }}
                  className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs cursor-pointer"
                >
                  Yes, Clear All
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="py-2.5 border border-red-200/50 bg-red-50/50 hover:bg-red-50 text-red-600 rounded-xl font-headline font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Clear Leaderboard Records
            </button>
          )}
        </div>

        {/* Action button if in-game */}
        {inGame && onBackToMenu && (
          <button
            onClick={() => {
              onBackToMenu();
              onClose();
            }}
            className="w-full py-3 bg-secondary text-white rounded-xl font-headline font-bold text-sm shadow-md hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            <RefreshCw className="w-4 h-4" /> Quit to Main Menu
          </button>
        )}
      </div>
    </div>
  );
}
