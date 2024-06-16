import { TEdge } from './TEdge.ts';
import { TFace } from './TFace.ts';
import { THalfEdge } from './THalfEdge.ts';

import { Vector2 } from 'phet-lib/dot';

export interface TVertex {
  logicalCoordinates: Vector2;
  viewCoordinates: Vector2;
  incomingHalfEdges: THalfEdge[];
  outgoingHalfEdges: THalfEdge[];
  edges: TEdge[];
  faces: TFace[];

  getHalfEdgeTo(otherVertex: TVertex): THalfEdge;

  getHalfEdgeFrom(otherVertex: TVertex): THalfEdge;

  getEdgeTo(otherVertex: TVertex): TEdge;
}
