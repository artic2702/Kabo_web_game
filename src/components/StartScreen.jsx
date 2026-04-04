/**
 * StartScreen.jsx — Offline Setup (player count selection)
 * Dark room + green felt table background
 */

import { GAME_CONFIG } from '../game/constants.js';
import '../styles/landing.css';

export default function StartScreen({ onStartLocal, onBack }) {
  const handleStart = (count) => {
    if (count >= GAME_CONFIG.MIN_PLAYERS && count <= GAME_CONFIG.MAX_PLAYERS) {
      onStartLocal(count);
    }
  };

  const playerOptions = [];
  for (let i = GAME_CONFIG.MIN_PLAYERS; i <= GAME_CONFIG.MAX_PLAYERS; i++) {
    playerOptions.push(i);
  }

  return (
    <div className="spotlight-page">
      <div className="table-felt" />

      <div className="table-content">
        <h2>Local Play</h2>
        <p>Select number of players</p>

        <div className="player-count-grid">
          {playerOptions.map((count) => (
            <button
              key={count}
              className="player-count-btn"
              onClick={() => handleStart(count)}
            >
              {count}
            </button>
          ))}
        </div>

        <button className="setup-back" onClick={onBack}>
          ← Back
        </button>
      </div>
    </div>
  );
}
