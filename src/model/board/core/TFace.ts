import { THalfEdge } from './THalfEdge.ts';
import { TEdge } from './TEdge.ts';
import { TVertex } from './TVertex.ts';
import { Vector2 } from 'phet-lib/dot';
import { TBoard } from './TBoard.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export interface TFace {
  logicalCoordinates: Vector2;
  viewCoordinates: Vector2;
  halfEdges: THalfEdge[];
  edges: TEdge[];
  vertices: TVertex[];
}

export type TSerializedFace = {
  x: number;
  y: number;
};

export const serializeFace = ( face: TFace ): TSerializedFace => {
  return {
    x: face.logicalCoordinates.x,
    y: face.logicalCoordinates.y
  };
};

export const deserializeFace = ( board: TBoard, serializedFace: TSerializedFace ): TFace => {
  // TODO: more efficient lookup
  const face = board.faces.find( face => {
    return ( face.logicalCoordinates.x === serializedFace.x && face.logicalCoordinates.y === serializedFace.y );
  } );

  assertEnabled() && assert( face );
  return face!;
};
