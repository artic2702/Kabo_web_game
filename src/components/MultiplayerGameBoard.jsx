/**
 * MultiplayerGameBoard.jsx — ONLINE play game board
 * Uses multiplayer state hook (socket-based) for server-authoritative gameplay.
 * Player only sees their own perspective — server filters hidden cards.
 */

import { useState, useRef, useEffect } from 'react';
import {
  ACTION_TYPES,
  GAME_PHASES,
  TURN_PHASES,
} from '../game/index.js';
import { calculateScores, applyKaboScoring, determineWinners } from '../game/scoring.js';

import PlayerPosition from './PlayerPosition';
import TableCenter from './TableCenter';
import PeekPhaseUI from './PeekPhaseUI';
import PowerUpUI from './PowerUpUI';
import StackPhaseUI from './StackPhaseUI';
import GameEndScreen from './GameEndScreen';
import GameStatus from './GameStatus';

import '../styles/variables.css';
import '../styles/gameboard.css';
import '../styles/cards.css';
import '../styles/overlays.css';

export default function MultiplayerGameBoard({ mp, onBack }) {
  const {
    gameState,
    dispatch,
    validActions,
    connectionStatus,
    roomCode,
    playerId: myPlayerId,
    restartGame,
  } = mp;

  const [peekedCard, setPeekedCard] = useState(null);
  const [endGameData, setEndGameData] = useState(null);

  // Track game end
  const prevPhaseRef = useRef(null);
  useEffect(() => {
    if (!gameState) return;
    if (prevPhaseRef.current !== GAME_PHASES.ENDED && gameState.gamePhase === GAME_PHASES.ENDED) {
      const rawScores = calculateScores(gameState.players);
      const finalScores = applyKaboScoring(rawScores, gameState.kaboCalledBy, 10);
      const winners = determineWinners(finalScores);
      setEndGameData({ scores: finalScores, winners });
    }
    prevPhaseRef.current = gameState?.gamePhase;
  }, [gameState?.gamePhase]);

  // Auto-end turn (only if it's MY turn)
  useEffect(() => {
    if (!gameState) return;
    if (gameState.turnPhase === TURN_PHASES.TURN_END && gameState.currentTurn === myPlayerId) {
      const timer = setTimeout(() => {
        dispatch({ type: ACTION_TYPES.END_TURN, payload: {} });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [gameState?.turnPhase, gameState?.currentTurn, myPlayerId, dispatch]);

  // Auto-end empty stack phase (server handles this, but client can request too)
  useEffect(() => {
    if (!gameState) return;
    if (gameState.stackPhaseActive && gameState.stackEligiblePlayers.length === 0) {
      const timer = setTimeout(() => {
        dispatch({ type: ACTION_TYPES.STACK_END, payload: {} });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [gameState?.stackPhaseActive, gameState?.stackEligiblePlayers?.length, dispatch]);

  if (!gameState) return null;

  const game = gameState;
  const currentPlayer = game.players[game.currentTurn];
  const myPlayer = game.players[myPlayerId];
  const isMyTurn = game.currentTurn === myPlayerId;
  const canDo = (type) => validActions.includes(type);
  const deckCount = typeof game.deck === 'number' ? game.deck : (game.deck?.length ?? 0);

  // Handlers
  const handlePeek = (cardIndex) => {
    dispatch({ type: ACTION_TYPES.PEEK_CARD, payload: { cardIndex } });
    const player = game.players[game.peekPhasePlayer];
    if (player?.hand[cardIndex] && !player.hand[cardIndex].hidden) {
      setPeekedCard(player.hand[cardIndex]);
    }
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
    // Exchange during deciding (own cards only, own turn only)
    if (
      isMyTurn && playerIndex === game.currentTurn && game.drawnCard &&
      (game.turnPhase === TURN_PHASES.DECIDING || game.turnPhase === TURN_PHASES.DECIDING_DISCARD)
    ) {
      dispatch({ type: ACTION_TYPES.EXCHANGE_WITH_HAND, payload: { handIndex: cardIndex } });
      return;
    }
    // Queen power — only the current turn player can select
    if (isMyTurn && game.powerMode === 'queen' && game.turnPhase === TURN_PHASES.POWER_UP) {
      dispatch({ type: ACTION_TYPES.QUEEN_SELECT_CARD, payload: { playerId: playerIndex, cardIndex } });
      return;
    }
    // Nine power — only current turn player, own cards
    if (isMyTurn && game.powerMode === 'nine' && game.turnPhase === TURN_PHASES.POWER_UP && playerIndex === game.currentTurn) {
      dispatch({ type: ACTION_TYPES.NINE_PEEK, payload: { cardIndex } });
      return;
    }
    // Stack — only if I'm eligible
    if (game.stackPhaseActive && game.stackEligiblePlayers.includes(myPlayerId) && playerIndex === myPlayerId) {
      dispatch({ type: ACTION_TYPES.STACK_DROP, payload: { playerId: myPlayerId, handIndex: cardIndex } });
      return;
    }
  };

  const getCanSelectCards = (playerIndex) => {
    if (isMyTurn && playerIndex === game.currentTurn && game.drawnCard &&
        (game.turnPhase === TURN_PHASES.DECIDING || game.turnPhase === TURN_PHASES.DECIDING_DISCARD)) return true;
    if (isMyTurn && game.powerMode === 'queen' && game.turnPhase === TURN_PHASES.POWER_UP) return true;
    if (isMyTurn && game.powerMode === 'nine' && game.turnPhase === TURN_PHASES.POWER_UP && playerIndex === game.currentTurn) return true;
    if (game.stackPhaseActive && game.stackEligiblePlayers.includes(myPlayerId) && playerIndex === myPlayerId) return true;
    return false;
  };

  const topDiscard = game.discard?.length > 0 ? game.discard[game.discard.length - 1] : null;

  // Reorder players so "me" is always at the bottom
  const reorderedPlayers = [];
  const playerCount = game.players.length;
  for (let i = 0; i < playerCount; i++) {
    reorderedPlayers.push(game.players[(myPlayerId + i) % playerCount]);
  }

  return (
    <div className="game-board">
      {/* Back button */}
      <button className="btn btn-ghost" onClick={onBack} style={{
        position: 'fixed', top: '16px', left: '16px', zIndex: 50, fontSize: '13px',
      }}>← Leave</button>

      <div className="table-container">
        <div className="players-circle">
          {reorderedPlayers.map((player, visualIndex) => {
            const realIndex = player.id;
            return (
              <PlayerPosition
                key={player.id}
                player={player}
                index={visualIndex}
                totalPlayers={playerCount}
                isCurrentTurn={game.currentTurn === realIndex && (game.gamePhase === GAME_PHASES.PLAYING || game.gamePhase === GAME_PHASES.FINAL_ROUND)}
                canSelectCards={getCanSelectCards(realIndex)}
                onCardClick={handleCardClick(realIndex)}
                highlightedCards={[]}
                scores={endGameData?.scores}
                winners={endGameData?.winners}
                isMe={realIndex === myPlayerId}
              />
            );
          })}
        </div>
        <TableCenter
          deckCount={deckCount}
          topDiscard={topDiscard}
          drawnCard={isMyTurn ? game.drawnCard : null}
          onDrawDeck={() => dispatch({ type: ACTION_TYPES.DRAW_FROM_DECK, payload: {} })}
          onDrawDiscard={() => dispatch({ type: ACTION_TYPES.DRAW_FROM_DISCARD, payload: {} })}
          onThrowCard={() => dispatch({ type: ACTION_TYPES.THROW_DRAWN_CARD, payload: {} })}
          canDraw={isMyTurn && (canDo(ACTION_TYPES.DRAW_FROM_DECK) || canDo(ACTION_TYPES.DRAW_FROM_DISCARD))}
          canThrow={isMyTurn && canDo(ACTION_TYPES.THROW_DRAWN_CARD)}
          canExchange={isMyTurn && canDo(ACTION_TYPES.EXCHANGE_WITH_HAND)}
        />
      </div>

      <GameStatus
        currentPlayerName={currentPlayer?.name}
        gamePhase={game.gamePhase}
        turnPhase={game.turnPhase}
        kaboCalledBy={game.kaboCalledBy}
        players={game.players}
        connectionStatus={connectionStatus}
        roomCode={roomCode}
        myPlayerId={myPlayerId}
        currentTurn={game.currentTurn}
      />

      {isMyTurn && canDo(ACTION_TYPES.CALL_KABO) && (
        <div className="action-panel glass-dark">
          <button className="btn btn-kabo" onClick={() => dispatch({ type: ACTION_TYPES.CALL_KABO, payload: {} })}>
            KABO!
          </button>
          <span className="action-hint">Call when you think you have the lowest hand</span>
        </div>
      )}

      {game.gamePhase === GAME_PHASES.SETUP && game.peekPhasePlayer === myPlayerId && (
        <PeekPhaseUI currentPlayer={myPlayer} peekedCardData={peekedCard}
          onPeek={handlePeek} onFinish={handleFinishPeek} onReset={handleResetPeek} />
      )}

      {isMyTurn && game.powerMode && game.turnPhase === TURN_PHASES.POWER_UP && (
        <PowerUpUI powerMode={game.powerMode} powerState={game.powerState}
          currentPlayerName={currentPlayer?.name}
          onSkip={() => dispatch({ type: ACTION_TYPES.SKIP_POWER, payload: {} })} />
      )}

      {game.stackPhaseActive && game.stackEligiblePlayers.includes(myPlayerId) && (
        <StackPhaseUI stackRank={game.stackRank}
          stackEligiblePlayers={[myPlayerId]}
          players={game.players}
          onPass={(id) => dispatch({ type: ACTION_TYPES.STACK_PASS, payload: { playerId: id } })} />
      )}

      {game.gamePhase === GAME_PHASES.ENDED && endGameData && (
        <GameEndScreen scores={endGameData.scores} winners={endGameData.winners}
          kaboCalledBy={game.kaboCalledBy} players={game.players}
          onRestart={onBack} />
      )}
    </div>
  );
}
