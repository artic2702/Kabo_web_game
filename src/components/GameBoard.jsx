import { useState, useRef, useEffect } from "react";
import { setupGame } from "../game/rules";
import { peekAtCard, finishPeekPhase, resetPeek } from "../game/actions";
import {
  drawFromDeck,
  drawFromDiscard,
  exchangeWithHand,
  throwDrawnCard,
  endTurn,
} from "../game/actions";
import StartScreen from "./StartScreen";
import PlayerPosition from "./PlayerPosition";
import TableCenter from "./TableCenter";
import PeekPhaseUI from "./PeekPhaseUI";
import "../styles/gameboard.css";

export default function GameBoard() {
  const gameRef = useRef(null);
  const [gameState, setGameState] = useState(null);
  const [peekedCard, setPeekedCard] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [message, setMessage] = useState("");
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [playerCount, setPlayerCount] = useState(2);

  // Handle game start from StartScreen
  const handleGameStart = (numPlayers) => {
    setPlayerCount(numPlayers);
    setShowStartScreen(false);
    gameRef.current = null; // Reset game ref to initialize new game
  };

  // Initialize game
  useEffect(() => {
    if (!showStartScreen && !gameRef.current) {
      gameRef.current = setupGame(playerCount);
      setGameState({ ...gameRef.current });
    }
  }, [showStartScreen, playerCount]);

  if (showStartScreen) {
    return <StartScreen onStart={handleGameStart} />;
  }

  const game = gameRef.current;

  const handlePeek = (cardIndex) => {
    const card = peekAtCard(game, cardIndex);
    setPeekedCard(card);
    setGameState({ ...game });
  };

  const handleFinishPeek = () => {
    finishPeekPhase(game);
    setPeekedCard(null);
    setGameState({ ...game });
    if (game.gamePhase === "setup" && game.peekPhasePlayer < game.players.length) {
      setMessage(`${game.players[game.peekPhasePlayer].name}'s turn to peek!`);
    } else if (game.gamePhase === "playing") {
      setMessage("Game starts!");
      setTimeout(() => setMessage(""), 1500);
    }
  };

  const handleResetPeek = () => {
    resetPeek(game);
    setPeekedCard(null);
    setGameState({ ...game });
  };

  const handleDrawFromDeck = () => {
    drawFromDeck(game);
    setSelectedCard(null);
    setMessage(`Drew from deck`);
    setGameState({ ...game });
    setTimeout(() => setMessage(""), 1500);
  };

  const handleDrawFromDiscard = () => {
    drawFromDiscard(game);
    setSelectedCard(null);
    setMessage(`Drew from discard`);
    setGameState({ ...game });
    setTimeout(() => setMessage(""), 1500);
  };

  const handleSelectCard = (cardIndex) => {
    if (game.drawnCard === null) {
      setMessage("Draw a card first!");
      setTimeout(() => setMessage(""), 1500);
      return;
    }

    // Exchange the drawn card with selected hand card
    exchangeWithHand(game, cardIndex);
    endTurn(game);
    setSelectedCard(null);
    setMessage(`Next: ${game.players[game.currentTurn].name}`);
    setGameState({ ...game });
    setTimeout(() => setMessage(""), 1500);
  };

  if (!gameState)
    return (
      <div className="flex items-center justify-center h-screen">Loading...</div>
    );

  const isCurrentPlayer =
    game.gamePhase === "playing" &&
    game.currentTurn === 0;

  return (
    <div className="game-board">
      {/* Circular table background */}
      <div className="table-container">
        {/* Players positioned in circle */}
        <div className="players-circle">
          {game.players.map((player, index) => (
            <PlayerPosition
              key={player.id}
              player={player}
              index={index}
              totalPlayers={game.players.length}
              isCurrentTurn={game.currentTurn === index && game.gamePhase === "playing"}
              isSelected={game.currentTurn === index && game.drawnCard !== null}
              selectedCardIndex={game.currentTurn === index ? selectedCard : null}
              onSelectCard={handleSelectCard}
            />
          ))}
        </div>

        {/* Center of table - Deck and Discard */}
        <TableCenter
          deck={game.deck}
          discard={game.discard}
          drawnCard={game.drawnCard}
          onDrawDeck={handleDrawFromDeck}
          onDrawDiscard={handleDrawFromDiscard}
        />
      </div>

      {/* Game Messages - REMOVED */}
      {/* {message && <div className="game-message">{message}</div>} */}

      {/* Peek Phase UI */}
      {game.gamePhase === "setup" && (
        <PeekPhaseUI
          currentPlayer={game.players[game.peekPhasePlayer]}
          peekedCard={peekedCard}
          onPeek={handlePeek}
          onFinish={handleFinishPeek}
          onReset={handleResetPeek}
        />
      )}

      {/* Game Status */}
      <div className="game-status">
        <p>
          Turn: <strong>{game.players[game.currentTurn].name}</strong>
        </p>
        {game.drawnCard && isCurrentPlayer && (
          <p style={{ color: '#667eea', fontSize: '12px', marginTop: '8px' }}>
            💡 Click a card to exchange
          </p>
        )}
        {game.kaboCalledBy !== null && (
          <p className="kabo-alert">⚡ KABO! Final round!</p>
        )}
      </div>
    </div>
  );
}
