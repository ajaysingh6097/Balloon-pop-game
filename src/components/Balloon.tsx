import React from 'react';
import { motion } from 'motion/react';
import { BalloonData } from '../types';

interface BalloonProps {
  key?: string;
  balloon: BalloonData;
  containerWidth: number;
  containerHeight: number;
  onPop: (id: string, clientX: number, clientY: number) => void;
}

export default function Balloon({
  balloon,
  containerWidth,
  containerHeight,
  onPop,
}: BalloonProps) {
  // Convert relative coordinates (x: 0-100%, y: 0-1.2 where 0 is bottom, 1 is top) to pixels
  const leftPx = (balloon.x / 100) * containerWidth;
  // Make sure we start below the screen
  const bottomMargin = 150; // extra padding for bottom spawn
  const topPx = containerHeight - (balloon.y * (containerHeight + bottomMargin)) + bottomMargin;

  // Horizontal waving based on sine wave
  const waveX = Math.sin(balloon.phase) * balloon.waveAmplitude;
  const finalLeft = leftPx + (waveX / 100) * containerWidth;

  // Let's constrain finalLeft to screen bounds so balloons don't float off-screen sideways
  const halfSize = balloon.size / 2;
  const clampedLeft = Math.max(halfSize, Math.min(containerWidth - halfSize, finalLeft));

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    onPop(balloon.id, e.clientX, e.clientY);
  };

  // Determine balloon styling based on type
  let balloonStyle = '';
  let specialDecoration = null;

  switch (balloon.type) {
    case 'heavy':
      balloonStyle = 'border-[5px] border-white/40 shadow-inner';
      specialDecoration = (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Hit count indicator */}
          <div className="bg-black/20 text-white rounded-full w-8 h-8 flex items-center justify-center font-headline font-bold text-sm backdrop-blur-xs">
            {balloon.hitsRemaining}
          </div>
        </div>
      );
      break;
    case 'spiky':
      balloonStyle = 'border-4 border-dashed border-white/60';
      specialDecoration = (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Inner star shape to look spiky */}
          <svg className="w-10 h-10 text-white/50 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      );
      break;
    case 'golden':
      balloonStyle = 'border-2 border-yellow-200 shadow-[0_0_20px_rgba(255,215,0,0.6)] animate-pulse';
      specialDecoration = (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-8 h-8 text-yellow-100 animate-spin" style={{ animationDuration: '6s' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </div>
      );
      break;
    case 'bomb':
      balloonStyle = 'border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]';
      specialDecoration = (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Skull and crossbones or fuse indicator */}
          <svg className="w-10 h-10 text-red-100 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
          </svg>
        </div>
      );
      break;
    default:
      balloonStyle = '';
  }

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: clampedLeft - halfSize,
        top: topPx - balloon.size,
        width: balloon.size,
        height: balloon.size * 1.3, // make it egg-shaped/oval
      }}
      className="balloon-shadow cursor-pointer z-10 touch-none"
      onPointerDown={handlePointerDown}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
    >
      {/* Real Balloon Body (Oval) */}
      <div
        className={`w-full h-full rounded-full relative flex flex-col justify-between overflow-visible transition-all duration-100 ${balloonStyle}`}
        style={{ backgroundColor: balloon.color }}
      >
        {/* Shiny Highlight */}
        <div className="absolute top-[12%] left-[15%] w-[25%] h-[15%] bg-white/40 rounded-full rotate-[-30deg]" />

        {/* Shiny Second Highlight for Golden/Special */}
        {(balloon.type === 'golden' || balloon.type === 'spiky') && (
          <div className="absolute bottom-[20%] right-[15%] w-[15%] h-[10%] bg-white/20 rounded-full" />
        )}

        {specialDecoration}

        {/* Balloon Knot/Tying Node at bottom */}
        <div
          className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-4 h-3"
          style={{
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: `8px solid ${balloon.color}`,
          }}
        />

        {/* Hanging String */}
        <div className="balloon-string" />
      </div>
    </motion.div>
  );
}
