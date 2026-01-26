import { createDeck } from "./deck";

// Source: createDeck() + playerCount -> Dest: returns initialized game state object
// Builds the initial game state, deals cards, and sets turn/power state.
export function setupGame(playerCount) {
  // Build a shuffled deck
  const deck = createDeck();

  // Initialize player list
  const players = [];

  // Create players
  for (let i = 0; i < playerCount; i++) {
    players.push({
      id: i,
      name: `Player ${i + 1}`,
      hand: [],
      visible: [true, true, false, false],
      revealed: false, // ✅ correct place
    });
  }

  // Deal 4 cards to each player
  for (let round = 0; round < 4; round++) {
    players.forEach(player => {
      player.hand.push(deck.pop());
    });
  }

  // First discard card
  const discard = deck.pop();

  return {
    players,
    deck,
    discard,
    currentTurn: 0,
    drawnCard: null,
    drawnFrom: null,

    // Kabo
    kaboCalledBy: null,
    finalTurnIndex: null,
    gameOver: false,

    // Power-ups
    powerMode: null,

    // Stack rule
    stackRank: null,
  };
}
