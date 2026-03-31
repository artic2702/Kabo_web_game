import Card from "./Card";

export default function TableCenter({
  deck,
  discard,
  drawnCard,
  onDrawDeck,
  onDrawDiscard,
}) {
  return (
    <div className="table-center">
      {/* Deck pile */}
      <div className="deck-area">
        <div className="pile-label">Deck</div>
        <button className="deck-pile clickable" onClick={onDrawDeck}>
          <Card card={null} faceUp={false} />
          <div className="deck-count">{deck.length} cards</div>
        </button>
      </div>

      {/* Discard pile */}
      <div className="discard-area">
        <div className="pile-label">Discard</div>
        <button
          className="discard-pile clickable"
          onClick={onDrawDiscard}
          disabled={discard.length === 0}
        >
          {discard.length > 0 ? (
            <Card card={discard[discard.length - 1]} faceUp={true} />
          ) : (
            <div className="empty-pile">Empty</div>
          )}
          <div className="discard-count">{discard.length} cards</div>
        </button>
      </div>

      {/* Drawn card (temporary display) */}
      {drawnCard && (
        <div className="drawn-card-display">
          <div className="label">Your Card</div>
          <Card card={drawnCard} faceUp={true} />
        </div>
      )}
    </div>
  );
}
