/**
 * LandingAnimation.jsx — Cinematic game intro sequence
 *
 * Full timeline:
 *   0.0s  → Dark screen
 *   0.8s  → Lamp ON sound + spotlight opens
 *   2.8s  → "KABO" title fades in on table
 *   4.8s  → Title fades out
 *   5.4s  → Cards thrown in + card slap sound
 *   7.2s  → Cards idle (interactive)
 *   click → Cards fall + navigate
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpotlightOverlay from './SpotlightOverlay';
import CardOption from './CardOption';
import '../styles/landing.css';

// ── Sound helpers (Web Audio API — no external files needed) ──
function playLampSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Click/switch sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
    // Hum
    setTimeout(() => {
      const hum = ctx.createOscillator();
      const humGain = ctx.createGain();
      hum.type = 'sine';
      hum.frequency.value = 60;
      humGain.gain.setValueAtTime(0.03, ctx.currentTime);
      humGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      hum.connect(humGain).connect(ctx.destination);
      hum.start();
      hum.stop(ctx.currentTime + 1.5);
    }, 50);
  } catch (e) { /* Audio not available */ }
}

function playCardSlap() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Short noise burst = card slap
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start();
  } catch (e) { /* Audio not available */ }
}

// ── Timeline phases ──
const PHASES = {
  DARK: 'dark',
  SPOTLIGHT: 'spotlight',
  TITLE: 'title',
  TITLE_FADE: 'title_fade',
  CARDS_ENTER: 'cards_enter',
  CARDS_IDLE: 'cards_idle',
  CARDS_EXIT: 'cards_exit',
  DONE: 'done',
};

// ── Timing (milliseconds) ──
const TIMING = {
  DARK_DURATION: 800,
  SPOTLIGHT_DURATION: 2000,
  TITLE_SHOW: 2000,
  TITLE_FADE: 600,
  CARDS_ENTER_DELAY: 600,
  CARDS_SETTLE: 1800,
  EXIT_DURATION: 800,
};

export default function LandingAnimation({ onComplete }) {
  const [phase, setPhase] = useState(PHASES.DARK);
  const [spotlightActive, setSpotlightActive] = useState(false);
  const [choice, setChoice] = useState(null);
  const timerRef = useRef(null);

  // ── Auto-advance timeline ──
  useEffect(() => {
    const schedule = (fn, ms) => {
      timerRef.current = setTimeout(fn, ms);
    };

    switch (phase) {
      case PHASES.DARK:
        schedule(() => {
          playLampSound();
          setSpotlightActive(true);
          setPhase(PHASES.SPOTLIGHT);
        }, TIMING.DARK_DURATION);
        break;

      case PHASES.SPOTLIGHT:
        schedule(() => setPhase(PHASES.TITLE), TIMING.SPOTLIGHT_DURATION);
        break;

      case PHASES.TITLE:
        schedule(() => setPhase(PHASES.TITLE_FADE), TIMING.TITLE_SHOW);
        break;

      case PHASES.TITLE_FADE:
        schedule(() => {
          playCardSlap();
          setPhase(PHASES.CARDS_ENTER);
        }, TIMING.TITLE_FADE);
        break;

      case PHASES.CARDS_ENTER:
        schedule(() => setPhase(PHASES.CARDS_IDLE), TIMING.CARDS_SETTLE);
        break;

      case PHASES.CARDS_EXIT:
        schedule(() => {
          setPhase(PHASES.DONE);
          onComplete?.(choice);
        }, TIMING.EXIT_DURATION);
        break;
    }

    return () => clearTimeout(timerRef.current);
  }, [phase, choice, onComplete]);

  // ── Card click handler ──
  const handleCardClick = useCallback(
    (selected) => {
      if (phase !== PHASES.CARDS_IDLE) return;
      setChoice(selected);
      setPhase(PHASES.CARDS_EXIT);
    },
    [phase]
  );

  // ── Derive card phase ──
  const cardPhase =
    phase === PHASES.CARDS_ENTER
      ? 'entering'
      : phase === PHASES.CARDS_IDLE
        ? 'idle'
        : phase === PHASES.CARDS_EXIT
          ? 'exiting'
          : 'hidden';

  const showCards = [
    PHASES.CARDS_ENTER,
    PHASES.CARDS_IDLE,
    PHASES.CARDS_EXIT,
  ].includes(phase);

  const showTitle = phase === PHASES.TITLE || phase === PHASES.TITLE_FADE;

  return (
    <div className="landing-stage">
      {/* Layer 1: Green felt table (always present, revealed by spotlight) */}
      <div className="table-felt" />

      {/* Layer 2: Faded vignette spotlight */}
      <SpotlightOverlay active={spotlightActive} />

      {/* Layer 3: KABO title */}
      <AnimatePresence>
        {showTitle && (
          <motion.div
            className="kabo-title-container"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
              exit: { duration: 0.5 },
            }}
          >
            <h1 className="kabo-title">KABO</h1>
            <div className="kabo-glow" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layer 4: Cards */}
      {showCards && (
        <div className="cards-container">
          <CardOption
            label="LOCAL PLAY"
            icon="🎲"
            desc="Same device"
            side="left"
            phase={cardPhase}
            delay={0}
            onClick={() => handleCardClick('local')}
          />
          <CardOption
            label="PLAY ONLINE"
            icon="🌐"
            desc="Join a room"
            side="right"
            phase={cardPhase}
            delay={0.15}
            onClick={() => handleCardClick('online')}
          />
        </div>
      )}
    </div>
  );
}
