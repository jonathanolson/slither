import { BaseHalfEdge } from '../core/BaseHalfEdge.ts';
import { TSquareStructure } from './TSquareStructure.ts';
import { TSquareHalfEdge } from './TSquareHalfEdge.ts';
import { TSquareVertex } from './TSquareVertex.ts';
import { SquareInitializer } from './SquareInitializer.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { Orientation } from 'phet-lib/phet-core';
import { Vector2 } from 'phet-lib/dot';
import { SquareEdge } from './SquareEdge.ts';

export class SquareHalfEdge extends BaseHalfEdge<TSquareStructure> implements TSquareHalfEdge {
  public orientation!: Orientation;
  public northVertex!: TSquareVertex; // defined for vertical - should fire an assertion if guessed wrong orientation
  public eastVertex!: TSquareVertex; // defined for horizontal - should fire an assertion if guessed wrong orientation
  public southVertex!: TSquareVertex; // defined for vertical - should fire an assertion if guessed wrong orientation
  public westVertex!: TSquareVertex; // defined for horizontal - should fire an assertion if guessed wrong orientation

  public initialize( init: SquareInitializer, orientation: Orientation, edge: SquareEdge ) {
    this.orientation = orientation;
    this.edge = edge;
    this.reversed = this.isReversed ? edge.forwardHalf : edge.reversedHalf;

    const start = this.start.logicalCoordinates;
    const end = this.end.logicalCoordinates;

    const delta = end.minus( start );
    assertEnabled() && assert( delta.magnitude === 1 );
    const ccw = ( v: Vector2 ) => new Vector2( v.y, -v.x );
    const cw = ( v: Vector2 ) => new Vector2( -v.y, v.x );

    // Our face is to the CCW, we can take the minimum values of x/y for the four corners to load it
    const offsetStart = ccw( delta ).plus( start );
    const offsetEnd = ccw( delta ).plus( end );
    this.face = init.getFace(
      Math.min( start.x, end.x, offsetStart.x, offsetEnd.x ),
      Math.min( start.y, end.y, offsetStart.y, offsetEnd.y )
    );

    const nextPoints = [ ccw( delta ), delta, cw( delta ) ].map( p => end.plus( p ) );
    const previousPoints = [ ccw( delta ), delta.negated(), cw( delta ) ].map( p => start.plus( p ) );

    this.next =
      init.getHalfEdge( end.x, end.y, nextPoints[ 0 ].x, nextPoints[ 0 ].y ) ||
      init.getHalfEdge( end.x, end.y, nextPoints[ 1 ].x, nextPoints[ 1 ].y ) ||
      init.getHalfEdge( end.x, end.y, nextPoints[ 2 ].x, nextPoints[ 2 ].y )!;

    this.previous =
      init.getHalfEdge( previousPoints[ 0 ].x, previousPoints[ 0 ].y, start.x, start.y ) ||
      init.getHalfEdge( previousPoints[ 1 ].x, previousPoints[ 1 ].y, start.x, start.y ) ||
      init.getHalfEdge( previousPoints[ 2 ].x, previousPoints[ 2 ].y, start.x, start.y )!;

    if ( orientation === Orientation.HORIZONTAL ) {
      this.westVertex = edge.start;
      this.eastVertex = edge.end;
    }
    else {
      this.northVertex = edge.start;
      this.southVertex = edge.end;
    }
  }
}