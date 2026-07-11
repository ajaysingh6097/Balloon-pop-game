import { motion } from 'motion/react';
import { PopEffectData } from '../types';

interface PopParticlesProps {
  effects: PopEffectData[];
}

export default function PopParticles({ effects }: PopParticlesProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {effects.map((eff) => {
        // Generate random debris particles flying out
        const particleCount = 8;
        const particles = Array.from({ length: particleCount }).map((_, idx) => {
          const angle = (idx / particleCount) * 2 * Math.PI + (Math.random() * 0.4 - 0.2);
          const distance = 40 + Math.random() * 60;
          const targetX = Math.cos(angle) * distance;
          const targetY = Math.sin(angle) * distance;
          return { id: idx, x: targetX, y: targetY };
        });

        return (
          <div
            key={eff.id}
            style={{ left: eff.x, top: eff.y, position: 'absolute' }}
          >
            {/* Pop Expanding Circular Wave */}
            <motion.div
              initial={{ width: 10, height: 10, x: -5, y: -5, opacity: 1 }}
              animate={{ width: 120, height: 120, x: -60, y: -60, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="absolute border-4 rounded-full"
              style={{ borderColor: eff.color }}
            />

            {/* Exploding particles */}
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{ x: p.x, y: p.y, scale: 0.2, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.1, 0.8, 0.3, 1] }}
                className="absolute w-3 h-3 rounded-full"
                style={{ backgroundColor: eff.color }}
              />
            ))}

            {/* Floating Points Indicators */}
            {eff.pointsText && (
              <motion.div
                initial={{ y: -10, scale: 0.5, opacity: 0 }}
                animate={{ y: -65, scale: 1.1, opacity: [0, 1, 1, 0] }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="absolute -translate-x-1/2 whitespace-nowrap"
              >
                <span
                  className="font-headline font-bold text-lg select-none px-2 py-0.5 rounded-full bg-white/90 shadow-sm border border-black/5"
                  style={{ color: eff.color }}
                >
                  {eff.pointsText}
                </span>
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
}
