import { Board, Player, Position, PieceType } from './types';

export function initializeBoard(): Board {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));

  // Set up pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = { type: 'pawn', player: 'black' };
    board[6][i] = { type: 'pawn', player: 'white' };
  }

  // Set up other pieces
  const backRow: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  for (let i = 0; i < 8; i++) {
    board[0][i] = { type: backRow[i], player: 'black' };
    board[7][i] = { type: backRow[i], player: 'white' };
  }

  return board;
}

export function isValidMove(
    board: Board,
    from: Position,
    to: Position,
    currentPlayer: Player,
    roles: Record<PieceType, PieceType>,
    enPassantTarget: Position | null,
    castlingRights: { [key in Player]: { kingSide: boolean; queenSide: boolean } }
): boolean {
  const piece = board[from.row][from.col];
  if (!piece || piece.player !== currentPlayer) return false;

  const validMoves = getValidMoves(board, from, roles, enPassantTarget, castlingRights);
  const isValid = validMoves.some(move => move.row === to.row && move.col === to.col);

  if (isValid) {
    // Check if this move would leave the king in check
    const newBoard = makeMove(board, from, to, castlingRights).newBoard;
    return !isCheck(newBoard, currentPlayer, roles);
  }

  return false;
}

export function makeMove(
    board: Board,
    from: Position,
    to: Position,
    castlingRights: { [key in Player]: { kingSide: boolean; queenSide: boolean } }
): { newBoard: Board; enPassantTarget: Position | null; castlingRights: typeof castlingRights } {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[from.row][from.col];
  const targetPiece = newBoard[to.row][to.col];

  // Handle en passant capture
  if (piece?.type === 'pawn' && to.col !== from.col && !targetPiece) {
    newBoard[from.row][to.col] = null; // Remove the captured pawn
  }

  // Move the piece
  newBoard[to.row][to.col] = piece;
  newBoard[from.row][from.col] = null;

  // Handle pawn promotion
  if (piece?.type === 'pawn' && (to.row === 0 || to.row === 7)) {
    newBoard[to.row][to.col] = { type: getRandomPromotionPiece(), player: piece.player };
  }

  // Handle castling
  if (piece?.type === 'king' && Math.abs(to.col - from.col) === 2) {
    const rookFromCol = to.col > from.col ? 7 : 0;
    const rookToCol = to.col > from.col ? 5 : 3;
    newBoard[to.row][rookToCol] = newBoard[to.row][rookFromCol];
    newBoard[to.row][rookFromCol] = null;
  }

  // Update castling rights
  const newCastlingRights = { ...castlingRights };
  if (piece?.type === 'king') {
    newCastlingRights[piece.player].kingSide = false;
    newCastlingRights[piece.player].queenSide = false;
  } else if (piece?.type === 'rook') {
    if (from.col === 0) {
      newCastlingRights[piece.player].queenSide = false;
    } else if (from.col === 7) {
      newCastlingRights[piece.player].kingSide = false;
    }
  }

  // Update en passant target
  const newEnPassantTarget = piece?.type === 'pawn' && Math.abs(to.row - from.row) === 2
      ? { row: (from.row + to.row) / 2, col: from.col }
      : null;

  return { newBoard, enPassantTarget: newEnPassantTarget, castlingRights: newCastlingRights };
}

export function isCheck(board: Board, player: Player, roles: Record<PieceType, PieceType>): boolean {
  const kingPosition = findKing(board, player);
  if (!kingPosition) return false;

  const opponent = player === 'white' ? 'black' : 'white';
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.player === opponent) {
        const validMoves = getValidMoves(board, { row, col }, roles, null, { white: { kingSide: true, queenSide: true }, black: { kingSide: true, queenSide: true } }, false);
        if (validMoves.some(move => move.row === kingPosition.row && move.col === kingPosition.col)) {
          return true;
        }
      }
    }
  }
  return false;
}

export function isCheckmate(board: Board, player: Player, roles: Record<PieceType, PieceType>): boolean {
  if (!isCheck(board, player, roles)) return false;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.player === player) {
        const validMoves = getValidMoves(board, { row, col }, roles, null, { white: { kingSide: true, queenSide: true }, black: { kingSide: true, queenSide: true } });
        if (validMoves.length > 0) {
          return false;
        }
      }
    }
  }
  return true;
}

export function getValidMoves(
    board: Board,
    position: Position,
    roles: Record<PieceType, PieceType>,
    enPassantTarget: Position | null,
    castlingRights: { [key in Player]: { kingSide: boolean; queenSide: boolean } },
    checkForCheck: boolean = true
): Position[] {
  const piece = board[position.row][position.col];
  if (!piece) return [];

  const role = roles[piece.type];
  let moves: Position[] = [];

  switch (role) {
    case 'pawn':
      moves = getPawnMoves(board, position, piece.player, enPassantTarget);
      break;
    case 'rook':
      moves = getRookMoves(board, position, piece.player);
      break;
    case 'knight':
      moves = getKnightMoves(board, position, piece.player);
      break;
    case 'bishop':
      moves = getBishopMoves(board, position, piece.player);
      break;
    case 'queen':
      moves = getQueenMoves(board, position, piece.player);
      break;
    case 'king':
      moves = getKingMoves(board, position, piece.player, castlingRights);
      break;
  }

  if (checkForCheck) {
    // Filter out moves that would leave the king in check
    return moves.filter(move => {
      const newBoard = makeMove(board, position, move, castlingRights).newBoard;
      return !isCheck(newBoard, piece.player, roles);
    });
  }

  return moves;
}

function getPawnMoves(board: Board, position: Position, player: Player, enPassantTarget: Position | null): Position[] {
  const moves: Position[] = [];
  const direction = player === 'white' ? -1 : 1;
  const startRow = player === 'white' ? 6 : 1;

  // Move forward
  if (!board[position.row + direction][position.col]) {
    moves.push({ row: position.row + direction, col: position.col });
    if (position.row === startRow && !board[position.row + 2 * direction][position.col]) {
      moves.push({ row: position.row + 2 * direction, col: position.col });
    }
  }

  // Capture diagonally
  for (const colOffset of [-1, 1]) {
    const newRow = position.row + direction;
    const newCol = position.col + colOffset;
    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const targetPiece = board[newRow][newCol];
      if (targetPiece && targetPiece.player !== player) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  }

  // En passant
  if (enPassantTarget && enPassantTarget.row === position.row + direction && Math.abs(enPassantTarget.col - position.col) === 1) {
    moves.push(enPassantTarget);
  }

  return moves;
}

function getRookMoves(board: Board, position: Position, player: Player): Position[] {
  const moves: Position[] = [];
  const directions = [
    { rowOffset: -1, colOffset: 0 },
    { rowOffset: 1, colOffset: 0 },
    { rowOffset: 0, colOffset: -1 },
    { rowOffset: 0, colOffset: 1 },
  ];

  for (const { rowOffset, colOffset } of directions) {
    let newRow = position.row + rowOffset;
    let newCol = position.col + colOffset;

    while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const targetPiece = board[newRow][newCol];
      if (targetPiece) {
        if (targetPiece.player !== player) {
          moves.push({ row: newRow, col: newCol });
        }
        break;
      }
      moves.push({ row: newRow, col: newCol });
      newRow += rowOffset;
      newCol += colOffset;
    }
  }

  return moves;
}

function getKnightMoves(board: Board, position: Position, player: Player): Position[] {
  const moves: Position[] = [];
  const offsets = [
    { rowOffset: -2, colOffset: -1 },
    { rowOffset: -2, colOffset: 1 },
    { rowOffset: -1, colOffset: -2 },
    { rowOffset: -1, colOffset: 2 },
    { rowOffset: 1, colOffset: -2 },
    { rowOffset: 1, colOffset: 2 },
    { rowOffset: 2, colOffset: -1 },
    { rowOffset: 2, colOffset: 1 },
  ];

  for (const { rowOffset, colOffset } of offsets) {
    const newRow = position.row + rowOffset;
    const newCol = position.col + colOffset;

    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const targetPiece = board[newRow][newCol];
      if (!targetPiece || targetPiece.player !== player) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  }

  return moves;
}

function getBishopMoves(board: Board, position: Position, player: Player): Position[] {
  const moves: Position[] = [];
  const directions = [
    { rowOffset: -1, colOffset: -1 },
    { rowOffset: -1, colOffset: 1 },
    { rowOffset: 1, colOffset: -1 },
    { rowOffset: 1, colOffset: 1 },
  ];

  for (const { rowOffset, colOffset } of directions) {
    let newRow = position.row + rowOffset;
    let newCol = position.col + colOffset;

    while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const targetPiece = board[newRow][newCol];
      if (targetPiece) {
        if (targetPiece.player !== player) {
          moves.push({ row: newRow, col: newCol });
        }
        break;
      }
      moves.push({ row: newRow, col: newCol });
      newRow += rowOffset;
      newCol += colOffset;
    }
  }

  return moves;
}

function getQueenMoves(board: Board, position: Position, player: Player): Position[] {
  return [
    ...getRookMoves(board, position, player),
    ...getBishopMoves(board, position, player)
  ];
}

function getKingMoves(
    board: Board,
    position: Position,
    player: Player,
    castlingRights: { [key in Player]: { kingSide: boolean; queenSide: boolean } }
): Position[] {
  const moves: Position[] = [];
  const offsets = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ];

  for (const [rowOffset, colOffset] of offsets) {
    const newRow = position.row + rowOffset;
    const newCol = position.col + colOffset;

    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const targetPiece = board[newRow][newCol];
      if (!targetPiece || targetPiece.player !== player) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  }

  // Castling
  if (castlingRights[player].kingSide &&
      !board[position.row][position.col + 1] &&
      !board[position.row][position.col + 2]) {
    moves.push({ row: position.row, col: position.col + 2 });
  }
  if (castlingRights[player].queenSide &&
      !board[position.row][position.col - 1] &&
      !board[position.row][position.col - 2] &&
      !board[position.row][position.col - 3]) {
    moves.push({ row: position.row, col: position.col - 2 });
  }

  return moves;
}

function findKing(board: Board, player: Player): Position | null {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.player === player) {
        return { row, col };
      }
    }
  }
  return null;
}

export function randomizeRoles(): Record<PieceType, PieceType> {
  const pieces: PieceType[] = ['pawn', 'rook', 'knight', 'bishop', 'queen'];
  const shuffled = [...pieces].sort(() => Math.random() - 0.5);

  const roles: Record<PieceType, PieceType> = {
    pawn: 'pawn',
    rook: 'rook',
    knight: 'knight',
    bishop: 'bishop',
    queen: 'queen',
    king: 'king', // King always keeps its role
  };

  pieces.forEach((piece, index) => {
    roles[piece] = shuffled[index];
  });

  return roles;
}

export function getRandomPromotionPiece(): PieceType {
  const pieces: PieceType[] = ['rook', 'knight', 'bishop', 'queen'];
  return pieces[Math.floor(Math.random() * pieces.length)];
}