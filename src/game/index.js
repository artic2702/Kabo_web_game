/**
 * Agent 2: Game Logic Engineer
 * index.js — Barrel export for game logic layer
 */

// Game initialization
export { createInitialState } from './rules.js';

// Core reducer
export { gameReducer } from './actions.js';

// Validation
export { isActionValid, getValidActions } from './validators.js';

// Scoring
export { calculateScores, determineWinners, applyKaboScoring } from './scoring.js';

// Deck
export { createDeck } from './deck.js';

// Constants
export {
  GAME_PHASES,
  TURN_PHASES,
  ACTION_TYPES,
  POWER_MODES,
  EVENT_TYPES,
  GAME_CONFIG,
  SUITS,
} from './constants.js';
