/**
 * Agent 4: Integration Engineer
 * useGameState.js — Main game state hook
 *
 * Wraps the pure gameReducer in React state management.
 * Provides dispatch, valid actions, and event access to components.
 */

import { useState, useCallback, useRef } from 'react';
import {
  gameReducer,
  createInitialState,
  getValidActions,
  ACTION_TYPES,
  GAME_PHASES,
} from '../game/index.js';

/**
 * Main game state hook.
 *
 * @returns {Object}
 * @property {import('../game/types.js').GameState|null} gameState
 * @property {Function} dispatch - dispatch({ type, payload })
 * @property {import('../game/types.js').GameEvent[]} events - Recent events
 * @property {string[]} validActions - Currently valid action types
 * @property {Function} startGame - (playerCount) => void
 * @property {Function} restartGame - () => void
 * @property {Function} clearEvents - () => void
 */
export function useGameState() {
  const [gameState, setGameState] = useState(null);
  const [events, setEvents] = useState([]);
  const eventHistoryRef = useRef([]);

  /**
   * Dispatch an action to the game engine.
   * Updates state and collects events.
   */
  const dispatch = useCallback((action) => {
    setGameState(currentState => {
      if (!currentState) return currentState;

      const result = gameReducer(currentState, action);

      // Collect events (using ref to avoid stale closure issues)
      if (result.events.length > 0) {
        eventHistoryRef.current = [...eventHistoryRef.current, ...result.events];
        // Use setTimeout to batch event state update separately from game state
        setTimeout(() => {
          setEvents(prev => [...prev, ...result.events]);
        }, 0);
      }

      return result.state;
    });
  }, []);

  /**
   * Start a new game with the given player count.
   */
  const startGame = useCallback((playerCount) => {
    const initialState = createInitialState(playerCount);
    setGameState(initialState);
    setEvents([]);
    eventHistoryRef.current = [];
  }, []);

  /**
   * Restart the game with the same player count.
   */
  const restartGame = useCallback(() => {
    setGameState(currentState => {
      if (!currentState) return currentState;
      const newState = createInitialState(currentState.players.length);
      setEvents([]);
      eventHistoryRef.current = [];
      return newState;
    });
  }, []);

  /**
   * Clear consumed events (after animations have played).
   */
  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  /**
   * Get currently valid action types.
   */
  const validActions = gameState ? getValidActions(gameState) : [];

  return {
    gameState,
    dispatch,
    events,
    validActions,
    startGame,
    restartGame,
    clearEvents,
  };
}
