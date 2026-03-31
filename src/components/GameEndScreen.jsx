/**
 * GameEndScreen.jsx — Final results with all hands revealed
 * Shows scores table + each player's cards face-up
 */

import Card from './Card';

export default function GameEndScreen({
  scores,
  winners,
  kaboCalledBy,
  players,
  onRestart,
}) {
  if (!scores || !winners) return null;

  const winnerNames = winners.map(w => w.name).join(' & ');
  const callerName = kaboCalledBy !== null ? players[kaboCalledBy]?.name : null;
  const sortedScores = [...scores].sort((a, b) => a.score - b.score);

  return (
    <div className="game-end-overlay">
      <div className="game-end-modal">
        {/* Trophy header */}
        <div className="game-end-header">
          <div className="game-end-trophy">🏆</div>
          <h2 className="game-end-title">Game Over!</h2>
          <div className="game-end-winner-name">{winnerNames} wins!</div>
          {callerName && (
            <p className="game-end-caller">
              Kabo called by <strong>{callerName}</strong>
            </p>
          )}
        </div>

        {/* All players' hands revealed */}
        <div className="game-end-hands">
          {sortedScores.map((score, idx) => {
            const player = players.find(p => p.id === score.playerId);
            const isWinner = winners.some(w => w.playerId === score.playerId);
            if (!player) return null;

            return (
              <div key={score.playerId} className={`end-hand ${isWinner ? 'end-hand-winner' : ''}`}>
                <div className="end-hand-header">
                  <span className="end-hand-rank">#{idx + 1}</span>
                  <span className="end-hand-name">
                    {isWinner && '👑 '}{score.name}
                  </span>
                  <span className="end-hand-score">
                    {score.score} pts
                    {score.kaboBonus && <span className="kb-tag kb-bonus">Kabo ✓</span>}
                    {score.kaboPenalty && <span className="kb-tag kb-penalty">+10</span>}
                  </span>
                </div>
                <div className="end-hand-cards">
                  {player.hand.map((card, i) => (
                    <Card
                      key={card.id || i}
                      card={card}
                      faceUp={true}
                      size="sm"
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Play again */}
        <div className="game-end-actions">
          <button className="btn btn-primary game-end-btn" onClick={onRestart}>
            🔄 Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
