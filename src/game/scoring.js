/**
 * Agent 2: Game Logic Engineer
 * scoring.js — Score calculation and winner determination
 */

/**
 * Calculates the total hand value for each player.
 *
 * @param {import('./types.js').Player[]} players
 * @returns {{ playerId: number, name: string, score: number, hand: import('./types.js').Card[] }[]}
 */
export function calculateScores(players) {
  return players.map(player => ({
    playerId: player.id,
    name: player.name,
    score: player.hand.reduce((sum, card) => sum + card.value, 0),
    hand: player.hand,
  }));
}

/**
 * Determines the winner(s) from a scores array.
 * Returns all players tied at the lowest score.
 *
 * @param {{ playerId: number, name: string, score: number }[]} scores
 * @returns {{ playerId: number, name: string, score: number }[]}
 */
export function determineWinners(scores) {
  if (scores.length === 0) return [];
  const minScore = Math.min(...scores.map(s => s.score));
  return scores.filter(s => s.score === minScore);
}

/**
 * Applies Kabo-specific scoring rules.
 * - If the caller has the lowest score → they win normally
 * - If the caller does NOT have the lowest → they get +KABO_PENALTY added
 *
 * @param {{ playerId: number, name: string, score: number }[]} scores
 * @param {number|null} kaboCalledBy - Index of the player who called Kabo
 * @param {number} penalty - Penalty points to add (default 10)
 * @returns {{ playerId: number, name: string, score: number, kaboBonus: boolean, kaboPenalty: boolean }[]}
 */
export function applyKaboScoring(scores, kaboCalledBy, penalty = 10) {
  if (kaboCalledBy === null) {
    return scores.map(s => ({ ...s, kaboBonus: false, kaboPenalty: false }));
  }

  const minScore = Math.min(...scores.map(s => s.score));
  const callerScore = scores.find(s => s.playerId === kaboCalledBy);

  if (!callerScore) {
    return scores.map(s => ({ ...s, kaboBonus: false, kaboPenalty: false }));
  }

  const callerHasLowest = callerScore.score === minScore;

  return scores.map(s => {
    if (s.playerId === kaboCalledBy) {
      if (callerHasLowest) {
        // Caller wins — bonus: score counts as 0
        return { ...s, score: 0, kaboBonus: true, kaboPenalty: false };
      } else {
        // Caller failed — penalty added
        return { ...s, score: s.score + penalty, kaboBonus: false, kaboPenalty: true };
      }
    }
    return { ...s, kaboBonus: false, kaboPenalty: false };
  });
}
