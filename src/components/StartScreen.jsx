import { useState } from "react";

export default function StartScreen({ onStart }) {
  const [playerCount, setPlayerCount] = useState(2);

  const handleStart = () => {
    if (playerCount >= 2 && playerCount <= 10) {
      onStart(playerCount);
    }
  };

  return (
    <div className="start-screen">
      <div className="start-container">
        <h1 className="start-title">KABO</h1>
        <p className="start-subtitle">Card Game</p>

        <div className="player-selection">
          <label>Number of Players:</label>
          <div className="player-input-group">
            <button
              className="player-btn-minus"
              onClick={() => setPlayerCount(Math.max(2, playerCount - 1))}
            >
              −
            </button>
            <input
              type="number"
              min="2"
              max="10"
              value={playerCount}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (val >= 2 && val <= 10) setPlayerCount(val);
              }}
              className="player-input"
            />
            <button
              className="player-btn-plus"
              onClick={() => setPlayerCount(Math.min(10, playerCount + 1))}
            >
              +
            </button>
          </div>
        </div>

        <button className="btn-start" onClick={handleStart}>
          START GAME
        </button>

        <p className="game-info">
          Players will take turns peeking at 2 cards, then compete to have the
          lowest hand value.
        </p>
      </div>
    </div>
  );
}
