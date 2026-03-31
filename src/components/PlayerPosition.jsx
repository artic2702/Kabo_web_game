import Card from "./Card";

export default function PlayerPosition({
  player,
  index,
  totalPlayers,
  isCurrentTurn,
  isSelected,
  selectedCardIndex,
  onSelectCard,
}) {
  // Calculate angle for circular positioning
  const angle = (index / totalPlayers) * 360;
  const radius = 300; // Distance from center
  const x = Math.cos((angle - 90) * (Math.PI / 180)) * radius;
  const y = Math.sin((angle - 90) * (Math.PI / 180)) * radius;

  return (
    <div
      className={`player-position ${isCurrentTurn ? "current-turn" : ""}`}
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      {/* Player name */}
      <div className="player-name">{player.name}</div>

      {/* Player's 4 cards in a row */}
      <div className="player-hand">
        {player.hand.map((card, cardIndex) => (
          <Card
            key={cardIndex}
            card={card}
            faceUp={player.visible[cardIndex] || player.revealed}
            cardIndex={cardIndex}
            onClick={onSelectCard}
            isSelectable={isSelected}
            isSelected={selectedCardIndex === cardIndex}
          />
        ))}
      </div>

      {/* Score display (game end) */}
      {player.revealed && (
        <div className="player-score">
          Score: {player.hand.reduce((sum, card) => sum + card.value, 0)}
        </div>
      )}
    </div>
  );
}
