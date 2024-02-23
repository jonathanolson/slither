import { TVertex } from './TVertex.ts';
import { TEdge } from './TEdge.ts';
import { TFace } from './TFace.ts';
import { TBoard } from './TBoard.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export interface THalfEdge {
  start: TVertex;
  end: TVertex;
  isReversed: boolean;
  edge: TEdge;
  reversed: THalfEdge;
  next: THalfEdge;
  previous: THalfEdge;
  face: TFace | null;
}

export type TSerializedHalfEdge = {
  start: { x: number; y: number };
  end: { x: number; y: number };
};

export const serializeHalfEdge = ( halfEdge: THalfEdge ): TSerializedHalfEdge => {
  return {
    start: { x: halfEdge.start.logicalCoordinates.x, y: halfEdge.start.logicalCoordinates.y },
    end: { x: halfEdge.end.logicalCoordinates.x, y: halfEdge.end.logicalCoordinates.y }
  };
};

export const deserializeHalfEdge = ( board: TBoard, serializedHalfEdge: TSerializedHalfEdge ): THalfEdge => {
  // TODO: more efficient lookup
  const halfEdge = board.halfEdges.find( halfEdge => {
    return (
      ( halfEdge.start.logicalCoordinates.x === serializedHalfEdge.start.x && halfEdge.start.logicalCoordinates.y === serializedHalfEdge.start.y ) &&
      ( halfEdge.end.logicalCoordinates.x === serializedHalfEdge.end.x && halfEdge.end.logicalCoordinates.y === serializedHalfEdge.end.y )
    );
  } );

  assertEnabled() && assert( halfEdge );
  return halfEdge!;
};
