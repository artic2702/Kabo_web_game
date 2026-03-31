/**
 * Agent 3: UI/UX Engineer
 * LobbyScreen.jsx — Create/join rooms for multiplayer
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
  const [view, setView] = useState('menu'); // 'menu' | 'create' | 'join' | 'lobby'
  const [isReady, setIsReady] = useState(false);

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
    if (!code) return;
    try {
      await onJoinRoom(code, name);
      setView('lobby');
    } catch (e) {
      console.error(e);
    }
  };

  const handleReady = () => {
    const newReady = !isReady;
    setIsReady(newReady);
    onReady(newReady);
  };

  const handleLeave = () => {
    onLeaveRoom();
    setView('menu');
    setIsReady(false);
  };

  const allReady = lobbyPlayers.length >= 2 && lobbyPlayers.every(p => p.ready);

  // ── Connection indicator ──
  const connDot = connectionStatus === 'connected'
    ? '🟢'
    : connectionStatus === 'reconnecting'
      ? '🟡'
      : '🔴';

  // ── Menu View ──
  if (view === 'menu') {
    return (
      <div className="lobby-screen">
        <div className="lobby-container">
          <h1 className="lobby-title">KABO</h1>
          <p className="lobby-subtitle">Online Multiplayer</p>

          <div className="lobby-name-input">
            <label>Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              maxLength={15}
              className="input-field"
            />
          </div>

          <div className="lobby-buttons">
            <button className="btn btn-primary lobby-btn" onClick={() => setView('create')}>
              🎯 Create Room
            </button>
            <button className="btn btn-success lobby-btn" onClick={() => setView('join')}>
              🔗 Join Room
            </button>
          </div>

          <button className="btn btn-ghost lobby-back" onClick={onBack}>
            ← Back to Menu
          </button>

          <div className="connection-status">
            {connDot} {connectionStatus}
          </div>
        </div>
      </div>
    );
  }

  // ── Create View ──
  if (view === 'create') {
    return (
      <div className="lobby-screen">
        <div className="lobby-container">
          <h2 className="lobby-heading">Create Room</h2>

          <div className="lobby-name-input">
            <label>Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              maxLength={15}
              className="input-field"
            />
          </div>

          <div className="lobby-buttons">
            <button className="btn btn-primary lobby-btn" onClick={handleCreate}>
              Create & Get Code
            </button>
            <button className="btn btn-ghost lobby-btn" onClick={() => setView('menu')}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Join View ──
  if (view === 'join') {
    return (
      <div className="lobby-screen">
        <div className="lobby-container">
          <h2 className="lobby-heading">Join Room</h2>

          <div className="lobby-name-input">
            <label>Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              maxLength={15}
              className="input-field"
            />
          </div>

          <div className="lobby-name-input">
            <label>Room Code</label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="ABCD"
              maxLength={4}
              className="input-field room-code-input"
            />
          </div>

          {error && <p className="lobby-error">❌ {error}</p>}

          <div className="lobby-buttons">
            <button className="btn btn-success lobby-btn" onClick={handleJoin}>
              Join Game
            </button>
            <button className="btn btn-ghost lobby-btn" onClick={() => setView('menu')}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Lobby View (in room, waiting) ──
  return (
    <div className="lobby-screen">
      <div className="lobby-container lobby-wide">
        <h2 className="lobby-heading">Game Lobby</h2>

        {/* Room code display */}
        <div className="room-code-display">
          <span className="room-code-label">Room Code</span>
          <span className="room-code-value">{roomCode}</span>
          <button
            className="btn btn-ghost copy-btn"
            onClick={() => navigator.clipboard?.writeText(roomCode)}
          >
            📋 Copy
          </button>
        </div>

        <p className="lobby-hint">Share this code with other players to join!</p>

        {/* Players list */}
        <div className="players-list">
          {lobbyPlayers.map((p) => (
            <div
              key={p.playerId}
              className={`player-item ${p.playerId === playerId ? 'you' : ''} ${p.ready ? 'ready' : ''}`}
            >
              <span className="player-item-name">
                {p.name}
                {p.playerId === playerId && <span className="you-badge">You</span>}
                {p.playerId === 0 && <span className="host-badge">Host</span>}
              </span>
              <span className={`ready-status ${p.ready ? 'is-ready' : ''}`}>
                {p.ready ? '✅ Ready' : '⏳ Waiting'}
              </span>
            </div>
          ))}
        </div>

        {error && <p className="lobby-error">❌ {error}</p>}

        {/* Actions */}
        <div className="lobby-actions">
          <button
            className={`btn ${isReady ? 'btn-danger' : 'btn-success'} lobby-btn`}
            onClick={handleReady}
          >
            {isReady ? '❌ Unready' : '✅ Ready'}
          </button>

          {isHost && (
            <button
              className="btn btn-kabo lobby-btn"
              onClick={onStartGame}
              disabled={!allReady}
            >
              🚀 Start Game
            </button>
          )}

          <button className="btn btn-ghost lobby-btn" onClick={handleLeave}>
            🚪 Leave Room
          </button>
        </div>

        {!allReady && isHost && (
          <p className="lobby-hint">All players must be ready before starting</p>
        )}

        <div className="connection-status">
          {connDot} {connectionStatus} · {lobbyPlayers.length}/5 players
        </div>
      </div>
    </div>
  );
}
