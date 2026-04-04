/**
 * LandingAnimation.jsx — Cinematic game intro sequence
 *
 * Full timeline:
 *   0.0s  → Dark screen (extended atmosphere)
 *   1.5s  → Lamp sound plays + spotlight opens
 *   2.3s  → "KABO" title fades in on table
 *   4.3s  → Title fades out
 *   5.0s  → Cards thrown in + card_play sounds (both with stagger)
 *   6.8s  → Cards idle (interactive)
 *   click → Cards fall + navigate
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SpotlightOverlay from "./SpotlightOverlay";
import CardOption from "./CardOption";
import "../styles/landing.css";

// ── Sound helpers (audio files) ──
function playLampSound(canPlay) {
  if (!canPlay) {
    console.log("Audio not unlocked yet, skipping lamp sound");
    return;
  }
  try {
    const audio = new Audio("/lamp_sound.m4a");
    audio.volume = 0.8;
    audio.currentTime = 0;
    audio.play().then(() => console.log("Lamp sound playing")).catch((err) => console.warn("Lamp sound failed:", err.message));
  } catch (e) {
    console.warn("Lamp sound error:", e);
  }
}

function playCardSlap(canPlay) {
  if (!canPlay) {
    console.log("Audio not unlocked yet, skipping card sound");
    return;
  }
  try {
    const audio = new Audio("/card_play.m4a");
    audio.volume = 0.8;
    audio.currentTime = 0;
    audio.play().then(() => console.log("Card sound playing")).catch((err) => console.warn("Card sound failed:", err.message));
  } catch (e) {
    console.warn("Card sound error:", e);
  }
}

// ── Timeline phases ──
const PHASES = {
  DARK: "dark",
  SPOTLIGHT: "spotlight",
  TITLE: "title",
  TITLE_FADE: "title_fade",
  CARDS_ENTER: "cards_enter",
  CARDS_IDLE: "cards_idle",
  CARDS_EXIT: "cards_exit",
  DONE: "done",
};

// ── Timing (milliseconds) ──
const TIMING = {
  DARK_DURATION: 1500,
  SPOTLIGHT_DURATION: 2000,
  TITLE_SHOW: 2000,
  TITLE_FADE: 200,
  CARDS_ENTER_DELAY: 600,
  CARDS_SETTLE: 1800,
  EXIT_DURATION: 800,
};

export default function LandingAnimation({ onComplete }) {
  const [phase, setPhase] = useState(PHASES.DARK);
  const [spotlightActive, setSpotlightActive] = useState(false);
  const [choice, setChoice] = useState(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const timerRef = useRef(null);

  // ── Unlock audio on first user interaction ──
  useEffect(() => {
    const unlockAudio = () => {
      // Create a dummy audio context to unlock autoplay
      const audio = new Audio();
      audio.play().catch(() => {});
      setAudioUnlocked(true);
      console.log("Audio unlocked");
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("keydown", unlockAudio);
      document.removeEventListener("touchstart", unlockAudio);
    };

    document.addEventListener("click", unlockAudio);
    document.addEventListener("keydown", unlockAudio);
    document.addEventListener("touchstart", unlockAudio);

    return () => {
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("keydown", unlockAudio);
      document.removeEventListener("touchstart", unlockAudio);
    };
  }, []);

  // ── Auto-advance timeline ──
  useEffect(() => {
    // Don't start animation until audio is unlocked
    if (!audioUnlocked) {
      return;
    }

    const schedule = (fn, ms) => {
      timerRef.current = setTimeout(fn, ms);
    };

    switch (phase) {
      case PHASES.DARK:
        schedule(() => {
          playLampSound(audioUnlocked);
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
        // Play card sounds immediately as title fades (before cards animate in)
        playCardSlap(audioUnlocked);
        setTimeout(() => playCardSlap(audioUnlocked), 150);
        schedule(() => {
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
  }, [phase, choice, onComplete, audioUnlocked]);

  // ── Card click handler ──
  const handleCardClick = useCallback(
    (selected) => {
      if (phase !== PHASES.CARDS_IDLE) return;
      setChoice(selected);
      setPhase(PHASES.CARDS_EXIT);
    },
    [phase],
  );

  // ── Derive card phase ──
  const cardPhase =
    phase === PHASES.CARDS_ENTER
      ? "entering"
      : phase === PHASES.CARDS_IDLE
        ? "idle"
        : phase === PHASES.CARDS_EXIT
          ? "exiting"
          : "hidden";

  const showCards = [
    PHASES.CARDS_ENTER,
    PHASES.CARDS_IDLE,
    PHASES.CARDS_EXIT,
  ].includes(phase);

  const showTitle = phase === PHASES.TITLE || phase === PHASES.TITLE_FADE;

  return (
    <div className="landing-stage">
      {/* Audio unlock overlay - click to start */}
      {!audioUnlocked && (
        <div className="audio-overlay" onClick={() => setAudioUnlocked(true)}>
          <div className="audio-overlay-content">
            <p>🔊 Click anywhere to start</p>
          </div>
        </div>
      )}

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
            onClick={() => handleCardClick("local")}
          />
          <CardOption
            label="PLAY ONLINE"
            icon="🌐"
            desc="Join a room"
            side="right"
            phase={cardPhase}
            delay={0.15}
            onClick={() => handleCardClick("online")}
          />
        </div>
      )}
    </div>
  );
}
