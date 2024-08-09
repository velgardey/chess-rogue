import React, { createContext, useContext, useState, useEffect } from 'react';
import { GameState, Player, Position, PieceType } from '../utils/types';
import { initializeBoard, isValidMove, makeMove, isCheck, isCheckmate, getValidMoves, randomizeRoles, getRandomPromotionPiece } from '../utils/chessLogic';

interface ChessContextType extends GameState {
  movePiece: (from: Position, to: Position) => void;
  offerDraw: () => void;
  acceptDraw: () => void;
  declineDraw: () => void;
  resign: () => void;
  restartGame: () => void;
  getValidMovesForPiece: (position: Position) => Position[];
  isInCheck: boolean;
  hideRolePopup: () => void;
}

const ChessContext = createContext<ChessContextType | undefined>(undefined);

export const useChess = () => {
  const context = useContext(ChessContext);
  if (!context) {
    throw new Error('useChess must be used within a ChessProvider');
  }
  return context;
};

const INITIAL_TIME = 600; // 10 minutes in seconds

const ChessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: initializeBoard(),
    currentPlayer: 'white',
    isGameOver: false,
    winner: null,
    whiteTime: INITIAL_TIME,
    blackTime: INITIAL_TIME,
    drawOffered: false,
    roles: randomizeRoles(),
    showRolePopup: true,
    enPassantTarget: null,
    castlingRights: { white: { kingSide: true, queenSide: true }, black: { kingSide: true, queenSide: true } },
  }));

  const [isInCheck, setIsInCheck] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!gameState.isGameOver) {
        setGameState((prevState) => ({
          ...prevState,
          [prevState.currentPlayer === 'white' ? 'whiteTime' : 'blackTime']:
              Math.max(0, prevState[prevState.currentPlayer === 'white' ? 'whiteTime' : 'blackTime'] - 1),
        }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.isGameOver, gameState.currentPlayer]);

  useEffect(() => {
    if (gameState.whiteTime === 0 || gameState.blackTime === 0) {
      setGameState((prevState) => ({
        ...prevState,
        isGameOver: true,
        winner: gameState.whiteTime === 0 ? 'black' : 'white',
      }));
    }
  }, [gameState.whiteTime, gameState.blackTime]);

  const movePiece = (from: Position, to: Position) => {
    if (gameState.isGameOver) return;

    try {
      console.log('Moving piece from', from, 'to', to);
      console.log('Current game state:', gameState);

      setGameState((prevState) => {
        if (isValidMove(prevState.board, from, to, prevState.currentPlayer, prevState.roles, prevState.enPassantTarget, prevState.castlingRights)) {
          const { newBoard, enPassantTarget, castlingRights } = makeMove(prevState.board, from, to, prevState.enPassantTarget, prevState.castlingRights);
          const nextPlayer = prevState.currentPlayer === 'white' ? 'black' : 'white';

          const newState = {
            ...prevState,
            board: newBoard,
            currentPlayer: nextPlayer,
            enPassantTarget,
            castlingRights,
          };

          if (isCheckmate(newState.board, nextPlayer, newState.roles)) {
            newState.isGameOver = true;
            newState.winner = prevState.currentPlayer;
          }

          const checkStatus = isCheck(newState.board, nextPlayer, newState.roles);
          setIsInCheck(checkStatus);

          console.log('New game state:', newState);
          return newState;
        }
        console.log('Invalid move');
        return prevState;
      });
    } catch (error) {
      console.error('Error in movePiece:', error);
    }
  };

  const offerDraw = () => {
    setGameState((prevState) => ({ ...prevState, drawOffered: true }));
  };

  const acceptDraw = () => {
    setGameState((prevState) => ({
      ...prevState,
      isGameOver: true,
      winner: null,
      drawOffered: false,
    }));
  };

  const declineDraw = () => {
    setGameState((prevState) => ({ ...prevState, drawOffered: false }));
  };

  const resign = () => {
    setGameState((prevState) => ({
      ...prevState,
      isGameOver: true,
      winner: prevState.currentPlayer === 'white' ? 'black' : 'white',
    }));
  };

  const restartGame = () => {
    setGameState({
      board: initializeBoard(),
      currentPlayer: 'white',
      isGameOver: false,
      winner: null,
      whiteTime: INITIAL_TIME,
      blackTime: INITIAL_TIME,
      drawOffered: false,
      roles: randomizeRoles(),
      showRolePopup: true,
      enPassantTarget: null,
      castlingRights: { white: { kingSide: true, queenSide: true }, black: { kingSide: true, queenSide: true } },
    });
    setIsInCheck(false);
  };

  const getValidMovesForPiece = (position: Position): Position[] => {
    try {
      const moves = getValidMoves(gameState.board, position, gameState.roles, gameState.enPassantTarget, gameState.castlingRights);
      console.log('Valid moves for piece at', position, ':', moves);
      return moves;
    } catch (error) {
      console.error('Error in getValidMovesForPiece:', error);
      return [];
    }
  };

  const hideRolePopup = () => {
    setGameState((prevState) => ({ ...prevState, showRolePopup: false }));
  };

  return (
      <ChessContext.Provider
          value={{
            ...gameState,
            movePiece,
            offerDraw,
            acceptDraw,
            declineDraw,
            resign,
            restartGame,
            getValidMovesForPiece,
            isInCheck,
            hideRolePopup,
          }}
      >
        {children}
      </ChessContext.Provider>
  );
};

export { ChessProvider };