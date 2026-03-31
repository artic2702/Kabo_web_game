/**
 * Agent 3: UI/UX Engineer
 * StartScreen.jsx — Start screen with local + online options
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
      <div className="start-container">
        <h1 className="start-title">KABO</h1>
        <p className="start-subtitle">Card Game</p>

        {/* Local Play */}
        <div className="player-selection">
          <label>Local Play — Number of Players</label>
          <div className="player-input-group">
            <button
              className="player-btn-minus"
              onClick={() => setPlayerCount(Math.max(GAME_CONFIG.MIN_PLAYERS, playerCount - 1))}
            >
              −
            </button>
            <input
              type="number"
              min={GAME_CONFIG.MIN_PLAYERS}
              max={GAME_CONFIG.MAX_PLAYERS}
              value={playerCount}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (val >= GAME_CONFIG.MIN_PLAYERS && val <= GAME_CONFIG.MAX_PLAYERS) {
                  setPlayerCount(val);
                }
              }}
              className="player-input"
            />
            <button
              className="player-btn-plus"
              onClick={() => setPlayerCount(Math.min(GAME_CONFIG.MAX_PLAYERS, playerCount + 1))}
            >
              +
            </button>
          </div>
        </div>

        <button className="btn-start" onClick={handleStartLocal}>
          Start Local Game
        </button>

        {/* Divider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          margin: '24px 0 20px',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ color: 'var(--color-text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* Online Play */}
        <button
          className="btn-start"
          onClick={onPlayOnline}
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
          }}
        >
          🌐 Play Online
        </button>

        <p className="game-info">
          Local: Take turns on the same device. Online: Create or join a room to play with friends!
        </p>
      </div>
    </div>
  );
}
