import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { ChessProvider } from './context/ChessContext';
import ChessBoard from './components/ChessBoard';
import GameInfo from './components/GameInfo';
import GameControls from './components/GameControls';
import RolePopup from './components/RolePopup';

const GlobalStyle = createGlobalStyle`
    * {
        user-select: none;
        box-sizing: border-box;
    }

    body {
        overflow-x: hidden;
        margin: 0;
        padding: 0;
        height: 100vh;
        width: 100vw;
    }

    #root {
        height: 100%;
        width: 100%;
    }
`;

const AppContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    min-height: 100vh;
    width: 100%;
    padding: 0.5rem;
    background-color: #1a1a1a;
    color: #ffffff;
    font-family: 'Roboto', sans-serif;

    @media (max-width: 768px) {
        padding: 0.75rem;
    }
`;

const Title = styled.h1`
    font-size: 2.5rem;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: #61dafb;
    font-family: 'Orbitron', sans-serif;
    text-shadow: 0 0 10px rgba(97, 218, 251, 0.5);
    animation: glow 2s ease-in-out infinite alternate;

    @keyframes glow {
        from {
            text-shadow: 0 0 5px rgba(97, 218, 251, 0.5);
        }
        to {
            text-shadow: 0 0 20px rgba(97, 218, 251, 0.8);
        }
    }

    @media (max-width: 768px) {
        font-size: 1.8rem;
        margin-bottom: 0.5rem;
    }

    @media (max-width: 480px) {
        font-size: 1.5rem;
    }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 600px;
`;

const App: React.FC = () => {
    return (
        <ChessProvider>
            <GlobalStyle />
            <AppContainer>
                <ContentWrapper>
                    <Title>CHESS ROGUE</Title>
                    <GameInfo />
                    <ChessBoard />
                    <GameControls />
                    <RolePopup />
                </ContentWrapper>
            </AppContainer>
        </ChessProvider>
    );
};

export default App;