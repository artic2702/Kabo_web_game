/**
 * ══════════════════════════════════════════════════════════════
 *  GAME HANDLER
 *  server/gameHandler.js
 * ══════════════════════════════════════════════════════════════
 *
 *  THE CORE of multiplayer: processes game actions using the
 *  SAME pure game reducer that the client uses in local mode
 *  (imported from src/game/).
 *
 *  Flow:
 *  1. Client sends action via Socket.IO ('game:action')
 *  2. Server validates the action (is it this player's turn?)
 *  3. Runs gameReducer(state, action) → new state + events
 *  4. Filters state per player (hide other players' cards)
 *  5. Broadcasts filtered state to each connected player
 *
 *  Connected to:
 *  - server/index.js — calls startGame() and processAction()
 *  - server/stateFilter.js — filters state before broadcasting
 *  - src/game/ — the shared pure game logic (ESM)
 * ══════════════════════════════════════════════════════════════
 */

import { filterStateForPlayer, filterEventsForPlayer } from './stateFilter.js';

// Lazy-loaded game module (shared with client)
let gameModule = null;

async function loadGameModule() {
  if (!gameModule) {
    gameModule = await import('../src/game/index.js');
  }
  return gameModule;
}

/**
 * Initialize the game handler.
 * Returns functions that the socket event handlers call.
 *
 * @param {import('socket.io').Server} io - Socket.IO server instance
 * @param {import('./roomManager.js').RoomManager} roomManager
 */
export function initGameHandler(io, roomManager) {

  /**
   * Start a game session in a room.
   * Creates game state from the shared rules engine
   * and sets player names from the lobby data.
   */
  async function startGame(roomCode) {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    const game = await loadGameModule();

    // Use the SAME createInitialState from src/game/
    const state = game.createInitialState(room.players.length);

    // Set player names from lobby (instead of default "Player 1", etc.)
    state.players.forEach((player, i) => {
      if (room.players[i]) {
        player.name = room.players[i].name;
      }
    });

    room.gameState = state;
    room.status = 'playing';

    // Send each player their own filtered view of the state
    broadcastState(io, room, []);
  }

  /**
   * Process a game action from a specific player.
   *
   * Security model:
   * - Validates that the action is legal (via shared isActionValid)
   * - Validates that THIS PLAYER is allowed to do it (turn check)
   * - Runs the pure reducer, updates canonical state
   * - Broadcasts filtered state to all players
   */
  async function processAction(socketId, action) {
    const room = roomManager.getRoomBySocket(socketId);
    if (!room || !room.gameState) {
      return { success: false, error: 'No active game' };
    }

    const player = room.players.find(p => p.socketId === socketId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    const game = await loadGameModule();

    // Check: is the action valid AND is this player permitted?
    if (!canPlayerDoAction(room.gameState, player.playerId, action, game)) {
      return { success: false, error: 'Not your turn or invalid action' };
    }

    // Run through the pure reducer (same one used locally)
    const result = game.gameReducer(room.gameState, action);
    room.gameState = result.state;

    if (result.state.gamePhase === 'ended') {
      room.status = 'ended';
    }

    broadcastState(io, room, result.events);
    return { success: true };
  }

  /**
   * Permission check: can this specific player perform this action?
   *
   * Most actions require it to be your turn. Exceptions:
   * - Stack actions: the payload specifies which player is attempting
   * - Peek phase: only the peeking player can act
   */
  function canPlayerDoAction(state, playerId, action, game) {
    if (!game.isActionValid(state, action)) return false;

    const type = action.type;

    // Peek phase: only the designated peeking player
    if (['PEEK_CARD', 'FINISH_PEEK', 'RESET_PEEK'].includes(type)) {
      return state.peekPhasePlayer === playerId;
    }

    // Stack actions: player must be the one specified in payload
    if (['STACK_DROP', 'STACK_PASS'].includes(type)) {
      return action.payload?.playerId === playerId;
    }

    // Queen select: only current turn player can initiate swaps
    if (type === 'QUEEN_SELECT_CARD') return state.currentTurn === playerId;

    // Standard turn actions
    if (['DRAW_FROM_DECK', 'DRAW_FROM_DISCARD', 'EXCHANGE_WITH_HAND',
         'THROW_DRAWN_CARD', 'NINE_PEEK', 'SKIP_POWER',
         'CALL_KABO', 'END_TURN'].includes(type)) {
      return state.currentTurn === playerId;
    }

    // Stack end can be triggered by timer/anyone
    if (type === 'STACK_END') return true;

    return false;
  }

  /**
   * Send each player their own filtered copy of the game state.
   * Uses stateFilter.js to hide other players' card values.
   */
  function broadcastState(io, room, events) {
    if (!room.gameState) return;

    for (const player of room.players) {
      if (!player.connected) continue;

      const filteredState = filterStateForPlayer(room.gameState, player.playerId);
      const filteredEvents = filterEventsForPlayer(events, player.playerId);

      io.to(player.socketId).emit('game:state-update', {
        state: filteredState,
        events: filteredEvents,
      });
    }
  }

  return { startGame, processAction, broadcastState };
}
