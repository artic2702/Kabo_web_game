/**
 * Agent 2: Game Logic Engineer
 * types.js — JSDoc type definitions for the entire game
 *
 * This file contains NO executable code.
 * It exists purely for documentation and IDE autocompletion.
 */

/**
 * @typedef {Object} Card
 * @property {number|string} rank - 1–10, 'J', 'Q', 'K'
 * @property {string} suit - 'hearts' | 'diamonds' | 'spades' | 'clubs'
 * @property {number} value - Scoring value (see constants for mappings)
 * @property {string} id - Unique identifier: `${suit}_${rank}`
 */

/**
 * @typedef {Object} Player
 * @property {number} id - Zero-based player index
 * @property {string} name - Display name ('Player 1', etc.)
 * @property {Card[]} hand - Cards currently in hand
 * @property {boolean[]} visible - Per-card face-up state for the UI
 * @property {number[]} peekedCards - Indices of cards peeked during setup
 * @property {boolean} revealed - True once the game ends and cards are shown
 */

/**
 * @typedef {Object} PowerState
 * @property {{ playerId: number, cardIndex: number }|null} firstSelection
 *   Queen power: first card chosen for the swap (null if not yet selected)
 */

/**
 * @typedef {Object} GameEvent
 * @property {string} type - One of EVENT_TYPES
 * @property {Object} data - Event-specific payload
 * @property {number} timestamp - Date.now() when the event was created
 */

/**
 * @typedef {Object} GameState
 *
 * --- Core Collections ---
 * @property {Player[]} players
 * @property {Card[]} deck - Draw pile (last element = top)
 * @property {Card[]} discard - Discard pile (last element = top)
 *
 * --- Turn Management ---
 * @property {number} currentTurn - Active player index
 * @property {string} turnPhase - One of TURN_PHASES
 * @property {Card|null} drawnCard - Card drawn but not yet placed
 * @property {string|null} drawnFrom - 'deck' | 'discard' | null
 *
 * --- Game Phase ---
 * @property {string} gamePhase - One of GAME_PHASES
 * @property {number|null} peekPhasePlayer - Player index currently peeking
 *
 * --- Kabo ---
 * @property {number|null} kaboCalledBy - Index of Kabo caller
 * @property {number|null} finalTurnPlayer - Last player who gets a turn
 *
 * --- Power-ups ---
 * @property {string|null} powerMode - null | 'queen' | 'nine'
 * @property {PowerState|null} powerState - Tracks power-up progress
 *
 * --- Stack Rule ---
 * @property {string|null} stackRank - Rank for current stack window
 * @property {boolean} stackPhaseActive - Whether stack window is open
 * @property {number[]} stackEligiblePlayers - Players who haven't attempted yet
 *
 * --- Metadata ---
 * @property {GameEvent[]} eventLog - Complete event history
 * @property {string} lastAction - Description of the last action
 */

/**
 * @typedef {Object} Action
 * @property {string} type - One of ACTION_TYPES
 * @property {Object} [payload] - Action-specific data
 */

/**
 * @typedef {Object} ReducerResult
 * @property {GameState} state - The new game state
 * @property {GameEvent[]} events - Events produced by this action
 */

export {};
