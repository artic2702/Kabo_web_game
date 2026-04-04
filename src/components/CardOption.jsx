/**
 * CardOption.jsx — Animated playing card for landing screen
 *
 * Uses Framer Motion for:
 * - Thrown in from off-screen with rotation
 * - 3D flip to reveal face
 * - Bounce landing
 * - Hover lift + scale
 * - Click → fall away
 */

import { motion } from 'framer-motion';

export default function CardOption({
  label,
  icon,
  desc,
  side = 'left',       // 'left' or 'right' — entry direction
  phase = 'hidden',     // 'hidden' | 'entering' | 'idle' | 'exiting'
  delay = 0,
  onClick,
}) {
  // ── Entry: thrown from off-screen with rotation ──
  const entryX = side === 'left' ? -800 : 800;
  const entryY = -600;
  const entryRotate = side === 'left' ? -35 : 35;

  // ── Variants for each phase ──
  const cardVariants = {
    hidden: {
      x: entryX,
      y: entryY,
      rotate: entryRotate,
      rotateY: 180,
      scale: 0.7,
      opacity: 0,
    },
    entering: {
      x: 0,
      y: 0,
      rotate: 0,
      rotateY: 0,
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 60,
        damping: 14,
        mass: 1.2,
        delay: delay,
        // Flip rotateY independently
        rotateY: {
          delay: delay + 0.5,
          duration: 0.6,
          ease: [0.34, 1.56, 0.64, 1],
        },
      },
    },
    idle: {
      x: 0,
      y: 0,
      rotate: 0,
      rotateY: 0,
      scale: 1,
      opacity: 1,
    },
    exiting: {
      y: 800,
      rotate: side === 'left' ? -20 : 20,
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.6,
        ease: [0.55, 0, 1, 0.45],
        delay: side === 'left' ? 0 : 0.1,
      },
    },
  };

  return (
    <motion.div
      className="card-option-wrapper"
      style={{ perspective: 1200 }}
      variants={cardVariants}
      initial="hidden"
      animate={phase}
      whileHover={
        phase === 'idle'
          ? {
              y: -20,
              scale: 1.08,
              transition: { type: 'spring', stiffness: 300, damping: 20 },
            }
          : undefined
      }
      whileTap={phase === 'idle' ? { scale: 0.95 } : undefined}
      onClick={phase === 'idle' ? onClick : undefined}
    >
      {/* Card shadow on table */}
      <motion.div
        className="card-table-shadow"
        animate={
          phase === 'idle'
            ? { opacity: 0.5, scaleX: 1 }
            : phase === 'exiting'
              ? { opacity: 0 }
              : { opacity: 0.3, scaleX: 0.8 }
        }
      />

      <div className="card-option-3d">
        {/* ── Back face ── */}
        <div className="card-face card-back">
          <img src="/cards/back.png" alt="Card back" draggable={false} />
        </div>

        {/* ── Front face ── */}
        <div className="card-face card-front">
          <div className="card-front-content">
            <span className="card-icon">{icon}</span>
            <span className="card-label">{label}</span>
            <span className="card-desc">{desc}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
