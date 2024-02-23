import { TVertex } from './TVertex.ts';
import { THalfEdge } from './THalfEdge.ts';

import { TFace } from './TFace.ts';
import { TBoard } from './TBoard.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export interface TEdge {
  start: TVertex;
  end: TVertex;
  forwardHalf: THalfEdge;
  reversedHalf: THalfEdge;
  forwardFace: TFace | null;
  reversedFace: TFace | null;
  vertices: TVertex[];
  faces: TFace[];

  getOtherVertex( vertex: TVertex ): TVertex;

  getOtherFace( face: TFace | null ): TFace | null;
}

export type TSerializedEdge = {
  start: { x: number; y: number };
  end: { x: number; y: number };
};

export const serializeEdge = ( edge: TEdge ): TSerializedEdge => {
  return {
    start: { x: edge.start.logicalCoordinates.x, y: edge.start.logicalCoordinates.y },
    end: { x: edge.end.logicalCoordinates.x, y: edge.end.logicalCoordinates.y }
  };
};

export const deserializeEdge = ( board: TBoard, serializedEdge: TSerializedEdge ): TEdge => {
  // TODO: more efficient lookup
  const edge = board.edges.find( edge => {
    return (
      ( edge.start.logicalCoordinates.x === serializedEdge.start.x && edge.start.logicalCoordinates.y === serializedEdge.start.y ) &&
      ( edge.end.logicalCoordinates.x === serializedEdge.end.x && edge.end.logicalCoordinates.y === serializedEdge.end.y )
    );
  } );

  assertEnabled() && assert( edge );
  return edge!;
};
