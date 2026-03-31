export default function GameControls({
  game,
  selectedCard,
  drawnCard,
  onSelectCard,
  onSwapCard,
  onThrowCard,
  onDrawDeck,
  onDrawDiscard,
  onCallKabo,
}) {
  return (
    <div className="game-controls">
      <h3>Your Turn</h3>

      {/* Draw Phase */}
      {!drawnCard && (
        <div className="control-section">
          <h4>Step 1: Draw a Card</h4>
          <div className="button-group">
            <button className="btn-primary" onClick={onDrawDeck}>
              Draw from Deck
            </button>
            <button className="btn-primary" onClick={onDrawDiscard}>
              Draw from Discard
            </button>
          </div>
        </div>
      )}

      {/* Swap/Exchange Phase */}
      {drawnCard && !selectedCard && (
        <div className="control-section">
          <h4>Step 2: Choose an action</h4>
          <p className="instruction">
            Click on one of your cards to swap with the drawn card, or throw it
            away.
          </p>
          <div className="button-group">
            <button className="btn-danger" onClick={onThrowCard}>
              Throw Away Card
            </button>
          </div>
        </div>
      )}

      {/* Confirm Swap */}
      {drawnCard && selectedCard !== null && (
        <div className="control-section">
          <h4>Step 3: Confirm Swap</h4>
          <p className="instruction">
            Swapping Card {selectedCard + 1} with drawn card
          </p>
          <div className="button-group">
            <button className="btn-success" onClick={onSwapCard}>
              Confirm Swap
            </button>
          </div>
        </div>
      )}

      {/* Kabo Option */}
      <div className="control-section">
        <button className="btn-kabo" onClick={onCallKabo}>
          Call KABO!
        </button>
        <p className="kabo-hint">
          Call KABO when you think you have the lowest hand!
        </p>
      </div>
    </div>
  );
}
