/**
 * Agent 3: UI/UX Engineer
 * GameEndScreen.jsx — Final scores, winner display, replay button
 */

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

  return (
    <div className="game-end-overlay">
      <div className="game-end-modal">
        <div className="game-end-title winner">🏆 Game Over!</div>
        <div className="game-end-winner-name">
          {winnerNames} wins!
        </div>

        {callerName && (
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-4)',
          }}>
            Kabo called by: <strong style={{ color: 'var(--color-accent-gold)' }}>{callerName}</strong>
          </p>
        )}

        {/* Score table */}
        <table className="score-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {scores
              .sort((a, b) => a.score - b.score)
              .map((score, idx) => {
                const isWinner = winners.some(w => w.playerId === score.playerId);
                return (
                  <tr key={score.playerId} className={isWinner ? 'winner-row' : ''}>
                    <td>{idx + 1}</td>
                    <td>
                      {isWinner ? '👑 ' : ''}
                      {score.name}
                    </td>
                    <td className="score-value">{score.score}</td>
                    <td>
                      {score.kaboBonus && (
                        <span className="kabo-badge bonus">Kabo ✓</span>
                      )}
                      {score.kaboPenalty && (
                        <span className="kabo-badge penalty">Kabo ✗ +10</span>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        <div className="game-end-actions">
          <button className="btn btn-primary" onClick={onRestart}>
            🔄 Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
