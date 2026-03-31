/**
 * Agent 2: Game Logic Engineer
 * constants.js — All game enums & constants
 */

// ── Game Phases ─────────────────────────────────────────────
export const GAME_PHASES = Object.freeze({
  LOBBY: 'lobby',
  SETUP: 'setup',
  PLAYING: 'playing',
  FINAL_ROUND: 'finalRound',
  ENDED: 'ended',
});

// ── Turn Sub-Phases ─────────────────────────────────────────
export const TURN_PHASES = Object.freeze({
  IDLE: 'idle',
  DRAWING: 'drawing',
  DECIDING: 'deciding',
  DECIDING_DISCARD: 'deciding_discard',
  POWER_UP: 'powerUp',
  STACK_PHASE: 'stackPhase',
  TURN_END: 'turnEnd',
});

// ── Action Types (dispatched from UI) ───────────────────────
export const ACTION_TYPES = Object.freeze({
  // Game lifecycle
  START_GAME: 'START_GAME',
  RESTART_GAME: 'RESTART_GAME',

  // Setup / Peek phase
  PEEK_CARD: 'PEEK_CARD',
  FINISH_PEEK: 'FINISH_PEEK',
  RESET_PEEK: 'RESET_PEEK',

  // Drawing
  DRAW_FROM_DECK: 'DRAW_FROM_DECK',
  DRAW_FROM_DISCARD: 'DRAW_FROM_DISCARD',

  // Card placement
  EXCHANGE_WITH_HAND: 'EXCHANGE_WITH_HAND',
  THROW_DRAWN_CARD: 'THROW_DRAWN_CARD',

  // Power-ups
  QUEEN_SELECT_CARD: 'QUEEN_SELECT_CARD',
  NINE_PEEK: 'NINE_PEEK',
  SKIP_POWER: 'SKIP_POWER',

  // Stack rule
  STACK_DROP: 'STACK_DROP',
  STACK_PASS: 'STACK_PASS',
  STACK_END: 'STACK_END',

  // Kabo
  CALL_KABO: 'CALL_KABO',

  // Turn
  END_TURN: 'END_TURN',
});

// ── Power-up Modes ──────────────────────────────────────────
export const POWER_MODES = Object.freeze({
  QUEEN: 'queen',
  NINE: 'nine',
});

// ── Event Types (emitted from engine to UI) ─────────────────
export const EVENT_TYPES = Object.freeze({
  CARD_DEALT: 'CARD_DEALT',
  CARD_DRAWN: 'CARD_DRAWN',
  CARD_EXCHANGED: 'CARD_EXCHANGED',
  CARD_THROWN: 'CARD_THROWN',
  CARD_PEEKED: 'CARD_PEEKED',
  CARDS_SWAPPED: 'CARDS_SWAPPED',
  STACK_SUCCESS: 'STACK_SUCCESS',
  STACK_FAIL: 'STACK_FAIL',
  KABO_CALLED: 'KABO_CALLED',
  TURN_CHANGED: 'TURN_CHANGED',
  PHASE_CHANGED: 'PHASE_CHANGED',
  GAME_ENDED: 'GAME_ENDED',
  PEEK_PHASE_ADVANCE: 'PEEK_PHASE_ADVANCE',
  POWER_ACTIVATED: 'POWER_ACTIVATED',
  POWER_COMPLETED: 'POWER_COMPLETED',
});

// ── Suits ───────────────────────────────────────────────────
export const SUITS = Object.freeze(['hearts', 'diamonds', 'spades', 'clubs']);

export const RED_SUITS = Object.freeze(['hearts', 'diamonds']);
export const BLACK_SUITS = Object.freeze(['spades', 'clubs']);

// ── Card Value Map ──────────────────────────────────────────
// Face cards & special king values
export const FACE_CARD_VALUES = Object.freeze({
  J: 11,
  Q: 12,
  // K is handled separately: red=0, black=13
});

// ── Game Config ─────────────────────────────────────────────
export const GAME_CONFIG = Object.freeze({
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 5,
  CARDS_PER_PLAYER: 4,
  PEEK_COUNT: 2,
  KABO_PENALTY: 10,
  STACK_TIMEOUT_MS: 8000,
});
