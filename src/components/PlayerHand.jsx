/**
 * Agent 3: UI/UX Engineer
 * PlayerHand.jsx — Manages cards within a player slot
 */

import Card from './Card';

export default function PlayerHand({
  player,
  isCurrentTurn,
  canSelectCards,
  onCardClick,
  highlightedCards = [],
}) {
  return (
    <div className="player-hand">
      {player.hand.map((card, index) => (
        <Card
          key={card?.id || index}
          card={card}
          faceUp={player.visible[index] || player.revealed}
          cardIndex={index}
          onClick={onCardClick}
          isSelectable={canSelectCards}
          isHighlighted={highlightedCards.includes(index)}
        />
      ))}
    </div>
  );
}
