/**
 * Agent 2: Game Logic Engineer
 * rules.js — Game initialization
 */

import { createDeck } from './deck.js';
import { GAME_PHASES, TURN_PHASES, GAME_CONFIG } from './constants.js';

/**
 * Creates a fully initialized game state for the given player count.
 *
 * - Builds and shuffles a 52-card deck
 * - Deals CARDS_PER_PLAYER cards to each player
 * - Places one card face-up on the discard pile
 * - Sets game phase to 'setup' (peek phase)
 *
 * @param {number} playerCount - Number of players (2–5)
 * @returns {import('./types.js').GameState} Complete initial game state
 */
export function createInitialState(playerCount) {
  const count = Math.max(
    GAME_CONFIG.MIN_PLAYERS,
    Math.min(GAME_CONFIG.MAX_PLAYERS, playerCount)
  );

  const deck = createDeck();

  // Build player objects
  /** @type {import('./types.js').Player[]} */
  const players = [];
  for (let i = 0; i < count; i++) {
    players.push({
      id: i,
      name: `Player ${i + 1}`,
      hand: [],
      visible: Array(GAME_CONFIG.CARDS_PER_PLAYER).fill(false),
      peekedCards: [],
      revealed: false,
    });
  }

  // Deal cards round-robin
  for (let round = 0; round < GAME_CONFIG.CARDS_PER_PLAYER; round++) {
    for (const player of players) {
      if (deck.length > 0) {
        player.hand.push(deck.pop());
      }
    }
  }

  // First discard card
  const discard = deck.length > 0 ? [deck.pop()] : [];

  return {
    // Core collections
    players,
    deck,
    discard,

    // Turn management
    currentTurn: 0,
    turnPhase: TURN_PHASES.IDLE,
    drawnCard: null,
    drawnFrom: null,

    // Game phase
    gamePhase: GAME_PHASES.SETUP,
    peekPhasePlayer: 0,

    // Kabo
    kaboCalledBy: null,
    finalTurnPlayer: null,

    // Power-ups
    powerMode: null,
    powerState: null,

    // Stack rule
    stackRank: null,
    stackPhaseActive: false,
    stackEligiblePlayers: [],

    // Metadata
    eventLog: [],
    lastAction: 'Game initialized',
  };
}
