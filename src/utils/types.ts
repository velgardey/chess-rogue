export type Player = 'white' | 'black';

export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';

export interface Piece {
  type: PieceType;
  player: Player;
}

export type Board = (Piece | null)[][];

export interface Position {
  row: number;
  col: number;
}

export interface GameState {
  board: Board;
  currentPlayer: Player;
  isGameOver: boolean;
  winner: Player | null;
  whiteTime: number;
  blackTime: number;
  drawOffered: boolean;
  roles: Record<PieceType, PieceType>;
  showRolePopup: boolean;
  enPassantTarget: Position | null;
  castlingRights: { [key in Player]: { kingSide: boolean; queenSide: boolean } };
}