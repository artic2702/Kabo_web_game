/**
 * Agent 4: Integration Engineer
 * useMultiplayerState.js — Socket.IO-based game state for multiplayer
 *
 * Same API surface as useGameState but sends actions to server
 * and receives filtered state updates via WebSocket.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { getValidActions } from '../game/index.js';

// In production: connect to same host (server serves both frontend + WebSocket)
// In dev: connect to localhost:3001 (separate server process)
const SERVER_URL = import.meta.env.PROD
  ? window.location.origin
  : (import.meta.env.VITE_SERVER_URL || 'http://localhost:3001');

/**
 * Multiplayer game state hook.
 *
 * @returns {Object}
 * @property {Object|null} gameState - Current filtered game state
 * @property {Function} dispatch - Send action to server
 * @property {Object[]} events - Recent events
 * @property {string[]} validActions - Currently valid action types
 * @property {Object|null} socket - Socket.IO instance
 * @property {string} connectionStatus - 'disconnected' | 'connected' | 'reconnecting'
 * @property {string|null} roomCode - Current room code
 * @property {number|null} playerId - This player's ID
 * @property {Object[]} lobbyPlayers - Players in lobby
 * @property {boolean} isHost - Whether this player is the host
 * @property {Function} createRoom - (playerName) => Promise
 * @property {Function} joinRoom - (roomCode, playerName) => Promise
 * @property {Function} leaveRoom - () => void
 * @property {Function} setReady - (ready) => void
 * @property {Function} startGame - () => Promise (host only)
 * @property {Function} restartGame - () => void
 * @property {string|null} error - Last error message
 */
export function useMultiplayerState() {
  const socketRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [gameState, setGameState] = useState(null);
  const [events, setEvents] = useState([]);
  const [roomCode, setRoomCode] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [lobbyPlayers, setLobbyPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    const socket = io(SERVER_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      setConnectionStatus('connected');
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setConnectionStatus('disconnected');
    });

    socket.on('reconnect_attempt', () => {
      setConnectionStatus('reconnecting');
    });

    socket.on('reconnect', () => {
      setConnectionStatus('connected');
    });

    // Room events
    socket.on('room:player-joined', ({ players, newPlayer }) => {
      setLobbyPlayers(players);
    });

    socket.on('room:player-left', ({ players, leftPlayer }) => {
      setLobbyPlayers(players);
    });

    socket.on('room:player-ready', ({ players }) => {
      setLobbyPlayers(players);
    });

    // Game events
    socket.on('game:started', () => {
      setGameStarted(true);
    });

    socket.on('game:state-update', ({ state, events: newEvents }) => {
      setGameState(state);
      if (newEvents && newEvents.length > 0) {
        setEvents(prev => [...prev, ...newEvents]);
      }
    });

    socket.on('game:error', ({ message }) => {
      console.error('[Game Error]', message);
      setError(message);
      setTimeout(() => setError(null), 3000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Create room
  const createRoom = useCallback((playerName) => {
    return new Promise((resolve, reject) => {
      const socket = socketRef.current;
      if (!socket) { reject('No socket'); return; }

      socket.emit('room:create', { playerName }, (response) => {
        setRoomCode(response.roomCode);
        setPlayerId(response.playerId);
        setLobbyPlayers(response.players);
        setIsHost(true);
        setGameStarted(false);
        setGameState(null);
        resolve(response);
      });
    });
  }, []);

  // Join room
  const joinRoom = useCallback((code, playerName) => {
    return new Promise((resolve, reject) => {
      const socket = socketRef.current;
      if (!socket) { reject('No socket'); return; }

      socket.emit('room:join', { roomCode: code, playerName }, (response) => {
        if (response.success) {
          setRoomCode(response.roomCode);
          setPlayerId(response.playerId);
          setLobbyPlayers(response.players);
          setIsHost(false);
          setGameStarted(false);
          setGameState(null);
          resolve(response);
        } else {
          setError(response.error);
          reject(response.error);
        }
      });
    });
  }, []);

  // Leave room
  const leaveRoom = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit('room:leave');
    setRoomCode(null);
    setPlayerId(null);
    setLobbyPlayers([]);
    setIsHost(false);
    setGameState(null);
    setGameStarted(false);
    setEvents([]);
  }, []);

  // Set ready
  const setReady = useCallback((ready) => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit('room:ready', { ready });
  }, []);

  // Start game (host only)
  const startGame = useCallback(() => {
    return new Promise((resolve, reject) => {
      const socket = socketRef.current;
      if (!socket) { reject('No socket'); return; }

      socket.emit('room:start', {}, (response) => {
        if (response.success) {
          resolve(response);
        } else {
          setError(response.error);
          reject(response.error);
        }
      });
    });
  }, []);

  // Dispatch game action to server
  const dispatch = useCallback((action) => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit('game:action', action, (response) => {
      if (!response?.success) {
        console.warn('[Action rejected]', response?.error);
      }
    });
  }, []);

  // Restart game
  const restartGame = useCallback(() => {
    setGameState(null);
    setGameStarted(false);
    setEvents([]);
    // Reset ready state for all
    setLobbyPlayers(prev => prev.map(p => ({ ...p, ready: false })));
  }, []);

  // Clear events
  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  // Compute valid actions from the client-side state
  // (Server also validates, this is just for UI feedback)
  const validActions = gameState ? getValidActions(gameState) : [];

  return {
    gameState,
    dispatch,
    events,
    validActions,
    clearEvents,

    // Socket/connection
    socket: socketRef.current,
    connectionStatus,

    // Room
    roomCode,
    playerId,
    lobbyPlayers,
    isHost,
    gameStarted,

    // Room actions
    createRoom,
    joinRoom,
    leaveRoom,
    setReady,
    startGame,
    restartGame,

    // Error
    error,
  };
}
