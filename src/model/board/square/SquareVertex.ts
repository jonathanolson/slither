import { BaseVertex } from '../core/BaseVertex.ts';
import { TSquareStructure } from './TSquareStructure.ts';
import { TSquareVertex } from './TSquareVertex.ts';
import { TSquareHalfEdge } from './TSquareHalfEdge.ts';
import { TSquareEdge } from './TSquareEdge.ts';
import { TSquareFace } from './TSquareFace.ts';
import { SquareInitializer } from './SquareInitializer.ts';
import { CardinalDirection, OrdinalDirection } from './Direction.ts';
import { Orientation } from 'phet-lib/phet-core';

export class SquareVertex extends BaseVertex<TSquareStructure> implements TSquareVertex {
  public northIncomingHalfEdge: TSquareHalfEdge | null = null;
  public eastIncomingHalfEdge: TSquareHalfEdge | null = null;
  public southIncomingHalfEdge: TSquareHalfEdge | null = null;
  public westIncomingHalfEdge: TSquareHalfEdge | null = null;
  public northOutgoingHalfEdge: TSquareHalfEdge | null = null;
  public eastOutgoingHalfEdge: TSquareHalfEdge | null = null;
  public southOutgoingHalfEdge: TSquareHalfEdge | null = null;
  public westOutgoingHalfEdge: TSquareHalfEdge | null = null;
  public northEdge: TSquareEdge | null = null;
  public eastEdge: TSquareEdge | null = null;
  public southEdge: TSquareEdge | null = null;
  public westEdge: TSquareEdge | null = null;
  public northeastFace: TSquareFace | null = null;
  public southeastFace: TSquareFace | null = null;
  public southwestFace: TSquareFace | null = null;
  public northwestFace: TSquareFace | null = null;

  public initialize( init: SquareInitializer ) {
    const x = this.logicalCoordinates.x;
    const y = this.logicalCoordinates.y;

    this.westEdge = init.getEdge( x - 1, y, Orientation.HORIZONTAL );
    this.northEdge = init.getEdge( x, y - 1, Orientation.VERTICAL );
    this.eastEdge = init.getEdge( x, y, Orientation.HORIZONTAL );
    this.southEdge = init.getEdge( x, y, Orientation.VERTICAL );

    this.westIncomingHalfEdge = this.westEdge ? this.westEdge.forwardHalf : null;
    this.northIncomingHalfEdge = this.northEdge ? this.northEdge.forwardHalf : null;
    this.eastIncomingHalfEdge = this.eastEdge ? this.eastEdge.reversedHalf : null;
    this.southIncomingHalfEdge = this.southEdge ? this.southEdge.reversedHalf : null;
    this.westOutgoingHalfEdge = this.westEdge ? this.westEdge.reversedHalf : null;
    this.northOutgoingHalfEdge = this.northEdge ? this.northEdge.reversedHalf : null;
    this.eastOutgoingHalfEdge = this.eastEdge ? this.eastEdge.forwardHalf : null;
    this.southOutgoingHalfEdge = this.southEdge ? this.southEdge.forwardHalf : null;

    this.northwestFace = init.getFace( x - 1, y - 1 );
    this.northeastFace = init.getFace( x, y - 1 );
    this.southeastFace = init.getFace( x, y );
    this.southwestFace = init.getFace( x - 1, y );

    this.incomingHalfEdges = [
      this.westIncomingHalfEdge,
      this.southIncomingHalfEdge,
      this.eastIncomingHalfEdge,
      this.northIncomingHalfEdge
    ].filter( e => e !== null ) as TSquareHalfEdge[];

    this.outgoingHalfEdges = [
      this.westOutgoingHalfEdge,
      this.southOutgoingHalfEdge,
      this.eastOutgoingHalfEdge,
      this.northOutgoingHalfEdge
    ].filter( e => e !== null ) as TSquareHalfEdge[];

    this.edges = [ this.westEdge, this.southEdge, this.eastEdge, this.northEdge ].filter( e => e !== null ) as TSquareEdge[];
    this.faces = [ this.northwestFace, this.southwestFace, this.southeastFace, this.northeastFace ].filter( e => e !== null ) as TSquareFace[];
  }

  getIncomingHalfEdge( direction: CardinalDirection ): TSquareHalfEdge | null {
    switch( direction ) {
      case CardinalDirection.NORTH:
        return this.northIncomingHalfEdge;
      case CardinalDirection.EAST:
        return this.eastIncomingHalfEdge;
      case CardinalDirection.SOUTH:
        return this.southIncomingHalfEdge;
      case CardinalDirection.WEST:
        return this.westIncomingHalfEdge;
      default:
        throw new Error( `Invalid direction: ${direction}` );
    }
  }

  getOutgoingHalfEdge( direction: CardinalDirection ): TSquareHalfEdge | null {
    switch( direction ) {
      case CardinalDirection.NORTH:
        return this.northOutgoingHalfEdge;
      case CardinalDirection.EAST:
        return this.eastOutgoingHalfEdge;
      case CardinalDirection.SOUTH:
        return this.southOutgoingHalfEdge;
      case CardinalDirection.WEST:
        return this.westOutgoingHalfEdge;
      default:
        throw new Error( `Invalid direction: ${direction}` );
    }
  }

  getEdge( direction: CardinalDirection ): TSquareEdge | null {
    switch( direction ) {
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

  getFace( direction: OrdinalDirection ): TSquareFace | null {
    switch( direction ) {
      case OrdinalDirection.NORTHEAST:
        return this.northeastFace;
      case OrdinalDirection.SOUTHEAST:
        return this.southeastFace;
      case OrdinalDirection.SOUTHWEST:
        return this.southwestFace;
      case OrdinalDirection.NORTHWEST:
        return this.northwestFace;
      default:
        throw new Error( `Invalid direction: ${direction}` );
    }
  }

  getDirectionOfHalfEdge( halfEdge: TSquareHalfEdge ): CardinalDirection {
    if ( halfEdge === this.northIncomingHalfEdge ) {
      return CardinalDirection.NORTH;
    }
    else if ( halfEdge === this.eastIncomingHalfEdge ) {
      return CardinalDirection.EAST;
    }
    else if ( halfEdge === this.southIncomingHalfEdge ) {
      return CardinalDirection.SOUTH;
    }
    else if ( halfEdge === this.westIncomingHalfEdge ) {
      return CardinalDirection.WEST;
    }
    else {
      throw new Error( `Invalid half-edge: ${halfEdge}` );
    }
  }

  getDirectionOfEdge( edge: TSquareEdge ): CardinalDirection {
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

  getDirectionOfFace( face: TSquareFace ): OrdinalDirection {
    if ( face === this.northeastFace ) {
      return OrdinalDirection.NORTHEAST;
    }
    else if ( face === this.southeastFace ) {
      return OrdinalDirection.SOUTHEAST;
    }
    else if ( face === this.southwestFace ) {
      return OrdinalDirection.SOUTHWEST;
    }
    else if ( face === this.northwestFace ) {
      return OrdinalDirection.NORTHWEST;
    }
    else {
      throw new Error( `Invalid face: ${face}` );
    }
  }
}