export function drawFromDeck(game) {
  if (game.deck.length === 0) return;

  game.drawnCard = game.deck.pop();
  game.drawnFrom = "deck";
}

export function drawFromDiscard(game) {
  if (!game.discard) return;

  game.drawnCard = game.discard;
  game.discard = null;
  game.drawnFrom = "discard";
}