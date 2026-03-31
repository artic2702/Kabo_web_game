/**
 * Agent 3: UI/UX Engineer
 * TableCenter.jsx — Deck, discard pile, and drawn card display
 */

import Card from './Card';

export default function TableCenter({
  deckCount,
  topDiscard,
  drawnCard,
  drawnFrom,
  onDrawDeck,
  onDrawDiscard,
  onThrowCard,
  onExchangeCard,
  canDraw,
  canThrow,
  canExchange,
}) {
  return (
    <div className="table-center">
      {/* Deck pile */}
      <div className="deck-area">
        <div className="pile-label">Deck</div>
        <button
          className="deck-pile"
          onClick={onDrawDeck}
          disabled={!canDraw}
        >
          <Card card={null} faceUp={false} />
        </button>
        <div className="deck-count">{deckCount} cards</div>
      </div>

      {/* Discard pile */}
      <div className="discard-area">
        <div className="pile-label">Discard</div>
        <button
          className="discard-pile"
          onClick={onDrawDiscard}
          disabled={!canDraw}
        >
          {topDiscard ? (
            <Card card={topDiscard} faceUp={true} />
          ) : (
            <div className="empty-pile">Empty</div>
          )}
        </button>
        <div className="discard-count" />
      </div>

      {/* Drawn card display */}
      {drawnCard && (
        <div className="drawn-card-display">
          <div className="label">Drawn Card</div>
          <Card card={drawnCard} faceUp={true} size="lg" />
          <div className="drawn-card-actions">
            {canThrow && (
              <button className="btn btn-danger" onClick={onThrowCard}>
                🗑️ Throw
              </button>
            )}
            {canExchange && (
              <span className="action-hint" style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                👆 Click a card to swap
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
