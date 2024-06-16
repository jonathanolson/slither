import { HexagonalBoard } from '../hex/HexagonalBoard.ts';
import { SquareBoard } from '../square/SquareBoard.ts';
import { TBoard } from './TBoard.ts';
import { TSerializedBoard } from './TSerializedBoard.ts';


// TODO: how better to encode better board serializations for hex/square?
export const serializeBoard = (board: TBoard): TSerializedBoard => {
  if (board instanceof SquareBoard) {
    return {
      type: 'SquareBoard',
      width: board.width,
      height: board.height,
    };
  } else if (board instanceof HexagonalBoard) {
    return {
      type: 'HexagonalBoard',
      radius: board.radius,
      scale: board.scale,
      isPointyTop: board.isPointyTop,
      holeRadius: board.holeRadius,
    };
  } else {
    return {
      type: 'BaseBoard',
      vertices: board.vertices.map((vertex) => {
        return {
          x: vertex.logicalCoordinates.x,
          y: vertex.logicalCoordinates.y,
          vx: vertex.viewCoordinates.x,
          vy: vertex.viewCoordinates.y,
        };
      }),
      faces: board.faces.map((face) => {
        return {
          x: face.logicalCoordinates.x,
          y: face.logicalCoordinates.y,
          vertices: face.vertices.map((vertex) => board.vertices.indexOf(vertex)),
        };
      }),
    };
  }
};
