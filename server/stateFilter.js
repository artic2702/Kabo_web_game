/**
 * ══════════════════════════════════════════════════════════════
 *  STATE FILTER
 *  server/stateFilter.js
 * ══════════════════════════════════════════════════════════════
 *
 *  Anti-cheat layer. Filters game state before sending to each
 *  player so they can only see information they're supposed to:
 *
 *  What a player CAN see:
 *  ✅ Their own face-down cards (values visible to them)
 *  ✅ Anyone's face-up/revealed cards
 *  ✅ Discard pile, deck count, turn info, phase
 *
 *  What a player CANNOT see:
 *  ❌ Other players' face-down card values
 *  ❌ Which cards other players peeked at
 *  ❌ The deck order (draw order)
 *
 *  Connected to:
 *  - server/gameHandler.js — calls filterStateForPlayer before
 *    emitting 'game:state-update' to each socket
 * ══════════════════════════════════════════════════════════════
 */

/**
 * Filter game state for a specific player.
 * Replaces hidden cards with { id, hidden: true } stubs.
 *
 * @param {Object} state - Full canonical game state
 * @param {number} playerId - ID of the player receiving this state
 * @returns {Object} Filtered state safe to send over the network
 */
export function filterStateForPlayer(state, playerId) {
  if (!state) return null;

  return {
    ...state,

    // Don't send full deck array (would reveal draw order)
    deck: { length: state.deck.length },

    // Filter each player's hand
    players: state.players.map(player => {
      const isMe = player.id === playerId;

      return {
        ...player,
        hand: player.hand.map((card, i) => {
          // Revealed cards (game end) are visible to everyone
          if (player.visible[i] || player.revealed) return card;
          // Hidden cards: even the owner gets a stub
          // (they remember from peeking, the UI handles memory)
          if (isMe) return card; // Own cards are always sent
          return { id: card.id, hidden: true };
        }),
        // Don't tell others which cards you peeked at
        peekedCards: isMe ? player.peekedCards : [],
      };
    }),

    // Remove event log from payload to reduce size
    eventLog: [],
  };
}

/**
 * Filter game events before sending to a player.
 * Hides sensitive card information from events.
 *
 * @param {Object[]} events - Game events from the reducer
 * @param {number} playerId - Receiving player's ID
 * @returns {Object[]} Filtered events
 */
export function filterEventsForPlayer(events, playerId) {
  return events.map(event => {
    switch (event.type) {
      case 'CARD_PEEKED':
        // Only the peeking player sees the card value
        if (event.data.playerId !== playerId) {
          return { ...event, data: { ...event.data, card: { hidden: true } } };
        }
        return event;

      case 'CARD_DRAWN':
        // Only the drawing player sees deck-drawn card values
        // (discard draws are public since the card was face-up)
        if (event.data.playerId !== playerId && event.data.source !== 'discard') {
          return { ...event, data: { ...event.data, card: { hidden: true } } };
        }
        return event;

      default:
        return event;
    }
  });
}
