import React from 'react';
import styled from 'styled-components';
import { useChess } from '../context/ChessContext';

const InfoContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 80vmin;
  max-width: 600px;
  margin-bottom: 0.75rem;
  user-select: none;

  @media (max-width: 768px) {
    width: 90vmin;
    flex-direction: row;
    align-items: center;
    margin-bottom: 0.25rem;
  }

  @media (max-width: 480px) {
    width: 95vmin;
  }
`;

const PlayerInfo = styled.div<{ isCurrentPlayer: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0.25rem 0.5rem;
  background-color: ${props => props.isCurrentPlayer ? '#3a3a3a' : '#2a2a2a'};
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: ${props => props.isCurrentPlayer ? '0 0 15px rgba(97, 218, 251, 0.5)' : 'none'};

  @media (max-width: 768px) {
    padding: 0.15rem 0.3rem;
  }
`;

const PlayerName = styled.h3`
  margin: 0 0.5rem 0 0;
  font-family: 'Orbitron', sans-serif;
  color: #61dafb;
  font-size: 1rem;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const Timer = styled.div`
  font-size: 1rem;
  font-weight: bold;
  font-family: 'Orbitron', sans-serif;
  color: #ffffff;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const GameStatus = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  padding: 1rem;
  border-radius: 8px;
  font-size: 1.5rem;
  font-family: 'Orbitron', sans-serif;
  color: #61dafb;
  text-align: center;
  z-index: 1000;

  @media (max-width: 768px) {
    font-size: 1.2rem;
    padding: 0.75rem;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
    padding: 0.5rem;
  }
`;

const GameInfo: React.FC = () => {
  const { whiteTime, blackTime, currentPlayer, isGameOver, winner } = useChess();

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
      <>
        <InfoContainer>
          <PlayerInfo isCurrentPlayer={currentPlayer === 'white'}>
            <PlayerName>White</PlayerName>
            <Timer>{formatTime(whiteTime)}</Timer>
          </PlayerInfo>
          <PlayerInfo isCurrentPlayer={currentPlayer === 'black'}>
            <PlayerName>Black</PlayerName>
            <Timer>{formatTime(blackTime)}</Timer>
          </PlayerInfo>
        </InfoContainer>
        {isGameOver && (
            <GameStatus>
              Game Over! {winner ? `${winner.charAt(0).toUpperCase() + winner.slice(1)} wins!` : 'It\'s a draw!'}
            </GameStatus>
        )}
      </>
  );
};

export default GameInfo;