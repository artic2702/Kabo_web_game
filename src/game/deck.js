// deck.js: builds and shuffles a standard deck with Kabo-specific values
// Connection: rules.js calls createDeck() during setup
export function createDeck() {
  const deck = [];
  const suits = ["hearts", "diamonds", "spades", "clubs"];

  // Number cards 1–10
  for (let num = 1; num <= 10; num++) {
    suits.forEach(suit => {
      deck.push({ rank: num, suit, value: num });
    });
  }

  // Face cards
  suits.forEach(suit => {
    deck.push({ rank: "J", suit, value: 11 });
    deck.push({ rank: "Q", suit, value: 12 });

    // King rule: red kings are 0, black kings are 13
    if (suit === "hearts" || suit === "diamonds") {
      deck.push({ rank: "K", suit, value: 0 });
    } else {
      deck.push({ rank: "K", suit, value: 13 });
    }
  });

  // Shuffle before returning
  return shuffle(deck);
}

// Fisher-Yates shuffle
function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
