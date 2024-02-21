import { TFace } from '../core/TFace.ts';
import { TSquareHalfEdge } from './TSquareHalfEdge.ts';
import { TSquareEdge } from './TSquareEdge.ts';
import { TSquareVertex } from './TSquareVertex.ts';
import { CardinalDirection, OrdinalDirection } from './Direction.ts';
import { Vector2 } from 'phet-lib/dot';

export interface TSquareFace extends TFace {
  logicalCoordinates: Vector2;
  viewCoordinates: Vector2;
  halfEdges: TSquareHalfEdge[];
  edges: TSquareEdge[];
  vertices: TSquareVertex[];

  // Square-specific
  northHalfEdge: TSquareHalfEdge;
  eastHalfEdge: TSquareHalfEdge;
  southHalfEdge: TSquareHalfEdge;
  westHalfEdge: TSquareHalfEdge;
  northEdge: TSquareEdge;
  eastEdge: TSquareEdge;
  southEdge: TSquareEdge;
  westEdge: TSquareEdge;
  northeastVertex: TSquareVertex;
  southeastVertex: TSquareVertex;
  southwestVertex: TSquareVertex;
  northwestVertex: TSquareVertex;

  getHalfEdge( direction: CardinalDirection ): TSquareHalfEdge;

  getEdge( direction: CardinalDirection ): TSquareEdge;

  getVertex( direction: OrdinalDirection ): TSquareVertex;

  getDirectionOfHalfEdge( halfEdge: TSquareHalfEdge ): CardinalDirection;

  getDirectionOfEdge( edge: TSquareEdge ): CardinalDirection;

  getDirectionOfVertex( vertex: TSquareVertex ): OrdinalDirection;
}
