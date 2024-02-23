import { Vector2 } from 'phet-lib/dot';
import { THalfEdge } from './THalfEdge.ts';
import { TEdge } from './TEdge.ts';
import { TFace } from './TFace.ts';
import { TBoard } from './TBoard.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export interface TVertex {
  logicalCoordinates: Vector2;
  viewCoordinates: Vector2;
  incomingHalfEdges: THalfEdge[];
  outgoingHalfEdges: THalfEdge[];
  edges: TEdge[];
  faces: TFace[];

  getHalfEdgeTo( otherVertex: TVertex ): THalfEdge;

  getHalfEdgeFrom( otherVertex: TVertex ): THalfEdge;

  getEdgeTo( otherVertex: TVertex ): TEdge;
}

export type TSerializedVertex = {
  x: number;
  y: number;
};

export const serializeVertex = ( vertex: TVertex ): TSerializedVertex => {
  return {
    x: vertex.logicalCoordinates.x,
    y: vertex.logicalCoordinates.y
  };
};

export const deserializeVertex = ( board: TBoard, serializedVertex: TSerializedVertex ): TVertex => {
  // TODO: more efficient lookup
  const vertex = board.vertices.find( vertex => {
    return ( vertex.logicalCoordinates.x === serializedVertex.x && vertex.logicalCoordinates.y === serializedVertex.y );
  } );

  assertEnabled() && assert( vertex );
  return vertex!;
};
