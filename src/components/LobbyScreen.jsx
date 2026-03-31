/**
 * LobbyScreen.jsx — Premium lobby for online multiplayer
 * Handles: menu → create/join → waiting room flow
 */

import { useState } from 'react';
import '../styles/lobby.css';

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
      <div className="lobby-screen">
        <div className="lobby-container">
          {/* Header */}
          <div className="lobby-header">
            <h1 className="lobby-logo">KABO</h1>
            <span className="lobby-badge">Online</span>
          </div>

          {/* Name Input */}
          <div className="lobby-field">
            <label className="lobby-label">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name..."
              maxLength={15}
              className="lobby-input"
              autoFocus
            />
          </div>

          {/* Join Code Input (toggled) */}
          {joinMode && (
            <div className="lobby-field join-field">
              <label className="lobby-label">Room Code</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ABCD"
                maxLength={4}
                className="lobby-input lobby-code-input"
                autoFocus
              />
            </div>
          )}

          {error && <p className="lobby-error">⚠️ {error}</p>}

          {/* Action Buttons */}
          <div className="lobby-actions-row">
            {!joinMode ? (
              <>
                <button className="lobby-btn-primary" onClick={handleCreate}>
                  <span className="btn-icon">🎯</span>
                  Create Room
                </button>
                <button className="lobby-btn-secondary" onClick={() => setJoinMode(true)}>
                  <span className="btn-icon">🔗</span>
                  Join Room
                </button>
              </>
            ) : (
              <>
                <button className="lobby-btn-primary" onClick={handleJoin} disabled={joinCode.length < 4}>
                  <span className="btn-icon">➜</span>
                  Join Game
                </button>
                <button className="lobby-btn-ghost" onClick={() => setJoinMode(false)}>
                  ← Back
                </button>
              </>
            )}
          </div>

          <button className="lobby-btn-ghost lobby-back-btn" onClick={onBack}>
            ← Back to Menu
          </button>

          <div className="lobby-conn">
            {connDot} {connectionStatus}
          </div>
        </div>
      </div>
    );
  }

  // ── Lobby View: In room waiting ──
  return (
    <div className="lobby-screen">
      <div className="lobby-container lobby-room">
        {/* Room Code Banner */}
        <div className="room-banner">
          <div className="room-banner-label">Room Code</div>
          <div className="room-banner-code">{roomCode}</div>
          <button
            className="room-copy-btn"
            onClick={() => navigator.clipboard?.writeText(roomCode)}
            title="Copy room code"
          >
            📋
          </button>
        </div>
        <p className="room-share-hint">Share this code with friends to join!</p>

        {/* Players */}
        <div className="room-players">
          {lobbyPlayers.map((p) => (
            <div
              key={p.playerId}
              className={`room-player ${p.playerId === playerId ? 'is-me' : ''} ${p.ready ? 'is-ready' : ''}`}
            >
              <div className="room-player-left">
                <div className={`room-player-avatar ${p.ready ? 'avatar-ready' : ''}`}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className="room-player-info">
                  <span className="room-player-name">
                    {p.name}
                    {p.playerId === playerId && <span className="tag tag-you">You</span>}
                    {p.playerId === 0 && <span className="tag tag-host">Host</span>}
                  </span>
                </div>
              </div>
              <div className={`room-player-status ${p.ready ? 'status-ready' : ''}`}>
                {p.ready ? '✅ Ready' : '⏳ Waiting'}
              </div>
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: 5 - lobbyPlayers.length }).map((_, i) => (
            <div key={`empty-${i}`} className="room-player room-player-empty">
              <div className="room-player-left">
                <div className="room-player-avatar avatar-empty">?</div>
                <span className="room-player-name empty-name">Waiting for player...</span>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="room-actions">
          <button
            className={`room-btn ${isReady ? 'room-btn-unready' : 'room-btn-ready'}`}
            onClick={handleReady}
          >
            {isReady ? '❌ Unready' : '✅ Ready Up'}
          </button>

          {isHost && (
            <button
              className="room-btn room-btn-start"
              onClick={onStartGame}
              disabled={!allReady}
            >
              🚀 Start Game
            </button>
          )}

          <button className="lobby-btn-ghost" onClick={handleLeave}>
            🚪 Leave Room
          </button>
        </div>

        {!allReady && isHost && (
          <p className="room-hint">All players must be ready before starting</p>
        )}

        <div className="lobby-conn">
          {connDot} {connectionStatus} · {lobbyPlayers.length}/5 players
        </div>
      </div>
    </div>
  );
}
