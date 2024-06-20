import { polygonGenerators } from '../generators/polygonGenerators.ts';
import { HexagonalBoard } from '../hex/HexagonalBoard.ts';
import { SquareBoard } from '../square/SquareBoard.ts';
import { BaseBoard } from './BaseBoard.ts';
import { PolygonGeneratorBoard } from './PolygonGeneratorBoard.ts';
import { TBoard } from './TBoard.ts';
import { TSerializedBoard } from './TSerializedBoard.ts';
import { TFaceDescriptor, TVertexDescriptor, createBoardDescriptor } from './createBoardDescriptor.ts';

import { Vector2 } from 'phet-lib/dot';

import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export const deserializeBoard = (serializedBoard: TSerializedBoard): TBoard => {
  if (serializedBoard.type === 'PolygonGeneratorBoard') {
    const generator = polygonGenerators.find((generator) => generator.name === serializedBoard.generator)!;
    assertEnabled() && assert(generator);

    return PolygonGeneratorBoard.get(generator, serializedBoard.parameters);
  } else if (serializedBoard.type === 'BaseBoard') {
    const vertexDescriptors: TVertexDescriptor[] = serializedBoard.vertices.map((vertex) => {
      return {
        logicalCoordinates: new Vector2(vertex.x, vertex.y),
        viewCoordinates: new Vector2(vertex.vx, vertex.vy),
      };
    });

    const faceDescriptors: TFaceDescriptor[] = serializedBoard.faces.map((face) => {
      return {
        logicalCoordinates: new Vector2(face.x, face.y),
        vertices: face.vertices.map((vertexIndex) => vertexDescriptors[vertexIndex]),
      };
    });

    return new BaseBoard(createBoardDescriptor({ vertices: vertexDescriptors, faces: faceDescriptors }));
  } else if (serializedBoard.type === 'SquareBoard') {
    return new SquareBoard(serializedBoard.width, serializedBoard.height);
  } else if (serializedBoard.type === 'HexagonalBoard') {
    return new HexagonalBoard(
      serializedBoard.radius,
      serializedBoard.scale,
      serializedBoard.isPointyTop,
      serializedBoard.holeRadius,
    );
  } else {
    throw new Error(`Unknown board`);
  }
};
