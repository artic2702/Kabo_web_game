/**
 * Agent 2: Game Logic Engineer
 * validators.js — Action validation (pure functions)
 */

import {
  GAME_PHASES,
  TURN_PHASES,
  ACTION_TYPES,
  GAME_CONFIG,
} from './constants.js';

/**
 * Checks whether a given action is legal in the current game state.
 *
 * @param {import('./types.js').GameState} state
 * @param {import('./types.js').Action} action
 * @returns {boolean}
 */
export function isActionValid(state, action) {
  switch (action.type) {
    // ── Game lifecycle ────────────────────────────────
    case ACTION_TYPES.START_GAME: {
      return state.gamePhase === GAME_PHASES.LOBBY;
    }

    case ACTION_TYPES.RESTART_GAME: {
      return state.gamePhase === GAME_PHASES.ENDED;
    }

    // ── Setup / Peek phase ────────────────────────────
    case ACTION_TYPES.PEEK_CARD: {
      if (state.gamePhase !== GAME_PHASES.SETUP) return false;
      if (state.peekPhasePlayer === null) return false;
      const player = state.players[state.peekPhasePlayer];
      if (!player) return false;
      const idx = action.payload?.cardIndex;
      if (idx === undefined || idx < 0 || idx >= player.hand.length) return false;
      // Can't peek more than PEEK_COUNT cards
      if (player.peekedCards.length >= GAME_CONFIG.PEEK_COUNT
        && !player.peekedCards.includes(idx)) return false;
      return true;
    }

    case ACTION_TYPES.FINISH_PEEK: {
      if (state.gamePhase !== GAME_PHASES.SETUP) return false;
      if (state.peekPhasePlayer === null) return false;
      const p = state.players[state.peekPhasePlayer];
      return p && p.peekedCards.length === GAME_CONFIG.PEEK_COUNT;
    }

    case ACTION_TYPES.RESET_PEEK: {
      return state.gamePhase === GAME_PHASES.SETUP
        && state.peekPhasePlayer !== null;
    }

    // ── Drawing ───────────────────────────────────────
    case ACTION_TYPES.DRAW_FROM_DECK: {
      return isPlayingPhase(state)
        && state.turnPhase === TURN_PHASES.IDLE
        && state.drawnCard === null
        && state.deck.length > 0;
    }

    case ACTION_TYPES.DRAW_FROM_DISCARD: {
      return isPlayingPhase(state)
        && state.turnPhase === TURN_PHASES.IDLE
        && state.drawnCard === null
        && state.discard.length > 0;
    }

    // ── Card placement ────────────────────────────────
    case ACTION_TYPES.EXCHANGE_WITH_HAND: {
      if (!isPlayingPhase(state)) return false;
      if (state.drawnCard === null) return false;
      if (state.turnPhase !== TURN_PHASES.DECIDING
        && state.turnPhase !== TURN_PHASES.DECIDING_DISCARD) return false;
      const player = state.players[state.currentTurn];
      const hi = action.payload?.handIndex;
      return hi !== undefined && hi >= 0 && hi < player.hand.length;
    }

    case ACTION_TYPES.THROW_DRAWN_CARD: {
      if (!isPlayingPhase(state)) return false;
      // Can only throw if drawn from deck (not discard)
      return state.drawnCard !== null
        && state.turnPhase === TURN_PHASES.DECIDING
        && state.drawnFrom === 'deck';
    }

    // ── Power-ups ─────────────────────────────────────
    case ACTION_TYPES.QUEEN_SELECT_CARD: {
      if (!isPlayingPhase(state)) return false;
      if (state.powerMode !== 'queen') return false;
      if (state.turnPhase !== TURN_PHASES.POWER_UP) return false;
      const { playerId, cardIndex } = action.payload || {};
      if (playerId === undefined || cardIndex === undefined) return false;
      const target = state.players[playerId];
      if (!target) return false;
      if (cardIndex < 0 || cardIndex >= target.hand.length) return false;

      // If first card is already selected, second must be from a DIFFERENT player
      if (state.powerState?.firstSelection) {
        const first = state.powerState.firstSelection;
        if (first.playerId === playerId) return false; // same player not allowed
      }
      return true;
    }

    case ACTION_TYPES.NINE_PEEK: {
      if (!isPlayingPhase(state)) return false;
      if (state.powerMode !== 'nine') return false;
      if (state.turnPhase !== TURN_PHASES.POWER_UP) return false;
      const ci = action.payload?.cardIndex;
      const cp = state.players[state.currentTurn];
      return ci !== undefined && ci >= 0 && ci < cp.hand.length;
    }

    case ACTION_TYPES.SKIP_POWER: {
      return isPlayingPhase(state)
        && state.turnPhase === TURN_PHASES.POWER_UP
        && state.powerMode !== null;
    }

    // ── Stack rule ────────────────────────────────────
    case ACTION_TYPES.STACK_DROP: {
      if (!isPlayingPhase(state)) return false;
      if (!state.stackPhaseActive) return false;
      const { playerId, handIndex } = action.payload || {};
      if (playerId === undefined || handIndex === undefined) return false;
      if (!state.stackEligiblePlayers.includes(playerId)) return false;
      const sp = state.players[playerId];
      return sp && handIndex >= 0 && handIndex < sp.hand.length;
    }

    case ACTION_TYPES.STACK_PASS: {
      if (!isPlayingPhase(state)) return false;
      if (!state.stackPhaseActive) return false;
      const pid = action.payload?.playerId;
      return pid !== undefined && state.stackEligiblePlayers.includes(pid);
    }

    case ACTION_TYPES.STACK_END: {
      return isPlayingPhase(state) && state.stackPhaseActive;
    }

    // ── Kabo ──────────────────────────────────────────
    case ACTION_TYPES.CALL_KABO: {
      return state.gamePhase === GAME_PHASES.PLAYING
        && state.turnPhase === TURN_PHASES.IDLE
        && state.kaboCalledBy === null
        && state.drawnCard === null;
    }

    // ── Turn ──────────────────────────────────────────
    case ACTION_TYPES.END_TURN: {
      return isPlayingPhase(state)
        && (state.turnPhase === TURN_PHASES.STACK_PHASE
          || state.turnPhase === TURN_PHASES.TURN_END);
    }

    default:
      return false;
  }
}

/**
 * Returns a list of all action types that are currently valid.
 *
 * @param {import('./types.js').GameState} state
 * @returns {string[]} Array of valid ACTION_TYPES values
 */
export function getValidActions(state) {
  const valid = [];
  for (const type of Object.values(ACTION_TYPES)) {
    // For parameterised actions we only check whether the type
    // is valid in principle (with a dummy payload).
    let payload = {};
    switch (type) {
      case ACTION_TYPES.PEEK_CARD:
        payload = { cardIndex: 0 };
        break;
      case ACTION_TYPES.EXCHANGE_WITH_HAND:
        payload = { handIndex: 0 };
        break;
      case ACTION_TYPES.QUEEN_SELECT_CARD:
        payload = { playerId: 0, cardIndex: 0 };
        break;
      case ACTION_TYPES.NINE_PEEK:
        payload = { cardIndex: 0 };
        break;
      case ACTION_TYPES.STACK_DROP:
        payload = { playerId: 0, handIndex: 0 };
        break;
      case ACTION_TYPES.STACK_PASS:
        payload = { playerId: 0 };
        break;
      case ACTION_TYPES.START_GAME:
        payload = { playerCount: 2 };
        break;
      default:
        break;
    }
    if (isActionValid(state, { type, payload })) {
      valid.push(type);
    }
  }
  return valid;
}

// ── Helpers ─────────────────────────────────────────────────

/**
 * Returns true if the game is in a phase where turns happen.
 * @param {import('./types.js').GameState} state
 * @returns {boolean}
 */
function isPlayingPhase(state) {
  return state.gamePhase === GAME_PHASES.PLAYING
    || state.gamePhase === GAME_PHASES.FINAL_ROUND;
}
