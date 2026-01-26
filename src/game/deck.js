/**
 * createDeck()
 * Builds and returns a shuffled 52‑card deck for the game.
 * Source: cards are generated locally (no external data).
 * Destination: the shuffled array is returned to the caller (typically used as the draw pile).
 * - Number cards: ranks 1–10 with value equal to rank.
 * - Face cards: J=11, Q=12.
 * - Kings: red (hearts/diamonds) have value 0, black (spades/clubs) have value 13.
 * Returns: Array of { rank: number|string, suit: string, value: number }.
 */
export function createDeck() {
  const deck = [];
  const suits = ["hearts", "diamonds", "spades", "clubs"];

  // Add number cards 1–10 for each suit (value equals rank).
  for (let num = 1; num <= 10; num++) {
    suits.forEach(suit => {
      deck.push({ rank: num, suit, value: num });
    });
  }

  // Add face cards J and Q for each suit, then apply special King values.
  suits.forEach(suit => {
    deck.push({ rank: "J", suit, value: 11 });
    deck.push({ rank: "Q", suit, value: 12 });

    // Kings: red suits → value 0, black suits → value 13.
    if (suit === "hearts" || suit === "diamonds") {
      deck.push({ rank: "K", suit, value: 0 });
    } else {
      deck.push({ rank: "K", suit, value: 13 });
    }
  });

  // Shuffle the completed deck and return it.
  return shuffle(deck);
}

/**
 * shuffle(deck)
 * Fisher–Yates shuffle that randomizes the array in place.
 * Source: the deck array provided as argument.
 * Destination: mutates and returns the same array randomized.
 */
function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}