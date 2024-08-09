import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useChess } from '../context/ChessContext';
import { Position } from '../utils/types';

const breatheAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const BoardContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  width: 80vmin;
  height: 80vmin;
  max-width: 600px;
  max-height: 600px;
  border: 4px solid #61dafb;
  box-shadow: 0 0 20px rgba(97, 218, 251, 0.3);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 0 30px rgba(97, 218, 251, 0.5);
  }

  @media (max-width: 768px) {
    width: 90vmin;
    height: 90vmin;
  }

  @media (max-width: 480px) {
    width: 95vmin;
    height: 95vmin;
  }
`;

interface SquareProps {
  isLight: boolean;
  isSelected: boolean;
  isValidMove: boolean;
  isCheck: boolean;
}

const Square = styled.div<SquareProps>`
  aspect-ratio: 1;
  background-color: ${(props) =>
    props.isSelected ? '#4a90e2' :
    props.isValidMove ? '#45a049' :
    props.isLight ? '#f0d9b5' : '#b58863'};
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  outline: none;
  user-select: none;

  &:hover {
    transform: scale(1.05);
    z-index: 10;
    box-shadow: 0 0 15px rgba(97, 218, 251, 0.5);
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }

  ${(props) => props.isValidMove && css`
    &::before {
      content: '';
      display: block;
      width: 25%;
      height: 25%;
      border-radius: 50%;
      background-color: rgba(97, 218, 251, 0.5);
      position: absolute;
    }
  `}

  ${(props) => props.isCheck && css`
    animation: ${breatheAnimation} 1s infinite ease-in-out;
  `}
`;

const Piece = styled.div<{ player: string }>`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
  color: ${({ player }) => (player === 'white' ? '#ffffff' : '#000000')};
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const ChessBoard: React.FC = () => {
  const { board, currentPlayer, movePiece, getValidMovesForPiece, isInCheck } = useChess();
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);

  useEffect(() => {
    if (selectedPiece) {
      setValidMoves(getValidMovesForPiece(selectedPiece));
    } else {
      setValidMoves([]);
    }
  }, [selectedPiece, getValidMovesForPiece]);

  const handleSquareClick = (row: number, col: number) => {
    if (selectedPiece) {
      movePiece(selectedPiece, { row, col });
      setSelectedPiece(null);
    } else {
      setSelectedPiece({ row, col });
    }
  };

  const isValidMove = (row: number, col: number) => {
    return validMoves.some(move => move.row === row && move.col === col);
  };

  const isKingInCheck = (row: number, col: number): boolean => {
    const piece = board[row][col];
    return !!(piece && piece.type === 'king' && piece.player === currentPlayer && isInCheck);
  };

  return (
    <BoardContainer>
      <Board>
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => (
            <Square
              key={`${rowIndex}-${colIndex}`}
              isLight={(rowIndex + colIndex) % 2 === 0}
              isSelected={selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex}
              isValidMove={isValidMove(rowIndex, colIndex)}
              isCheck={isKingInCheck(rowIndex, colIndex)}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
            >
              {piece && <Piece player={piece.player}>{getPieceSymbol(piece.type, piece.player)}</Piece>}
            </Square>
          ))
        )}
      </Board>
    </BoardContainer>
  );
};

const getPieceSymbol = (type: string, player: 'white' | 'black') => {
  const symbols: { [key: string]: { white: string; black: string } } = {
    pawn: { white: '♙', black: '♟︎' },
    rook: { white: '♖', black: '♜' },
    knight: { white: '♘', black: '♞' },
    bishop: { white: '♗', black: '♝' },
    queen: { white: '♕', black: '♛' },
    king: { white: '♔', black: '♚' },
  };
  return symbols[type as keyof typeof symbols][player];
};

export default ChessBoard;