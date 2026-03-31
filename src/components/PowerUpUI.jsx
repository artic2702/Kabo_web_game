/**
 * Agent 3: UI/UX Engineer
 * PowerUpUI.jsx — Queen swap & Nine peek overlays
 */

export default function PowerUpUI({
  powerMode,
  powerState,
  currentPlayerName,
  onSkip,
}) {
  if (!powerMode) return null;

  const isQueen = powerMode === 'queen';
  const isNine = powerMode === 'nine';

  const queenStep = powerState?.firstSelection
    ? 'Select the SECOND card to complete the swap'
    : 'Select the FIRST card from any player';

  return (
    <div className="power-up-overlay">
      <div className="power-up-banner glass-dark">
        <div className="power-up-icon">
          {isQueen ? '👸' : '🔍'}
        </div>

        <div>
          <div className={`power-up-title ${powerMode}`}>
            {isQueen ? 'Queen Power — Swap' : 'Nine Power — Peek'}
          </div>
          <div className="power-up-desc">
            {isQueen
              ? `${currentPlayerName}, swap any two cards between any players!`
              : `${currentPlayerName}, peek at one of your own cards!`
            }
          </div>
          {isQueen && (
            <div className="power-up-step">{queenStep}</div>
          )}
          {isNine && (
            <div className="power-up-step">Click one of your face-down cards</div>
          )}
        </div>

        <button className="btn btn-ghost" onClick={onSkip}>
          Skip
        </button>
      </div>
    </div>
  );
}
