import { useEffect } from "react";
import Card from "./Card";

export default function PeekPhaseUI({
  currentPlayer,
  peekedCard,
  onPeek,
  onFinish,
  onReset,
}) {
  if (!currentPlayer) return null;

  const peekedCount = currentPlayer.peekedCards?.length || 0;

  // Auto-finish when 2 cards are peeked
  useEffect(() => {
    if (peekedCount === 2) {
      const timer = setTimeout(() => {
        onFinish();
      }, 500); // Small delay for UX feedback
      return () => clearTimeout(timer);
    }
  }, [peekedCount, onFinish]);

  return (
    <div className="peek-phase-overlay">
      <div className="peek-phase-modal">
        <h2 className="text-2xl font-bold mb-4">
          {currentPlayer.name}, Peek at 2 Cards
        </h2>

        <div className="peek-instruction">
          <p>Click on 2 cards to peek at them. Try to remember!</p>
          <p className="text-sm text-gray-500">Peeked: {peekedCount}/2</p>
        </div>

        {/* Card selection - horizontal */}
        <div className="peek-cards-horizontal">
          {currentPlayer.hand.map((card, index) => {
            const isPeeked = currentPlayer.peekedCards.includes(index);
            return (
              <div
                key={index}
                className={`peek-card-wrapper ${isPeeked ? "peeked" : ""}`}
              >
                <button
                  className={`peek-card-btn ${isPeeked ? "selected" : ""}`}
                  onClick={() => onPeek(index)}
                  disabled={!isPeeked && peekedCount >= 2}
                >
                  <Card card={isPeeked ? card : null} faceUp={isPeeked} />
                  <span className="card-number">Card {index + 1}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Peeked card display */}
        {peekedCard && (
          <div className="peeked-display">
            <h3>You peeked:</h3>
            <Card card={peekedCard} faceUp={true} />
            <p>
              {peekedCard.rank} of {peekedCard.suit} - Value: {peekedCard.value}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
