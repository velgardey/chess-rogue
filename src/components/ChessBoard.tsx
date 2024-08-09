import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useChess } from '../context/ChessContext';
import { Position } from '../utils/types';

const BoardContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1rem 0;
`;

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  gap: 0;
  max-width: 80vmin;
  max-height: 80vmin;
`;

const Square = styled.div<{ isLight: boolean; isSelected: boolean; isValidMove: boolean; isCheck: boolean }>`
  width: 100%;
  padding-top: 100%; /* This makes the square a perfect square */
  position: relative;
  background-color: ${({ isLight }) => (isLight ? '#f0d9b5' : '#b58863')};
  border: ${({ isSelected }) => (isSelected ? '3px solid #ffeb3b' : 'none')};
  box-shadow: ${({ isValidMove }) => (isValidMove ? 'inset 0 0 10px var(--primary-color)' : 'none')};
  box-shadow: ${({ isCheck }) => (isCheck ? '0 0 15px var(--secondary-color)' : 'none')};
`;

const Piece = styled.div<{ player: string }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  color: ${({ player }) => (player === 'white' ? '#ffffff' : '#000000')};
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

  const isKingInCheck = (row: number, col: number) => {
    const piece = board[row][col];
    return piece && piece.type === 'king' && piece.player === currentPlayer && isInCheck;
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
                      isCheck={!!isKingInCheck(rowIndex, colIndex)} // Ensure boolean type
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
  return symbols[type][player];
};

export default ChessBoard;