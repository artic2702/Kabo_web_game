/**
 * StartScreen.jsx — Premium landing page for Kabo
 * Two clear paths: Local Play and Online Multiplayer
 */

import { useState } from 'react';
import { GAME_CONFIG } from '../game/constants.js';
import '../styles/variables.css';
import '../styles/startscreen.css';

export default function StartScreen({ onStartLocal, onPlayOnline }) {
  const [playerCount, setPlayerCount] = useState(2);

  const handleStartLocal = () => {
    if (playerCount >= GAME_CONFIG.MIN_PLAYERS && playerCount <= GAME_CONFIG.MAX_PLAYERS) {
      onStartLocal(playerCount);
    }
  };

  return (
    <div className="start-screen">
      {/* Floating card decoration */}
      <div className="floating-cards" aria-hidden="true">
        <span className="float-card fc-1">🂡</span>
        <span className="float-card fc-2">🂮</span>
        <span className="float-card fc-3">🃏</span>
        <span className="float-card fc-4">🂫</span>
      </div>

      <div className="start-container">
        {/* Logo */}
        <div className="start-logo">
          <h1 className="start-title">KABO</h1>
          <div className="start-tagline">The Memory Card Game</div>
        </div>

        {/* Mode Cards */}
        <div className="mode-cards">
          {/* Local Mode */}
          <div className="mode-card mode-local" onClick={handleStartLocal}>
            <div className="mode-icon">🎲</div>
            <div className="mode-label">Local Play</div>
            <div className="mode-desc">Same device, take turns</div>
            <div className="mode-player-select" onClick={e => e.stopPropagation()}>
              <button
                className="mode-count-btn"
                onClick={() => setPlayerCount(Math.max(GAME_CONFIG.MIN_PLAYERS, playerCount - 1))}
              >−</button>
              <span className="mode-count">{playerCount}</span>
              <button
                className="mode-count-btn"
                onClick={() => setPlayerCount(Math.min(GAME_CONFIG.MAX_PLAYERS, playerCount + 1))}
              >+</button>
              <span className="mode-count-label">players</span>
            </div>
            <div className="mode-action">Start Game →</div>
          </div>

          {/* Online Mode */}
          <div className="mode-card mode-online" onClick={onPlayOnline}>
            <div className="mode-icon">🌐</div>
            <div className="mode-label">Play Online</div>
            <div className="mode-desc">Create or join a room</div>
            <div className="mode-feature-list">
              <span>🔗 Room codes</span>
              <span>⚡ Real-time</span>
            </div>
            <div className="mode-action">Play with Friends →</div>
          </div>
        </div>

        {/* Footer */}
        <div className="start-footer">
          <p>2–5 players • Lowest score wins • Memorize your cards!</p>
        </div>
      </div>
    </div>
  );
}
