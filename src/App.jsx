/**
 * App.jsx — Root component with mode routing
 * Handles switching between local play, online lobby, and multiplayer game
 */

import { useState } from 'react';
import GameBoard from './components/GameBoard';
import MultiplayerGameBoard from './components/MultiplayerGameBoard';
import StartScreen from './components/StartScreen';
import LobbyScreen from './components/LobbyScreen';
import { useMultiplayerState } from './hooks/useMultiplayerState';

export default function App() {
  const [mode, setMode] = useState('menu'); // 'menu' | 'local' | 'online'
  const [localPlayerCount, setLocalPlayerCount] = useState(null);

  const mp = useMultiplayerState();

  // Start local game
  const handleStartLocal = (playerCount) => {
    setLocalPlayerCount(playerCount);
    setMode('local');
  };

  // Go to online lobby
  const handlePlayOnline = () => {
    setMode('online');
  };

  // Back to menu
  const handleBackToMenu = () => {
    if (mp.roomCode) {
      mp.leaveRoom();
    }
    setMode('menu');
    setLocalPlayerCount(null);
  };

  // ── Menu / Start Screen ──
  if (mode === 'menu') {
    return (
      <StartScreen
        onStartLocal={handleStartLocal}
        onPlayOnline={handlePlayOnline}
      />
    );
  }

  // ── Local Play ──
  if (mode === 'local') {
    return <GameBoard initialPlayerCount={localPlayerCount} onBack={handleBackToMenu} />;
  }

  // ── Online Play ──
  if (mode === 'online') {
    // If game has started, show the multiplayer game board
    if (mp.gameStarted && mp.gameState) {
      return (
        <MultiplayerGameBoard
          mp={mp}
          onBack={handleBackToMenu}
        />
      );
    }

    // Otherwise show the lobby
    return (
      <LobbyScreen
        roomCode={mp.roomCode}
        playerId={mp.playerId}
        lobbyPlayers={mp.lobbyPlayers}
        isHost={mp.isHost}
        connectionStatus={mp.connectionStatus}
        error={mp.error}
        onCreateRoom={mp.createRoom}
        onJoinRoom={mp.joinRoom}
        onLeaveRoom={mp.leaveRoom}
        onReady={mp.setReady}
        onStartGame={mp.startGame}
        onBack={handleBackToMenu}
      />
    );
  }

  return null;
}
