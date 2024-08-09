import React from 'react';
import styled from 'styled-components';
import { useChess } from '../context/ChessContext';

const ControlsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #3a3a3a;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Orbitron', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  box-shadow: 0 0 10px rgba(97, 218, 251, 0.3);

  &:hover {
    background-color: #4a4a4a;
    transform: translateY(-2px);
    box-shadow: 0 0 15px rgba(97, 218, 251, 0.5);
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    background-color: #2a2a2a;
    cursor: not-allowed;
    box-shadow: none;
  }

  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 0.5rem;
  }
`;

const GameControls: React.FC = () => {
  const { offerDraw, acceptDraw, declineDraw, resign, restartGame, drawOffered, isGameOver } = useChess();

  return (
      <ControlsContainer>
        {!isGameOver ? (
            <>
              <Button onClick={offerDraw} disabled={drawOffered}>
                {drawOffered ? 'Draw Offered' : 'Offer Draw'}
              </Button>
              {drawOffered && (
                  <>
                    <Button onClick={acceptDraw}>Accept Draw</Button>
                    <Button onClick={declineDraw}>Decline Draw</Button>
                  </>
              )}
              <Button onClick={resign}>Resign</Button>
            </>
        ) : (
            <Button onClick={restartGame}>New Game</Button>
        )}
      </ControlsContainer>
  );
};

export default GameControls;