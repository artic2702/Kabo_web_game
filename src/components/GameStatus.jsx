/**
 * Agent 3: UI/UX Engineer
 * GameStatus.jsx — Top bar with turn info, phase, and connection status
 */

export default function GameStatus({
  currentPlayerName,
  gamePhase,
  turnPhase,
  kaboCalledBy,
  players,
  lastAction,
  connectionStatus,
  roomCode,
  myPlayerId,
  currentTurn,
}) {
  const getPhaseLabel = () => {
    switch (gamePhase) {
      case 'setup': return 'Setup';
      case 'playing': return 'Playing';
      case 'finalRound': return 'Final Round';
      case 'ended': return 'Game Over';
      default: return '';
    }
  };

  const callerName = kaboCalledBy !== null ? players?.[kaboCalledBy]?.name : null;
  const isMyTurn = myPlayerId !== null && myPlayerId !== undefined && currentTurn === myPlayerId;

  if (gamePhase === 'lobby' || gamePhase === 'setup') return null;

  return (
    <div className="game-status glass-dark">
      <span className="phase-badge">{getPhaseLabel()}</span>
      <span className="turn-info">
        {isMyTurn ? (
          <strong style={{ color: 'var(--color-success)' }}>Your Turn!</strong>
        ) : (
          <>Turn: <strong>{currentPlayerName}</strong></>
        )}
      </span>
      {callerName && (
        <span className="kabo-alert">⚡ KABO by {callerName}!</span>
      )}
      {roomCode && (
        <span style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          marginLeft: 'var(--space-3)',
        }}>
          Room: {roomCode}
        </span>
      )}
      {connectionStatus && connectionStatus !== 'connected' && (
        <span style={{
          fontSize: 'var(--text-xs)',
          color: connectionStatus === 'reconnecting' ? 'var(--color-warning)' : 'var(--color-danger)',
        }}>
          {connectionStatus === 'reconnecting' ? '🟡 Reconnecting...' : '🔴 Disconnected'}
        </span>
      )}
    </div>
  );
}
