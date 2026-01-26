// App entry: imports game setup from rules and runs it once on render.
// Connection: App -> setupGame (rules) -> createDeck (deck)
import { setupGame } from "./game/rules";

export default function App() {
  // Creates a fresh game state for 2 players
  const game = setupGame(2);
  // Logs the generated state to verify wiring is correct
  console.log(game);
  // Minimal UI placeholder for now
  return <h1>Check console</h1>;
}
