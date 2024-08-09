import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useChess } from '../context/ChessContext';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateY(-50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${fadeIn} 0.5s ease-out;
`;

const PopupContent = styled.div`
  background-color: #2a2a2a;
  padding: 2rem;
  border-radius: 15px;
  max-width: 80%;
  max-height: 80%;
  overflow-y: auto;
  box-shadow: 0 0 20px rgba(97, 218, 251, 0.5);
  animation: ${slideIn} 0.5s ease-out;
`;

const Title = styled.h2`
  font-family: 'Orbitron', sans-serif;
  color: #61dafb;
  text-align: center;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const RoleList = styled.ul`
  list-style-type: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const RoleItem = styled.li`
  background-color: #3a3a3a;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(97, 218, 251, 0.3);
  }
`;

const PieceName = styled.span`
  font-family: 'Orbitron', sans-serif;
  font-weight: bold;
  color: #ffffff;
  display: block;
  margin-bottom: 0.5rem;
`;

const RoleDescription = styled.span`
  font-family: 'Roboto', sans-serif;
  color: #61dafb;
`;

const CloseButton = styled.button`
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #61dafb;
  color: #1a1a1a;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Orbitron', sans-serif;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.1em;

  &:hover {
    background-color: #4fa8d5;
    transform: translateY(-2px);
    box-shadow: 0 0 15px rgba(97, 218, 251, 0.5);
  }

  &:active {
    transform: translateY(1px);
  }
`;

const RolePopup: React.FC = () => {
  const { roles, showRolePopup, hideRolePopup } = useChess();

  useEffect(() => {
    if (showRolePopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showRolePopup]);

  if (!showRolePopup) {
    return null;
  }

  return (
    <PopupOverlay>
      <PopupContent>
        <Title>Piece Roles for This Round</Title>
        <RoleList>
          {Object.entries(roles).map(([piece, role]) => (
            <RoleItem key={piece}>
              <PieceName>{piece.charAt(0).toUpperCase() + piece.slice(1)}</PieceName>
              <RoleDescription>moves like a {role}</RoleDescription>
            </RoleItem>
          ))}
        </RoleList>
        <CloseButton onClick={hideRolePopup}>Start Game</CloseButton>
      </PopupContent>
    </PopupOverlay>
  );
};

export default RolePopup;