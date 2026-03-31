/**
 * Agent 3: UI/UX Engineer
 * PeekPhaseUI.jsx — Setup phase where each player peeks at 2 cards
 */

import { useEffect } from 'react';
import Card from './Card';

export default function PeekPhaseUI({
  currentPlayer,
  peekedCardData,
  onPeek,
  onFinish,
  onReset,
}) {
  const peekedCount = currentPlayer?.peekedCards?.length || 0;

  // Auto-finish when 2 cards are peeked
  useEffect(() => {
    if (!currentPlayer) return;
    if (peekedCount === 2) {
      const timer = setTimeout(() => {
        onFinish();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [peekedCount, onFinish, currentPlayer]);

  if (!currentPlayer) return null;

  return (
    <div className="peek-phase-overlay">
      <div className="peek-phase-modal">
        <h2>{currentPlayer.name}</h2>
        <div className="overlay-subtitle">Memorise 2 of your cards</div>

        <div className="peek-instruction">
          <p>Click on 2 cards to peek at them. Try to remember!</p>
          <p className="peek-counter">
            {peekedCount}/2 peeked
          </p>
        </div>

        {/* Card selection */}
        <div className="peek-cards-horizontal">
          {currentPlayer.hand.map((card, index) => {
            const isPeeked = currentPlayer.peekedCards.includes(index);
            return (
              <div key={index} className="peek-card-wrapper">
                <button
                  className={`peek-card-btn ${isPeeked ? 'selected' : ''}`}
                  onClick={() => onPeek(index)}
                  disabled={!isPeeked && peekedCount >= 2}
                >
                  <Card
                    card={isPeeked ? card : null}
                    faceUp={isPeeked}
                    animationClass={isPeeked ? 'flipping' : ''}
                  />
                  <span className="card-number">Card {index + 1}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Peeked card info */}
        {peekedCardData && (
          <div className="peeked-display">
            <h3>👁️ You peeked:</h3>
            <Card card={peekedCardData} faceUp={true} />
            <p>
              {peekedCardData.rank} of {peekedCardData.suit} — Value: {peekedCardData.value}
            </p>
          </div>
        )}

        {/* Reset button */}
        {peekedCount > 0 && peekedCount < 2 && (
          <div className="overlay-actions">
            <button className="btn btn-ghost" onClick={onReset}>
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
