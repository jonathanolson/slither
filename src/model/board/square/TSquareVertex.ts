import { TVertex } from '../core/TVertex.ts';
import { CardinalDirection, OrdinalDirection } from './Direction.ts';
import { Vector2 } from 'phet-lib/dot';
import { TSquareHalfEdge } from './TSquareHalfEdge.ts';
import { TSquareEdge } from './TSquareEdge.ts';
import { TSquareFace } from './TSquareFace.ts';

export interface TSquareVertex extends TVertex {
  logicalCoordinates: Vector2;
  viewCoordinates: Vector2;
  incomingHalfEdges: TSquareHalfEdge[];
  outgoingHalfEdges: TSquareHalfEdge[];
  edges: TSquareEdge[];
  faces: TSquareFace[];

  getHalfEdgeTo( otherVertex: TSquareVertex ): TSquareHalfEdge;

  getHalfEdgeFrom( otherVertex: TSquareVertex ): TSquareHalfEdge;

  getEdgeTo( otherVertex: TSquareVertex ): TSquareEdge;

  // Square-specific
  northIncomingHalfEdge: TSquareHalfEdge | null;
  eastIncomingHalfEdge: TSquareHalfEdge | null;
  southIncomingHalfEdge: TSquareHalfEdge | null;
  westIncomingHalfEdge: TSquareHalfEdge | null;
  northOutgoingHalfEdge: TSquareHalfEdge | null;
  eastOutgoingHalfEdge: TSquareHalfEdge | null;
  southOutgoingHalfEdge: TSquareHalfEdge | null;
  westOutgoingHalfEdge: TSquareHalfEdge | null;
  northEdge: TSquareEdge | null;
  eastEdge: TSquareEdge | null;
  southEdge: TSquareEdge | null;
  westEdge: TSquareEdge | null;
  northeastFace: TSquareFace | null;
  southeastFace: TSquareFace | null;
  southwestFace: TSquareFace | null;
  northwestFace: TSquareFace | null;

  getIncomingHalfEdge( direction: CardinalDirection ): TSquareHalfEdge | null;

  getOutgoingHalfEdge( direction: CardinalDirection ): TSquareHalfEdge | null;

  getEdge( direction: CardinalDirection ): TSquareEdge | null;

  getFace( direction: OrdinalDirection ): TSquareFace | null;

  getDirectionOfHalfEdge( halfEdge: TSquareHalfEdge ): CardinalDirection;

  getDirectionOfEdge( edge: TSquareEdge ): CardinalDirection;

  getDirectionOfFace( face: TSquareFace ): OrdinalDirection;
}
