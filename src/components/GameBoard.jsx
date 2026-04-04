/**
 * GameBoard.jsx — LOCAL play game board
 * Uses useGameState hook for local-only game logic.
 */

import { useState, useRef, useEffect } from "react";
import { useGameState } from "../hooks/useGameState";
import { ACTION_TYPES, GAME_PHASES, TURN_PHASES } from "../game/index.js";
import {
  calculateScores,
  applyKaboScoring,
  determineWinners,
} from "../game/scoring.js";

import PlayerPosition from "./PlayerPosition";
import TableCenter from "./TableCenter";
import PeekPhaseUI from "./PeekPhaseUI";
import PowerUpUI from "./PowerUpUI";
import StackPhaseUI from "./StackPhaseUI";
import GameEndScreen from "./GameEndScreen";
import GameStatus from "./GameStatus";

import "../styles/variables.css";
import "../styles/gameboard.css";
import "../styles/cards.css";
import "../styles/overlays.css";

export default function GameBoard({ initialPlayerCount, onBack }) {
  const { gameState, dispatch, validActions, startGame, restartGame } =
    useGameState();

  const [peekedCard, setPeekedCard] = useState(null);
  const [endGameData, setEndGameData] = useState(null);

  // Start game on mount
  useEffect(() => {
    if (!gameState && initialPlayerCount) {
      startGame(initialPlayerCount);
    }
  }, [initialPlayerCount]);

  // Track game end
  const prevPhaseRef = useRef(null);
  useEffect(() => {
    if (!gameState) return;
    if (
      prevPhaseRef.current !== GAME_PHASES.ENDED &&
      gameState.gamePhase === GAME_PHASES.ENDED
    ) {
      const rawScores = calculateScores(gameState.players);
      const finalScores = applyKaboScoring(
        rawScores,
        gameState.kaboCalledBy,
        10,
      );
      const winners = determineWinners(finalScores);
      setEndGameData({ scores: finalScores, winners });
    }
    prevPhaseRef.current = gameState?.gamePhase;
  }, [gameState?.gamePhase]);

  // Auto-end turn
  useEffect(() => {
    if (!gameState) return;
    if (gameState.turnPhase === TURN_PHASES.TURN_END) {
      const timer = setTimeout(() => {
        dispatch({ type: ACTION_TYPES.END_TURN, payload: {} });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [gameState?.turnPhase, dispatch]);

  // Auto-end empty stack phase
  useEffect(() => {
    if (!gameState) return;
    if (
      gameState.stackPhaseActive &&
      gameState.stackEligiblePlayers.length === 0
    ) {
      const timer = setTimeout(() => {
        dispatch({ type: ACTION_TYPES.STACK_END, payload: {} });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [
    gameState?.stackPhaseActive,
    gameState?.stackEligiblePlayers?.length,
    dispatch,
  ]);

  if (!gameState) return null;

  const game = gameState;
  const currentPlayer = game.players[game.currentTurn];
  const canDo = (type) => validActions.includes(type);

  // Handlers
  const handlePeek = (cardIndex) => {
    dispatch({ type: ACTION_TYPES.PEEK_CARD, payload: { cardIndex } });
    const player = game.players[game.peekPhasePlayer];
    if (player?.hand[cardIndex]) setPeekedCard(player.hand[cardIndex]);
  };

  const handleFinishPeek = () => {
    dispatch({ type: ACTION_TYPES.FINISH_PEEK, payload: {} });
    setPeekedCard(null);
  };

  const handleResetPeek = () => {
    dispatch({ type: ACTION_TYPES.RESET_PEEK, payload: {} });
    setPeekedCard(null);
  };

  const handleCardClick = (playerIndex) => (cardIndex) => {
    if (
      playerIndex === game.currentTurn &&
      game.drawnCard &&
      (game.turnPhase === TURN_PHASES.DECIDING ||
        game.turnPhase === TURN_PHASES.DECIDING_DISCARD)
    ) {
      dispatch({
        type: ACTION_TYPES.EXCHANGE_WITH_HAND,
        payload: { handIndex: cardIndex },
      });
      return;
    }
    if (game.powerMode === "queen" && game.turnPhase === TURN_PHASES.POWER_UP) {
      dispatch({
        type: ACTION_TYPES.QUEEN_SELECT_CARD,
        payload: { playerId: playerIndex, cardIndex },
      });
      return;
    }
    if (
      game.powerMode === "nine" &&
      game.turnPhase === TURN_PHASES.POWER_UP &&
      playerIndex === game.currentTurn
    ) {
      dispatch({ type: ACTION_TYPES.NINE_PEEK, payload: { cardIndex } });
      return;
    }
    if (
      game.stackPhaseActive &&
      game.stackEligiblePlayers.includes(playerIndex)
    ) {
      dispatch({
        type: ACTION_TYPES.STACK_DROP,
        payload: { playerId: playerIndex, handIndex: cardIndex },
      });
      return;
    }
  };

  const getCanSelectCards = (playerIndex) => {
    if (
      playerIndex === game.currentTurn &&
      game.drawnCard &&
      (game.turnPhase === TURN_PHASES.DECIDING ||
        game.turnPhase === TURN_PHASES.DECIDING_DISCARD)
    )
      return true;
    if (game.powerMode === "queen" && game.turnPhase === TURN_PHASES.POWER_UP)
      return true;
    if (
      game.powerMode === "nine" &&
      game.turnPhase === TURN_PHASES.POWER_UP &&
      playerIndex === game.currentTurn
    )
      return true;
    if (
      game.stackPhaseActive &&
      game.stackEligiblePlayers.includes(playerIndex)
    )
      return true;
    return false;
  };

  const topDiscard =
    game.discard.length > 0 ? game.discard[game.discard.length - 1] : null;

  return (
    <div className="game-board">
      {/* Back button */}
      <button
        className="btn btn-ghost"
        onClick={onBack}
        style={{
          position: "fixed",
          top: "16px",
          left: "16px",
          zIndex: 50,
          fontSize: "13px",
        }}
      >
        ← Menu
      </button>

      <div className="table-container">
        <div className="players-circle">
          {game.players.map((player, index) => (
            <PlayerPosition
              key={player.id}
              player={player}
              index={index}
              totalPlayers={game.players.length}
              isCurrentTurn={
                game.currentTurn === index &&
                (game.gamePhase === GAME_PHASES.PLAYING ||
                  game.gamePhase === GAME_PHASES.FINAL_ROUND)
              }
              canSelectCards={getCanSelectCards(index)}
              onCardClick={handleCardClick(index)}
              highlightedCards={[]}
              scores={endGameData?.scores}
              winners={endGameData?.winners}
            />
          ))}
        </div>
        <TableCenter
          deckCount={game.deck.length}
          topDiscard={topDiscard}
          drawnCard={game.drawnCard}
          onDrawDeck={() =>
            dispatch({ type: ACTION_TYPES.DRAW_FROM_DECK, payload: {} })
          }
          onDrawDiscard={() =>
            dispatch({ type: ACTION_TYPES.DRAW_FROM_DISCARD, payload: {} })
          }
          onThrowCard={() =>
            dispatch({ type: ACTION_TYPES.THROW_DRAWN_CARD, payload: {} })
          }
          canDraw={
            canDo(ACTION_TYPES.DRAW_FROM_DECK) ||
            canDo(ACTION_TYPES.DRAW_FROM_DISCARD)
          }
          canThrow={canDo(ACTION_TYPES.THROW_DRAWN_CARD)}
          canExchange={canDo(ACTION_TYPES.EXCHANGE_WITH_HAND)}
        />
      </div>

      <GameStatus
        currentPlayerName={currentPlayer?.name}
        gamePhase={game.gamePhase}
        turnPhase={game.turnPhase}
        kaboCalledBy={game.kaboCalledBy}
        players={game.players}
      />

      {canDo(ACTION_TYPES.CALL_KABO) && (
        <div className="action-panel glass-dark">
          <button
            className="btn btn-kabo"
            onClick={() =>
              dispatch({ type: ACTION_TYPES.CALL_KABO, payload: {} })
            }
          >
            KABO!
          </button>
          <span className="action-hint">
            Call when you think you have the lowest hand
          </span>
        </div>
      )}

      {game.gamePhase === GAME_PHASES.SETUP &&
        game.peekPhasePlayer !== null && (
          <PeekPhaseUI
            currentPlayer={game.players[game.peekPhasePlayer]}
            peekedCardData={peekedCard}
            onPeek={handlePeek}
            onFinish={handleFinishPeek}
            onReset={handleResetPeek}
          />
        )}

      {game.powerMode && game.turnPhase === TURN_PHASES.POWER_UP && (
        <PowerUpUI
          powerMode={game.powerMode}
          powerState={game.powerState}
          currentPlayerName={currentPlayer?.name}
          onSkip={() =>
            dispatch({ type: ACTION_TYPES.SKIP_POWER, payload: {} })
          }
        />
      )}

      {game.stackPhaseActive && game.stackEligiblePlayers.length > 0 && (
        <StackPhaseUI
          stackRank={game.stackRank}
          stackEligiblePlayers={game.stackEligiblePlayers}
          players={game.players}
          onPass={(id) =>
            dispatch({
              type: ACTION_TYPES.STACK_PASS,
              payload: { playerId: id },
            })
          }
        />
      )}

      {game.gamePhase === GAME_PHASES.ENDED && endGameData && (
        <GameEndScreen
          scores={endGameData.scores}
          winners={endGameData.winners}
          kaboCalledBy={game.kaboCalledBy}
          players={game.players}
          onRestart={() => {
            setEndGameData(null);
            restartGame();
          }}
        />
      )}
    </div>
  );
}
