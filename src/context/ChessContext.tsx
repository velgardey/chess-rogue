import React, { createContext, useContext, useState, useEffect } from 'react';
import { GameState, Position } from '../utils/types';
import { initializeBoard, isValidMove, makeMove, isCheck, isCheckmate, isStalemate, getValidMoves, randomizeRoles } from '../utils/chessLogic';

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
      setGameState((prevState) => {
        if (isValidMove(prevState.board, from, to, prevState.currentPlayer, prevState.roles, prevState.enPassantTarget, prevState.castlingRights)) {
          const { newBoard, enPassantTarget, castlingRights } = makeMove(prevState.board, from, to, prevState.castlingRights);

          const newCurrentPlayer = prevState.currentPlayer === 'white' ? 'black' : 'white';
          const isCheckmateNow = isCheckmate(newBoard, newCurrentPlayer, prevState.roles, enPassantTarget, castlingRights);
          const isStalemateNow = isStalemate(newBoard, newCurrentPlayer, prevState.roles, enPassantTarget, castlingRights);
          const isCheckNow = isCheck(newBoard, newCurrentPlayer, prevState.roles);

          return {
            ...prevState,
            board: newBoard,
            currentPlayer: newCurrentPlayer,
            enPassantTarget,
            castlingRights,
            isGameOver: isCheckmateNow || isStalemateNow,
            winner: isCheckmateNow ? prevState.currentPlayer : null,
            showRolePopup: false,
            isInCheck: isCheckNow,
          };
        }
        return prevState;
      });
    } catch (error) {
      console.error('Error moving piece:', error);
    }
  };

  const offerDraw = () => {
    setGameState((prevState) => ({
      ...prevState,
      drawOffered: true,
    }));
  };

  const acceptDraw = () => {
    setGameState((prevState) => ({
      ...prevState,
      isGameOver: true,
      winner: null,
    }));
  };

  const declineDraw = () => {
    setGameState((prevState) => ({
      ...prevState,
      drawOffered: false,
    }));
  };

  const resign = () => {
    setGameState((prevState) => ({
      ...prevState,
      isGameOver: true,
      winner: prevState.currentPlayer === 'white' ? 'black' : 'white',
      showRolePopup: false,
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
  };

  const getValidMovesForPiece = (position: Position) => {
    return getValidMoves(gameState.board, position, gameState.roles, gameState.enPassantTarget, gameState.castlingRights);
  };

  const hideRolePopup = () => {
    setGameState((prevState) => ({
      ...prevState,
      showRolePopup: false,
    }));
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
            isInCheck: isCheck(gameState.board, gameState.currentPlayer, gameState.roles),
            hideRolePopup,
          }}
      >
        {children}
      </ChessContext.Provider>
  );
};

export { ChessProvider };