/* ============================================================
   SETUP / PEEK PHASE
   ============================================================ */

/*
  Peek at a card during setup phase
  - Records the card index as peeked
  - Returns the card so UI can show it
*/
export function peekAtCard(game, cardIndex) {
  if (game.gamePhase !== 'setup') return null;

  const player = game.players[game.peekPhasePlayer];

  // Track that this card was peeked (for memory purposes)
  if (!player.peekedCards.includes(cardIndex)) {
    player.peekedCards.push(cardIndex);
  }

  return player.hand[cardIndex];
}

/*
  Finish peeking for current player and move to next
  - Player must have peeked exactly 2 cards
  - Advances to next player's peek turn
  - When all players done, transitions to 'playing'
*/
export function finishPeekPhase(game) {
  if (game.gamePhase !== 'setup') return;

  const player = game.players[game.peekPhasePlayer];

  // Must peek at exactly 2 cards
  if (player.peekedCards.length !== 2) return;

  // Move to next player
  game.peekPhasePlayer += 1;

  // If all players have peeked, start game
  if (game.peekPhasePlayer >= game.players.length) {
    game.gamePhase = 'playing';
    game.currentTurn = 0;
    game.peekPhasePlayer = null;
  }
}

/*
  Reset peek for current player (start over)
*/
export function resetPeek(game) {
  if (game.gamePhase !== 'setup') return;
  game.players[game.peekPhasePlayer].peekedCards = [];
}


/* ============================================================
   DRAW ACTIONS
   ============================================================ */

/*
  Draws the top card from the deck.
  - Removes 1 card from game.deck
  - Stores it temporarily in game.drawnCard
  - Marks that it was drawn from the deck
*/
export function drawFromDeck(game) {
  if (game.deck.length === 0) return;

  game.drawnCard = game.deck.pop();
  game.drawnFrom = "deck";
}

/*
  Draws the top card from the discard pile.
  - Takes top card from game.discard array
  - Stores it temporarily in game.drawnCard
  - Marks that it was drawn from discard
*/
export function drawFromDiscard(game) {
  if (!game.discard || game.discard.length === 0) return;

  game.drawnCard = game.discard.pop();
  game.drawnFrom = "discard";
}


/* ============================================================
   HAND EXCHANGE
   ============================================================ */

/*
  Exchanges the drawn card with a selected card in the
  current player's hand.
  - Selected hand card goes to discard pile
  - Drawn card replaces it in hand
  - Clears drawnCard state
*/
export function exchangeWithHand(game, handIndex) {
  const player = game.players[game.currentTurn];
  if (!game.drawnCard) return;

  const oldCard = player.hand[handIndex];
  game.discard.push(oldCard);

  player.hand[handIndex] = game.drawnCard;

  game.drawnCard = null;
  game.drawnFrom = null;
}


/* ============================================================
   TURN MANAGEMENT
   ============================================================ */

/*
  Ends the current player's turn.
  - Checks if game should end after Kabo
  - Clears drawn card state
  - Advances to the next player
*/
export function endTurn(game) {
  if (game.gameOver) return;

  // If final turn after Kabo → game ends
  if (
    game.kaboCalledBy !== null &&
    game.currentTurn === game.finalTurnIndex
  ) {
    game.gameOver = true;
    console.log("GAME OVER");
    return;
  }

  game.drawnCard = null;
  game.drawnFrom = null;

  game.currentTurn =
    (game.currentTurn + 1) % game.players.length;
}


/*
  Called when a player declares "Kabo".
  - Marks who called Kabo
  - Determines which player gets the final turn
*/
export function callKabo(game) {
  if (game.kaboCalledBy !== null) return;

  game.kaboCalledBy = game.currentTurn;

  game.finalTurnIndex =
    (game.currentTurn - 1 + game.players.length) %
    game.players.length;
}


/* ============================================================
   THROW & POWER-UP LOGIC
   ============================================================ */

/*
  Throws the drawn card (only if drawn from deck).
  - Places card into discard pile
  - Sets stackRank for stack rule
  - Activates power-ups for Queen and 9
*/
export function throwDrawnCard(game) {
  if (!game.drawnCard) return;
  if (game.drawnFrom !== "deck") return;

  const card = game.drawnCard;

  game.discard.push(card);
  game.drawnCard = null;
  game.drawnFrom = null;

  // Stack rule starts
  game.stackRank = card.rank;

  // Power-ups
  if (card.rank === "Q") {
    game.powerMode = "queen";
  } else if (card.rank === 9) {
    game.powerMode = "nine";
  }
}


/*
  Queen power-up:
  - Swaps any two cards between any two players
  - Clears queen power mode after use
*/
export function queenSwap(game, p1, i1, p2, i2) {
  if (game.powerMode !== "queen") return;

  const card1 = game.players[p1].hand[i1];
  const card2 = game.players[p2].hand[i2];

  game.players[p1].hand[i1] = card2;
  game.players[p2].hand[i2] = card1;

  game.powerMode = null;
}


/*
  Nine power-up:
  - Reveals one card from current player's hand (console only)
  - Clears power mode after peek
*/
export function peekCard(game, cardIndex) {
  if (game.powerMode !== "nine") return;

  const player = game.players[game.currentTurn];

  console.log("Peeked card:", player.hand[cardIndex]);

  game.powerMode = null;
}


/* ============================================================
   STACK RULE
   ============================================================ */

/*
  Stack drop attempt:
  - If card rank matches stackRank → card is removed
  - If wrong → player draws 1 penalty card
  - Stack opportunity ends either way
*/
export function stackDrop(game, playerIndex, handIndex) {
  if (game.stackRank === null) return;

  const player = game.players[playerIndex];
  const attemptedCard = player.hand[handIndex];

  if (attemptedCard.rank === game.stackRank) {
    player.hand.splice(handIndex, 1);
    console.log("Stack correct:", attemptedCard);
  } else {
    if (game.deck.length > 0) {
      const penaltyCard = game.deck.pop();
      player.hand.push(penaltyCard);
      console.log("Stack wrong, penalty:", penaltyCard);
    }
  }

  game.stackRank = null;
}


/* ============================================================
   GAME END & SCORING
   ============================================================ */

/*
  Reveals all players' hands at the end of the game
*/
export function revealAll(game) {
  game.players.forEach(player => {
    player.revealed = true;
  });
}


/*
  Calculates total score for each player
  - Sums values of cards in each hand
  - Returns an array of score objects
*/
export function calculateScores(game) {
  return game.players.map(player => {
    const score = player.hand.reduce(
      (sum, card) => sum + card.value,
      0
    );

    return {
      playerId: player.id,
      name: player.name,
      score,
    };
  });
}


/*
  Determines the winner(s)
  - Finds lowest score
  - Returns all players who share that score
*/
export function determineWinners(scores) {
  const minScore = Math.min(...scores.map(s => s.score));
  return scores.filter(s => s.score === minScore);
}
