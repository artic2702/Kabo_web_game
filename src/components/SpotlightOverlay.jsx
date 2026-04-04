/**
 * SpotlightOverlay.jsx — Faded gradient vignette spotlight
 *
 * Instead of a hard SVG mask, this uses a CSS radial gradient
 * that fades smoothly from transparent center → black edges.
 * Looks like an overhead lamp illuminating the table.
 */

import { motion } from 'framer-motion';

export default function SpotlightOverlay({ active = false }) {
  return (
    <>
      {/* Main dark layer — fades from full black to vignette gradient */}
      <motion.div
        className="spotlight-vignette"
        initial={{ opacity: 1 }}
        animate={{
          opacity: active ? 0 : 1,
        }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Gradient vignette — always present but fades in when spotlight is active */}
      <motion.div
        className="spotlight-gradient"
        initial={{ opacity: 0 }}
        animate={{
          opacity: active ? 1 : 0,
        }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </>
  );
}
