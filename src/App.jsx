import { useRef } from "react";
import { setupGame } from "./game/rules";
import { revealAll, calculateScores, determineWinners } from "./game/actions";

export default function App() {
  const gameRef = useRef(null);

  if (!gameRef.current) {
    gameRef.current = setupGame(2);

    // force endgame for testing
    gameRef.current.gameOver = true;
  }

  const game = gameRef.current;

  if (game.gameOver) {
    revealAll(game);

    const scores = calculateScores(game);
    const winners = determineWinners(scores);

    console.log("Scores:", scores);
    console.log("Winners:", winners);
  }

  return <h1>Endgame test</h1>;
}
