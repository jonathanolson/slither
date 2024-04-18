export type TSerializedBoard = {
  type: 'BaseBoard';
  vertices: {
    x: number;
    y: number;
    vx: number;
    vy: number;
  }[];

  faces: {
    x: number;
    y: number;
    vertices: number[];
  }[];
} | {
  type: 'SquareBoard';
  width: number;
  height: number;
} | {
  type: 'HexagonalBoard';
  radius: number;
  scale: number;
  isPointyTop: boolean;
  holeRadius: number;
};