/**
 * Agent 3: UI/UX Engineer
 * Card.jsx — Individual card with flip, drag, and animation support
 */

export default function Card({
  card,
  faceUp = false,
  cardIndex,
  onClick,
  isSelectable = false,
  isSelected = false,
  isHighlighted = false,
  animationClass = '',
  size = 'md',
}) {
  const getCardImagePath = () => {
    if (!card) return null;

    const suitMap = {
      hearts: 'heart',
      diamonds: 'diamond',
      spades: 'spade',
      clubs: 'club',
    };

    const suit = suitMap[card.suit?.toLowerCase()] || card.suit?.toLowerCase();
    let rank = card.rank;

    if (rank === 'J') rank = 'jack';
    else if (rank === 'Q') rank = 'queen';
    else if (rank === 'K') rank = 'king';

    return `/cards/${suit}_${rank}.png`;
  };

  const sizeClass = size !== 'md' ? `size-${size}` : '';

  const classes = [
    'card',
    faceUp ? 'face-up' : 'face-down',
    isSelectable ? 'selectable' : '',
    isSelected ? 'selected' : '',
    isHighlighted ? 'highlighted' : '',
    sizeClass,
    animationClass,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (isSelectable && onClick) {
      onClick(cardIndex);
    }
  };

  return (
    <div className={classes} onClick={handleClick}>
      <div className="card-inner">
        {faceUp && card ? (
          <img
            src={getCardImagePath()}
            alt={`${card.rank} of ${card.suit}`}
            className="card-image"
            draggable={false}
          />
        ) : (
          <img
            src="/cards/back.png"
            alt="Card back"
            className="card-image"
            draggable={false}
          />
        )}
      </div>
    </div>
  );
}
