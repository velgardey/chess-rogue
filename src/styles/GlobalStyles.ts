import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {    
      font-family: 'Roboto', sans-serif;
      background-color: #1a1a1a;
      color: #ffffff;
      user-select: none;
  }

  @keyframes glow {
    0% {
      box-shadow: 0 0 5px #4a90e2;
    }
    50% {
      box-shadow: 0 0 20px #4a90e2;
    }
    100% {
      box-shadow: 0 0 5px #4a90e2;
    }
  }
`;