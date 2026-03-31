/**
 * Agent 2: Game Logic Engineer
 * deck.js — Deck creation and shuffling
 */

import { SUITS, RED_SUITS, FACE_CARD_VALUES } from './constants.js';

/**
 * Creates a shuffled 52-card deck.
 *
 * Card id format: `${suit}_${rank}` (e.g. "hearts_5", "spades_K")
 * Number cards: rank 1–10, value = rank.
 * Face cards: J = 11, Q = 12.
 * Kings: red suits → 0, black suits → 13.
 *
 * @returns {import('./types.js').Card[]} Shuffled deck array (last = top)
 */
export function createDeck() {
  /** @type {import('./types.js').Card[]} */
  const deck = [];

  // Number cards 1–10
  for (let num = 1; num <= 10; num++) {
    for (const suit of SUITS) {
      deck.push({
        rank: num,
        suit,
        value: num,
        id: `${suit}_${num}`,
      });
    }
  }

  // Face cards
  for (const suit of SUITS) {
    // Jack
    deck.push({
      rank: 'J',
      suit,
      value: FACE_CARD_VALUES.J,
      id: `${suit}_J`,
    });

    // Queen
    deck.push({
      rank: 'Q',
      suit,
      value: FACE_CARD_VALUES.Q,
      id: `${suit}_Q`,
    });

    // King — red = 0, black = 13
    const kingValue = RED_SUITS.includes(suit) ? 0 : 13;
    deck.push({
      rank: 'K',
      suit,
      value: kingValue,
      id: `${suit}_K`,
    });
  }

  return shuffle(deck);
}

/**
 * Fisher–Yates in-place shuffle.
 *
 * @param {any[]} arr - Array to shuffle
 * @returns {any[]} The same array, shuffled
 */
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}