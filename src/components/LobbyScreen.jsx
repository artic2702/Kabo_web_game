/**
 * LobbyScreen.jsx — Online lobby with cinematic spotlight theme
 * Matches landing experience: dark stage + spotlight + green table
 * Handles: menu → create/join → waiting room flow
 */

import { useState } from 'react';
import '../styles/variables.css';
import '../styles/landing.css';

export default function LobbyScreen({
  roomCode,
  playerId,
  lobbyPlayers,
  isHost,
  connectionStatus,
  error,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  onReady,
  onStartGame,
  onBack,
}) {
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [view, setView] = useState('menu'); // 'menu' | 'lobby'
  const [joinMode, setJoinMode] = useState(false); // toggle join input

  // Derive ready state from SERVER data to prevent desync
  const myServerPlayer = lobbyPlayers.find(p => p.playerId === playerId);
  const isReady = myServerPlayer?.ready ?? false;

  const handleCreate = async () => {
    const name = playerName.trim() || 'Player';
    try {
      await onCreateRoom(name);
      setView('lobby');
    } catch (e) {
      console.error(e);
    }
  };

  const handleJoin = async () => {
    const name = playerName.trim() || 'Player';
    const code = joinCode.trim().toUpperCase();
    if (!code || code.length < 4) return;
    try {
      await onJoinRoom(code, name);
      setView('lobby');
    } catch (e) {
      console.error(e);
    }
  };

  const handleReady = () => {
    onReady(!isReady);
  };

  const handleLeave = () => {
    onLeaveRoom();
    setView('menu');
  };

  const allReady = lobbyPlayers.length >= 2 && lobbyPlayers.every(p => p.ready);

  const connDot = connectionStatus === 'connected' ? '🟢'
    : connectionStatus === 'reconnecting' ? '🟡' : '🔴';

  // ── Menu View: Name + Create/Join ──
  if (view === 'menu') {
    return (
      <div className="spotlight-page">
        <div className="table-felt" />

        <div className="table-content">
          <h2>🌐 Play Online</h2>
          <p>Enter your name to begin</p>

          {/* Name Input */}
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Your Name"
            maxLength={15}
            className="setup-input"
            autoFocus
          />

          {/* Join Code Input (toggled) */}
          {joinMode && (
            <div style={{ animation: 'contentFadeIn 0.3s ease' }}>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="XXXX"
                maxLength={4}
                className="setup-input setup-code-input"
                autoFocus
              />
            </div>
          )}

          {error && <p className="setup-error">⚠️ {error}</p>}

          {/* Action Buttons */}
          <div className="setup-actions">
            {!joinMode ? (
              <>
                <button className="setup-btn setup-btn-primary" onClick={handleCreate}>
                  🎯 Create Room
                </button>
                <button className="setup-btn setup-btn-secondary" onClick={() => setJoinMode(true)}>
                  🔗 Join Room
                </button>
              </>
            ) : (
              <>
                <button
                  className="setup-btn setup-btn-primary"
                  onClick={handleJoin}
                  disabled={joinCode.length < 4}
                >
                  ➜ Join Game
                </button>
                <button className="setup-btn setup-btn-secondary" onClick={() => setJoinMode(false)}>
                  ← Back
                </button>
              </>
            )}
          </div>

          <button className="setup-back" onClick={onBack}>
            ← Back to Menu
          </button>

          <div className="setup-status">
            {connDot} {connectionStatus}
          </div>
        </div>
      </div>
    );
  }

  // ── Lobby View: In room waiting ──
  return (
    <div className="spotlight-page">
      <div className="table-felt" />

      <div className="table-content table-content-room">
        <h2>🎮 Room {roomCode}</h2>
        <p>Waiting for players...</p>

        {/* Players List */}
        <div className="room-players-list">
          {lobbyPlayers.map((p) => (
            <div
              key={p.playerId}
              className={`room-player-item ${p.playerId === playerId ? 'is-me' : ''} ${p.ready ? 'is-ready' : ''}`}
            >
              <div className="room-player-avatar">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div className="room-player-details">
                <div className="room-player-name">
                  {p.name}
                  {p.playerId === playerId && <span className="tag-you">You</span>}
                  {p.playerId === 0 && <span className="tag-host">Host</span>}
                </div>
                <div className={`room-player-status ${p.ready ? 'status-ready' : ''}`}>
                  {p.ready ? '✅ Ready' : '⏳ Waiting'}
                </div>
              </div>
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: 5 - lobbyPlayers.length }).map((_, i) => (
            <div key={`empty-${i}`} className="room-player-item room-player-empty">
              <div className="room-player-avatar avatar-empty">?</div>
              <div className="room-player-details">
                <div className="room-player-name">Waiting...</div>
              </div>
            </div>
          ))}
        </div>

        {/* Copy room code */}
        <button
          className="setup-btn setup-btn-secondary"
          onClick={() => navigator.clipboard?.writeText(roomCode)}
        >
          📋 Copy Code: {roomCode}
        </button>

        {/* Actions */}
        <div className="setup-actions">
          <button
            className={`setup-btn ${isReady ? 'setup-btn-secondary' : 'setup-btn-primary'}`}
            onClick={handleReady}
          >
            {isReady ? '❌ Unready' : '✅ Ready'}
          </button>

          {isHost && (
            <button
              className="setup-btn setup-btn-primary"
              onClick={onStartGame}
              disabled={!allReady}
              style={{ opacity: allReady ? 1 : 0.4, cursor: allReady ? 'pointer' : 'not-allowed' }}
            >
              🚀 Start Game
            </button>
          )}

          <button className="setup-btn setup-btn-secondary" onClick={handleLeave}>
            🚪 Leave
          </button>
        </div>

        {!allReady && isHost && (
          <p className="setup-hint">All players must be ready before starting</p>
        )}

        <div className="setup-status">
          {connDot} {connectionStatus} · {lobbyPlayers.length}/5 players
        </div>
      </div>
    </div>
  );
}
