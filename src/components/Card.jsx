export default function Card({
  card,
  faceUp,
  cardIndex,
  onClick,
  isSelectable,
  isSelected,
}) {
  const getCardImagePath = () => {
    if (!card) return null;

    // Map full suit names to file names
    const suitMap = {
      hearts: 'heart',
      diamonds: 'diamond',
      spades: 'spade',
      clubs: 'club'
    };

    const suit = suitMap[card.suit.toLowerCase()] || card.suit.toLowerCase();
    let rank = card.rank;

    // Convert rank to image filename format
    if (rank === "J") rank = "jack";
    else if (rank === "Q") rank = "queen";
    else if (rank === "K") rank = "king";

    return `/cards/${suit}_${rank}.png`;
  };

  return (
    <div
      className={`card ${faceUp ? "face-up" : "face-down"} ${isSelectable ? "selectable" : ""} ${isSelected ? "selected" : ""}`}
      onClick={() => isSelectable && onClick?.(cardIndex)}
    >
      {faceUp && card ? (
        <img
          src={getCardImagePath()}
          alt={`${card.rank} of ${card.suit}`}
          className="card-image"
        />
      ) : (
        <img
          src="/cards/back.png"
          alt="Card back"
          className="card-image"
        />
      )}
    </div>
  );
}
