/**
 * Agent 2: Game Logic Engineer
 * actions.js — Pure game reducer (immutable state transitions)
 *
 * EVERY function here:
 *   - Takes state + action → returns { state, events }
 *   - NEVER mutates the input state
 *   - Has ZERO side effects (no console.log, no DOM, no React)
 */

import {
  GAME_PHASES,
  TURN_PHASES,
  ACTION_TYPES,
  EVENT_TYPES,
  GAME_CONFIG,
} from './constants.js';
import { createInitialState } from './rules.js';
import { isActionValid } from './validators.js';
import { calculateScores, applyKaboScoring, determineWinners } from './scoring.js';

// ── Helpers ─────────────────────────────────────────────────

/** Deep-clone a plain object (no functions, no circular refs) */
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/** Create a timestamped game event */
function makeEvent(type, data = {}) {
  return { type, data, timestamp: Date.now() };
}

// ── Main Reducer ────────────────────────────────────────────

/**
 * Core game reducer.
 *
 * @param {import('./types.js').GameState} state - Read-only current state
 * @param {import('./types.js').Action} action - { type, payload }
 * @returns {import('./types.js').ReducerResult} { state, events }
 */
export function gameReducer(state, action) {
  // Validate before processing
  if (!isActionValid(state, action)) {
    return { state, events: [] };
  }

  switch (action.type) {
    case ACTION_TYPES.START_GAME:
      return handleStartGame(action.payload);
    case ACTION_TYPES.RESTART_GAME:
      return handleStartGame({ playerCount: state.players.length });

    case ACTION_TYPES.PEEK_CARD:
      return handlePeekCard(state, action.payload);
    case ACTION_TYPES.FINISH_PEEK:
      return handleFinishPeek(state);
    case ACTION_TYPES.RESET_PEEK:
      return handleResetPeek(state);

    case ACTION_TYPES.DRAW_FROM_DECK:
      return handleDrawFromDeck(state);
    case ACTION_TYPES.DRAW_FROM_DISCARD:
      return handleDrawFromDiscard(state);

    case ACTION_TYPES.EXCHANGE_WITH_HAND:
      return handleExchangeWithHand(state, action.payload);
    case ACTION_TYPES.THROW_DRAWN_CARD:
      return handleThrowDrawnCard(state);

    case ACTION_TYPES.QUEEN_SELECT_CARD:
      return handleQueenSelectCard(state, action.payload);
    case ACTION_TYPES.NINE_PEEK:
      return handleNinePeek(state, action.payload);
    case ACTION_TYPES.SKIP_POWER:
      return handleSkipPower(state);

    case ACTION_TYPES.STACK_DROP:
      return handleStackDrop(state, action.payload);
    case ACTION_TYPES.STACK_PASS:
      return handleStackPass(state, action.payload);
    case ACTION_TYPES.STACK_END:
      return handleStackEnd(state);

    case ACTION_TYPES.CALL_KABO:
      return handleCallKabo(state);

    case ACTION_TYPES.END_TURN:
      return handleEndTurn(state);

    default:
      return { state, events: [] };
  }
}


// ════════════════════════════════════════════════════════════
//  GAME LIFECYCLE
// ════════════════════════════════════════════════════════════

function handleStartGame({ playerCount }) {
  const newState = createInitialState(playerCount);
  const events = [makeEvent(EVENT_TYPES.PHASE_CHANGED, { from: GAME_PHASES.LOBBY, to: GAME_PHASES.SETUP })];
  return { state: newState, events };
}


// ════════════════════════════════════════════════════════════
//  SETUP / PEEK PHASE
// ════════════════════════════════════════════════════════════

function handlePeekCard(state, { cardIndex }) {
  const s = clone(state);
  const player = s.players[s.peekPhasePlayer];

  // Record peek index if not already recorded
  if (!player.peekedCards.includes(cardIndex)) {
    player.peekedCards.push(cardIndex);
  }

  const card = player.hand[cardIndex];
  s.lastAction = `${player.name} peeked at card ${cardIndex + 1}`;

  const events = [makeEvent(EVENT_TYPES.CARD_PEEKED, {
    playerId: player.id,
    cardIndex,
    card: { ...card },
  })];

  return { state: s, events };
}

function handleFinishPeek(state) {
  const s = clone(state);
  const events = [];

  // Advance to next player
  s.peekPhasePlayer += 1;

  if (s.peekPhasePlayer >= s.players.length) {
    // All players done — transition to playing
    s.gamePhase = GAME_PHASES.PLAYING;
    s.peekPhasePlayer = null;
    s.currentTurn = 0;
    s.turnPhase = TURN_PHASES.IDLE;
    s.lastAction = 'All players have peeked. Game begins!';
    events.push(makeEvent(EVENT_TYPES.PHASE_CHANGED, {
      from: GAME_PHASES.SETUP,
      to: GAME_PHASES.PLAYING,
    }));
  } else {
    s.lastAction = `${s.players[s.peekPhasePlayer].name}'s turn to peek`;
    events.push(makeEvent(EVENT_TYPES.PEEK_PHASE_ADVANCE, {
      playerId: s.peekPhasePlayer,
    }));
  }

  return { state: s, events };
}

function handleResetPeek(state) {
  const s = clone(state);
  s.players[s.peekPhasePlayer].peekedCards = [];
  s.lastAction = `${s.players[s.peekPhasePlayer].name} reset peek selection`;
  return { state: s, events: [] };
}


// ════════════════════════════════════════════════════════════
//  DRAWING
// ════════════════════════════════════════════════════════════

function handleDrawFromDeck(state) {
  const s = clone(state);
  const card = s.deck.pop();
  s.drawnCard = card;
  s.drawnFrom = 'deck';
  s.turnPhase = TURN_PHASES.DECIDING;
  s.lastAction = `${s.players[s.currentTurn].name} drew from deck`;

  const events = [makeEvent(EVENT_TYPES.CARD_DRAWN, {
    source: 'deck',
    card: { ...card },
    playerId: s.currentTurn,
  })];

  return { state: s, events };
}

function handleDrawFromDiscard(state) {
  const s = clone(state);
  const card = s.discard.pop();
  s.drawnCard = card;
  s.drawnFrom = 'discard';
  s.turnPhase = TURN_PHASES.DECIDING_DISCARD;
  s.lastAction = `${s.players[s.currentTurn].name} drew from discard`;

  const events = [makeEvent(EVENT_TYPES.CARD_DRAWN, {
    source: 'discard',
    card: { ...card },
    playerId: s.currentTurn,
  })];

  return { state: s, events };
}


// ════════════════════════════════════════════════════════════
//  CARD PLACEMENT
// ════════════════════════════════════════════════════════════

function handleExchangeWithHand(state, { handIndex }) {
  const s = clone(state);
  const player = s.players[s.currentTurn];
  const oldCard = player.hand[handIndex];

  // Swap: drawn card goes into hand, old card goes to discard
  player.hand[handIndex] = s.drawnCard;
  s.discard.push(oldCard);

  // Reset visibility for the swapped position (new card is unknown)
  player.visible[handIndex] = false;

  const drawnCard = s.drawnCard;
  s.drawnCard = null;
  s.drawnFrom = null;

  s.lastAction = `${player.name} exchanged card ${handIndex + 1}`;

  // Set stack rank from the discarded card
  s.stackRank = oldCard.rank;

  const events = [makeEvent(EVENT_TYPES.CARD_EXCHANGED, {
    playerId: s.currentTurn,
    handIndex,
    oldCard: { ...oldCard },
    newCard: { ...drawnCard },
  })];

  // Start stack phase
  return enterStackPhase(s, events);
}

function handleThrowDrawnCard(state) {
  const s = clone(state);
  const card = s.drawnCard;

  s.discard.push(card);
  s.drawnCard = null;
  s.drawnFrom = null;
  s.stackRank = card.rank;

  s.lastAction = `${s.players[s.currentTurn].name} threw ${card.rank} to discard`;

  const events = [makeEvent(EVENT_TYPES.CARD_THROWN, {
    card: { ...card },
    playerId: s.currentTurn,
  })];

  // Check for power-ups (Queen or 9)
  if (card.rank === 'Q') {
    s.powerMode = 'queen';
    s.powerState = { firstSelection: null };
    s.turnPhase = TURN_PHASES.POWER_UP;
    events.push(makeEvent(EVENT_TYPES.POWER_ACTIVATED, { power: 'queen' }));
    return { state: s, events };
  }

  if (card.rank === 9) {
    s.powerMode = 'nine';
    s.powerState = null;
    s.turnPhase = TURN_PHASES.POWER_UP;
    events.push(makeEvent(EVENT_TYPES.POWER_ACTIVATED, { power: 'nine' }));
    return { state: s, events };
  }

  // No power-up → stack phase
  return enterStackPhase(s, events);
}


// ════════════════════════════════════════════════════════════
//  POWER-UPS
// ════════════════════════════════════════════════════════════

function handleQueenSelectCard(state, { playerId, cardIndex }) {
  const s = clone(state);
  const events = [];

  if (!s.powerState.firstSelection) {
    // First card selected
    s.powerState.firstSelection = { playerId, cardIndex };
    s.lastAction = `Selected card ${cardIndex + 1} from ${s.players[playerId].name}`;
    return { state: s, events };
  }

  // Second card selected — perform the swap
  const first = s.powerState.firstSelection;

  // Don't allow selecting the exact same card slot
  if (first.playerId === playerId && first.cardIndex === cardIndex) {
    return { state: s, events: [] };
  }

  // Must be from different players (validator also checks this)
  if (first.playerId === playerId) {
    return { state: s, events: [] };
  }

  const card1 = s.players[first.playerId].hand[first.cardIndex];
  const card2 = s.players[playerId].hand[cardIndex];

  s.players[first.playerId].hand[first.cardIndex] = card2;
  s.players[playerId].hand[cardIndex] = card1;

  s.powerMode = null;
  s.powerState = null;

  s.lastAction = `Queen swap: ${s.players[first.playerId].name} card ${first.cardIndex + 1} ↔ ${s.players[playerId].name} card ${cardIndex + 1}`;

  events.push(makeEvent(EVENT_TYPES.CARDS_SWAPPED, {
    p1: first.playerId,
    i1: first.cardIndex,
    p2: playerId,
    i2: cardIndex,
  }));
  events.push(makeEvent(EVENT_TYPES.POWER_COMPLETED, { power: 'queen' }));

  // After queen → stack phase
  return enterStackPhase(s, events);
}

function handleNinePeek(state, { cardIndex }) {
  const s = clone(state);
  const player = s.players[s.currentTurn];
  const card = player.hand[cardIndex];

  // Temporarily mark as visible for UI feedback
  player.visible[cardIndex] = true;

  s.powerMode = null;
  s.powerState = null;

  s.lastAction = `${player.name} peeked at card ${cardIndex + 1}`;

  const events = [
    makeEvent(EVENT_TYPES.CARD_PEEKED, {
      playerId: s.currentTurn,
      cardIndex,
      card: { ...card },
    }),
    makeEvent(EVENT_TYPES.    POWER_COMPLETED, { power: 'nine' }),
  ];

  // After nine → stack phase
  return enterStackPhase(s, events);
}

function handleSkipPower(state) {
  const s = clone(state);
  const power = s.powerMode;
  s.powerMode = null;
  s.powerState = null;
  s.lastAction = `${s.players[s.currentTurn].name} skipped ${power} power`;

  const events = [makeEvent(EVENT_TYPES.POWER_COMPLETED, { power, skipped: true })];

  return enterStackPhase(s, events);
}


// ════════════════════════════════════════════════════════════
//  STACK RULE
// ════════════════════════════════════════════════════════════

/**
 * Transition into the stack phase.
 * All players EXCEPT the one who discarded are eligible.
 */
function enterStackPhase(state, existingEvents = []) {
  const s = state; // already cloned by caller

  // Current player (who threw/discarded) is NOT eligible to stack
  s.stackPhaseActive = true;
  s.stackEligiblePlayers = s.players
    .map(p => p.id)
    .filter(id => id !== s.currentTurn);
  s.turnPhase = TURN_PHASES.STACK_PHASE;

  return { state: s, events: existingEvents };
}

function handleStackDrop(state, { playerId, handIndex }) {
  const s = clone(state);
  const events = [];
  const player = s.players[playerId];
  const card = player.hand[handIndex];

  if (String(card.rank) === String(s.stackRank)) {
    // Correct stack — remove card from hand
    const removed = player.hand.splice(handIndex, 1)[0];
    // Also shrink the visible array
    player.visible.splice(handIndex, 1);
    s.lastAction = `${player.name} stacked a matching ${card.rank}!`;
    events.push(makeEvent(EVENT_TYPES.STACK_SUCCESS, {
      playerId,
      handIndex,
      card: { ...removed },
    }));
    // Only ONE player can stack per discard — end phase immediately
    return finishStackPhase(s, events);
  } else {
    // Wrong stack — penalty card from deck
    if (s.deck.length > 0) {
      const penalty = s.deck.pop();
      player.hand.push(penalty);
      player.visible.push(false);
      s.lastAction = `${player.name} stacked wrong! Penalty card drawn.`;
      events.push(makeEvent(EVENT_TYPES.STACK_FAIL, {
        playerId,
        penaltyCard: { ...penalty },
      }));
    } else {
      s.lastAction = `${player.name} stacked wrong! No penalty (deck empty).`;
      events.push(makeEvent(EVENT_TYPES.STACK_FAIL, {
        playerId,
        penaltyCard: null,
      }));
    }
  }

  // Remove this player from eligible list
  s.stackEligiblePlayers = s.stackEligiblePlayers.filter(id => id !== playerId);

  // If no more eligible players, end stack phase
  if (s.stackEligiblePlayers.length === 0) {
    return finishStackPhase(s, events);
  }

  return { state: s, events };
}

function handleStackPass(state, { playerId }) {
  const s = clone(state);
  s.stackEligiblePlayers = s.stackEligiblePlayers.filter(id => id !== playerId);

  if (s.stackEligiblePlayers.length === 0) {
    return finishStackPhase(s, []);
  }

  return { state: s, events: [] };
}

function handleStackEnd(state) {
  const s = clone(state);
  return finishStackPhase(s, []);
}

function finishStackPhase(state, existingEvents = []) {
  const s = state;
  s.stackPhaseActive = false;
  s.stackRank = null;
  s.stackEligiblePlayers = [];
  s.turnPhase = TURN_PHASES.TURN_END;

  return { state: s, events: existingEvents };
}


// ════════════════════════════════════════════════════════════
//  KABO
// ════════════════════════════════════════════════════════════

function handleCallKabo(state) {
  const s = clone(state);
  s.kaboCalledBy = s.currentTurn;

  // The player before the caller is the final turn player
  s.finalTurnPlayer = (s.currentTurn - 1 + s.players.length) % s.players.length;
  s.gamePhase = GAME_PHASES.FINAL_ROUND;
  s.lastAction = `${s.players[s.currentTurn].name} called KABO!`;

  // The kabo caller still needs to draw this turn
  // turnPhase stays IDLE so they can draw

  const events = [
    makeEvent(EVENT_TYPES.KABO_CALLED, { playerId: s.currentTurn }),
    makeEvent(EVENT_TYPES.PHASE_CHANGED, {
      from: GAME_PHASES.PLAYING,
      to: GAME_PHASES.FINAL_ROUND,
    }),
  ];

  return { state: s, events };
}


// ════════════════════════════════════════════════════════════
//  TURN MANAGEMENT
// ════════════════════════════════════════════════════════════

function handleEndTurn(state) {
  const s = clone(state);
  const events = [];

  // Check if this was the final turn after Kabo
  if (
    s.gamePhase === GAME_PHASES.FINAL_ROUND &&
    s.currentTurn === s.finalTurnPlayer
  ) {
    // GAME OVER
    return handleGameEnd(s);
  }

  // Advance to next player
  const prevTurn = s.currentTurn;
  s.currentTurn = (s.currentTurn + 1) % s.players.length;

  // Skip the Kabo caller during final round (they already had their turn)
  if (
    s.gamePhase === GAME_PHASES.FINAL_ROUND &&
    s.currentTurn === s.kaboCalledBy
  ) {
    s.currentTurn = (s.currentTurn + 1) % s.players.length;
  }

  // Reset turn state
  s.turnPhase = TURN_PHASES.IDLE;
  s.drawnCard = null;
  s.drawnFrom = null;
  s.powerMode = null;
  s.powerState = null;
  s.stackRank = null;
  s.stackPhaseActive = false;
  s.stackEligiblePlayers = [];

  s.lastAction = `${s.players[s.currentTurn].name}'s turn`;

  events.push(makeEvent(EVENT_TYPES.TURN_CHANGED, {
    from: prevTurn,
    to: s.currentTurn,
  }));

  return { state: s, events };
}

function handleGameEnd(state) {
  const s = state; // already cloned
  s.gamePhase = GAME_PHASES.ENDED;
  s.turnPhase = TURN_PHASES.IDLE;

  // Reveal all cards
  for (const player of s.players) {
    player.revealed = true;
    player.visible = player.visible.map(() => true);
  }

  // Calculate scores
  const rawScores = calculateScores(s.players);
  const finalScores = applyKaboScoring(rawScores, s.kaboCalledBy, GAME_CONFIG.KABO_PENALTY);
  const winners = determineWinners(finalScores);

  s.lastAction = `Game over! ${winners.map(w => w.name).join(' & ')} wins!`;

  const events = [
    makeEvent(EVENT_TYPES.PHASE_CHANGED, {
      from: GAME_PHASES.FINAL_ROUND,
      to: GAME_PHASES.ENDED,
    }),
    makeEvent(EVENT_TYPES.GAME_ENDED, {
      scores: finalScores,
      winners,
      kaboCalledBy: s.kaboCalledBy,
    }),
  ];

  return { state: s, events };
}
