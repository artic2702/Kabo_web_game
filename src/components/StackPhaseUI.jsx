/**
 * Agent 3: UI/UX Engineer
 * StackPhaseUI.jsx — Stack rule interaction with countdown timer
 */

import { useState, useEffect, useRef } from 'react';

const STACK_TIMER_MS = 8000; // 8 seconds for stack window

export default function StackPhaseUI({
  stackRank,
  stackEligiblePlayers,
  players,
  onPass,
  onTimeout,
}) {
  const [timeLeft, setTimeLeft] = useState(STACK_TIMER_MS);
  const startTimeRef = useRef(Date.now());

  // Countdown timer
  useEffect(() => {
    startTimeRef.current = Date.now();
    setTimeLeft(STACK_TIMER_MS);

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, STACK_TIMER_MS - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        // Auto-pass all remaining eligible players
        if (onTimeout) {
          onTimeout();
        } else if (stackEligiblePlayers) {
          stackEligiblePlayers.forEach(id => onPass(id));
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [stackRank]); // Reset when a new stack phase starts

  if (!stackRank || !stackEligiblePlayers || stackEligiblePlayers.length === 0) {
    return null;
  }

  const progress = (timeLeft / STACK_TIMER_MS) * 100;

  const eligibleNames = stackEligiblePlayers
    .map(id => players[id]?.name)
    .filter(Boolean)
    .join(', ');

  return (
    <div className="stack-phase-overlay">
      <div className="stack-phase-banner glass-dark">
        <div style={{ fontSize: '24px' }}>⚡</div>
        <div style={{ flex: 1 }}>
          <div className="stack-phase-text">
            Stack! Match a {stackRank}
          </div>
          <div className="stack-phase-hint">
            {eligibleNames} — click a matching card to drop it
          </div>
          <div className="stack-timer">
            <div
              className="stack-timer-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <button
          className="btn btn-ghost"
          onClick={() => {
            stackEligiblePlayers.forEach(id => onPass(id));
          }}
        >
          Pass
        </button>
      </div>
    </div>
  );
}
