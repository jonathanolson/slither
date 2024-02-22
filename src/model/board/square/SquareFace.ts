import { BaseFace } from '../core/BaseFace.ts';
import { TSquareStructure } from './TSquareStructure.ts';
import { TSquareFace } from './TSquareFace.ts';
import { TSquareHalfEdge } from './TSquareHalfEdge.ts';
import { TSquareEdge } from './TSquareEdge.ts';
import { TSquareVertex } from './TSquareVertex.ts';
import { SquareInitializer } from './SquareInitializer.ts';
import { CardinalDirection, OrdinalDirection } from './Direction.ts';
import { Orientation } from 'phet-lib/phet-core';

export class SquareFace extends BaseFace<TSquareStructure> implements TSquareFace {
  public northHalfEdge!: TSquareHalfEdge;
  public eastHalfEdge!: TSquareHalfEdge;
  public southHalfEdge!: TSquareHalfEdge;
  public westHalfEdge!: TSquareHalfEdge;
  public northEdge!: TSquareEdge;
  public eastEdge!: TSquareEdge;
  public southEdge!: TSquareEdge;
  public westEdge!: TSquareEdge;
  public northeastVertex!: TSquareVertex;
  public southeastVertex!: TSquareVertex;
  public southwestVertex!: TSquareVertex;
  public northwestVertex!: TSquareVertex;

  public initialize( init: SquareInitializer ) {
    const x = this.logicalCoordinates.x;
    const y = this.logicalCoordinates.y;

    this.northEdge = init.getEdge( x, y, Orientation.HORIZONTAL )!;
    this.westEdge = init.getEdge( x, y, Orientation.VERTICAL )!;
    this.southEdge = init.getEdge( x, y + 1, Orientation.HORIZONTAL )!;
    this.eastEdge = init.getEdge( x + 1, y, Orientation.VERTICAL )!;

    this.westHalfEdge = this.westEdge.forwardHalf;
    this.southHalfEdge = this.southEdge.forwardHalf;
    this.eastHalfEdge = this.eastEdge.reversedHalf;
    this.northHalfEdge = this.northEdge.reversedHalf;

    this.northwestVertex = init.getVertex( x, y )!;
    this.southwestVertex = init.getVertex( x, y + 1 )!;
    this.southeastVertex = init.getVertex( x + 1, y + 1 )!;
    this.northeastVertex = init.getVertex( x + 1, y )!;

    this.edges = [ this.westEdge, this.southEdge, this.eastEdge, this.northEdge ];
    this.halfEdges = [ this.westHalfEdge, this.southHalfEdge, this.eastHalfEdge, this.northHalfEdge ];
    this.vertices = [ this.northwestVertex, this.southwestVertex, this.southeastVertex, this.northeastVertex ];
  }

  public getHalfEdge( direction: CardinalDirection ): TSquareHalfEdge {
    switch ( direction ) {
      case CardinalDirection.NORTH:
        return this.northHalfEdge;
      case CardinalDirection.EAST:
        return this.eastHalfEdge;
      case CardinalDirection.SOUTH:
        return this.southHalfEdge;
      case CardinalDirection.WEST:
        return this.westHalfEdge;
      default:
        throw new Error( `Invalid direction: ${direction}` );

    }
  }

  public getEdge( direction: CardinalDirection ): TSquareEdge {
    switch ( direction ) {
      case CardinalDirection.NORTH:
        return this.northEdge;
      case CardinalDirection.EAST:
        return this.eastEdge;
      case CardinalDirection.SOUTH:
        return this.southEdge;
      case CardinalDirection.WEST:
        return this.westEdge;
      default:
        throw new Error( `Invalid direction: ${direction}` );
    }
  }

  public getVertex( direction: OrdinalDirection ): TSquareVertex {
    switch ( direction ) {
      case OrdinalDirection.NORTHEAST:
        return this.northeastVertex;
      case OrdinalDirection.SOUTHEAST:
        return this.southeastVertex;
      case OrdinalDirection.SOUTHWEST:
        return this.southwestVertex;
      case OrdinalDirection.NORTHWEST:
        return this.northwestVertex;
      default:
        throw new Error( `Invalid direction: ${direction}` );
    }
  }

  public getDirectionOfHalfEdge( halfEdge: TSquareHalfEdge ): CardinalDirection {
    if ( halfEdge === this.northHalfEdge ) {
      return CardinalDirection.NORTH;
    }
    else if ( halfEdge === this.eastHalfEdge ) {
      return CardinalDirection.EAST;
    }
    else if ( halfEdge === this.southHalfEdge ) {
      return CardinalDirection.SOUTH;
    }
    else if ( halfEdge === this.westHalfEdge ) {
      return CardinalDirection.WEST;
    }
    else {
      throw new Error( `Invalid half-edge: ${halfEdge}` );
    }
  }

  public getDirectionOfEdge( edge: TSquareEdge ): CardinalDirection {
    if ( edge === this.northEdge ) {
      return CardinalDirection.NORTH;
    }
    else if ( edge === this.eastEdge ) {
      return CardinalDirection.EAST;
    }
    else if ( edge === this.southEdge ) {
      return CardinalDirection.SOUTH;
    }
    else if ( edge === this.westEdge ) {
      return CardinalDirection.WEST;
    }
    else {
      throw new Error( `Invalid edge: ${edge}` );
    }
  }

  public getDirectionOfVertex( vertex: TSquareVertex ): OrdinalDirection {
    if ( vertex === this.northeastVertex ) {
      return OrdinalDirection.NORTHEAST;
    }
    else if ( vertex === this.southeastVertex ) {
      return OrdinalDirection.SOUTHEAST;
    }
    else if ( vertex === this.southwestVertex ) {
      return OrdinalDirection.SOUTHWEST;
    }
    else if ( vertex === this.northwestVertex ) {
      return OrdinalDirection.NORTHWEST;
    }
    else {
      throw new Error( `Invalid vertex: ${vertex}` );
    }
  }
}