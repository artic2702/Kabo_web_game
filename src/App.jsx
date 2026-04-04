/**
 * App.jsx — Root component with mode routing
 * Flow: landing → menu (StartScreen) or online (lobby) → game
 */

import { useState } from 'react';
import GameBoard from './components/GameBoard';
import MultiplayerGameBoard from './components/MultiplayerGameBoard';
import StartScreen from './components/StartScreen';
import LobbyScreen from './components/LobbyScreen';
import LandingAnimation from './components/LandingAnimation';
import { useMultiplayerState } from './hooks/useMultiplayerState';

export default function App() {
  const [mode, setMode] = useState('landing'); // 'landing' | 'menu' | 'local' | 'online'
  const [localPlayerCount, setLocalPlayerCount] = useState(null);

  const mp = useMultiplayerState();

  // Landing animation completed — route based on choice
  const handleLandingComplete = (choice) => {
    if (choice === 'online') {
      setMode('online');
    } else {
      setMode('menu'); // go to StartScreen for player count
    }
  };

  // Start local game
  const handleStartLocal = (playerCount) => {
    setLocalPlayerCount(playerCount);
    setMode('local');
  };

  // Go to online lobby
  const handlePlayOnline = () => {
    setMode('online');
  };

  // Back to landing
  const handleBackToLanding = () => {
    if (mp.roomCode) {
      mp.leaveRoom();
    }
    setMode('landing');
    setLocalPlayerCount(null);
  };

  // ── Landing Animation ──
  if (mode === 'landing') {
    return <LandingAnimation onComplete={handleLandingComplete} />;
  }

  // ── Menu / Start Screen (player count selection) ──
  if (mode === 'menu') {
    return (
      <StartScreen
        onStartLocal={handleStartLocal}
        onBack={handleBackToLanding}
      />
    );
  }

  // ── Local Play ──
  if (mode === 'local') {
    return <GameBoard initialPlayerCount={localPlayerCount} onBack={handleBackToLanding} />;
  }

  // ── Online Play ──
  if (mode === 'online') {
    // If game has started, show the multiplayer game board
    if (mp.gameStarted && mp.gameState) {
      return (
        <MultiplayerGameBoard
          mp={mp}
          onBack={handleBackToLanding}
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
        onBack={handleBackToLanding}
      />
    );
  }

  return null;
}
