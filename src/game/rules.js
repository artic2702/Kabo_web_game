// rules.js: game setup and core state shape
// Connection: setupGame -> createDeck (deck.js)
import { createDeck } from "./deck";

export function setupGame(playerCount) {
  // Build a shuffled deck
  const deck = createDeck();
  // Initialize player list
  const players = [];

  // Create players with empty hands and visibility state
  for (let i = 0; i < playerCount; i++) {
    players.push({
      id: i,
      name: `Player ${i + 1}`,
      hand: [],
      visible: [true, true, false, false],
    });
  }

  // Deal cards to each player
  for (let round = 0; round < 4; round++) {
    players.forEach(player => {
      player.hand.push(deck.pop());
    });
  }

  // First discard card from the deck
  const discard = deck.pop();

  return {
    // Players and card piles
    players,
    deck,
    discard,
    // Turn state
    currentTurn: 0,
    drawnCard: null,
    drawnFrom: null,
  };
}
