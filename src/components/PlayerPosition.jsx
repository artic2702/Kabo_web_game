/**
 * Agent 3: UI/UX Engineer
 * PlayerPosition.jsx — Circular player positioning
 */

import PlayerHand from './PlayerHand';

export default function PlayerPosition({
  player,
  index,
  totalPlayers,
  isCurrentTurn,
  canSelectCards,
  onCardClick,
  highlightedCards,
  scores,
  winners,
}) {
  // Calculate angle for circular positioning
  // +90° offset puts index 0 at the BOTTOM (facing the player)
  const angle = (index / totalPlayers) * 360;
  const radius = 320; // Distance from center
  const x = Math.cos((angle + 90) * (Math.PI / 180)) * radius;
  const y = Math.sin((angle + 90) * (Math.PI / 180)) * radius;

  const isWinner = winners?.some(w => w.playerId === player.id);
  const playerScore = scores?.find(s => s.playerId === player.id);

  return (
    <div
      className={`player-position ${isCurrentTurn ? 'current-turn' : ''}`}
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      {/* Player name badge */}
      <div className="player-name">{player.name}</div>

      {/* Player's cards */}
      <PlayerHand
        player={player}
        isCurrentTurn={isCurrentTurn}
        canSelectCards={canSelectCards}
        onCardClick={onCardClick}
        highlightedCards={highlightedCards}
      />

      {/* Score display (game end) */}
      {player.revealed && playerScore && (
        <div className={`player-score ${isWinner ? 'winner' : ''}`}>
          {isWinner ? '👑 ' : ''}
          {playerScore.score} pts
          {playerScore.kaboBonus && ' ⭐'}
          {playerScore.kaboPenalty && ' +10'}
        </div>
      )}
    </div>
  );
}
