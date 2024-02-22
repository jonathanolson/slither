import { BaseBoard } from '../core/BaseBoard.ts';
import { TSquareStructure } from './TSquareStructure.ts';
import { TSquareBoard } from './TSquareBoard.ts';
import { TSquareVertex } from './TSquareVertex.ts';
import { TSquareEdge } from './TSquareEdge.ts';
import { TSquareHalfEdge } from './TSquareHalfEdge.ts';
import { TSquareFace } from './TSquareFace.ts';
import { SquareFace } from './SquareFace.ts';
import { SquareVertex } from './SquareVertex.ts';
import { SquareEdge } from './SquareEdge.ts';
import { SquareHalfEdge } from './SquareHalfEdge.ts';
import { SquareInitializer } from './SquareInitializer.ts';
import { assertEnabled } from '../../../workarounds/assert.ts';
import { Orientation } from 'phet-lib/phet-core';
import { Vector2 } from 'phet-lib/dot';
import { validateSquareBoard } from '../core/validateSquareBoard.ts';

export class SquareBoard extends BaseBoard<TSquareStructure> implements TSquareBoard {

  // For the upper-left corner of each primitive. Edges go down(south) or right(east) from this.
  public readonly getVertex: ( x: number, y: number ) => TSquareVertex | null;
  public readonly getEdge: ( x: number, y: number, orientation: Orientation ) => TSquareEdge | null;
  public readonly getHalfEdge: ( x0: number, y0: number, x1: number, y1: number ) => TSquareHalfEdge | null;
  public readonly getFace: ( x: number, y: number ) => TSquareFace | null;
  public readonly isSquare = true;

  public constructor(
    // width/height for faces
    public readonly width: number,
    public readonly height: number
  ) {

    const forEachFace = ( f: ( x: number, y: number ) => void ) => {
      for ( let y = 0; y < height; y++ ) {
        for ( let x = 0; x < width; x++ ) {
          f( x, y );
        }
      }
    };

    const forEachVertex = ( f: ( x: number, y: number ) => void ) => {
      for ( let y = 0; y <= height; y++ ) {
        for ( let x = 0; x <= width; x++ ) {
          f( x, y );
        }
      }
    };

    const faces: SquareFace[] = [];
    const vertices: SquareVertex[] = [];
    const horizontalEdges: SquareEdge[] = [];
    const verticalEdges: SquareEdge[] = [];

    // upper-left of each "face" or "edge" coordinate
    const getFace = ( x: number, y: number ) => faces[ y * width + x ];
    const getVertex = ( x: number, y: number ) => vertices[ y * ( width + 1 ) + x ];
    const getHorizontalEdge = ( x: number, y: number ) => horizontalEdges[ y * width + x ];
    const getVerticalEdge = ( x: number, y: number ) => verticalEdges[ y * ( width + 1 ) + x ];

    forEachFace( ( x, y ) => {
      faces.push( new SquareFace(
        new Vector2( x, y ),
        new Vector2( x + 0.5, y + 0.5 )
      ) );
    } );

    forEachVertex( ( x, y ) => {
      vertices.push( new SquareVertex(
        new Vector2( x, y ),
        new Vector2( x, y )
      ) );
    } );

    forEachVertex( ( x, y ) => {
      const createEdge = ( start: SquareVertex, end: SquareVertex ): SquareEdge => {
        const edge = new SquareEdge( start, end );

        edge.forwardHalf = new SquareHalfEdge( start, end, false );
        edge.reversedHalf = new SquareHalfEdge( end, start, true );

        return edge;
      };

      if ( x < width ) {
        horizontalEdges.push( createEdge(
          getVertex( x, y ),
          getVertex( x + 1, y )
        ) );
      }

      if ( y < height ) {
        verticalEdges.push( createEdge(
          getVertex( x, y ),
          getVertex( x, y + 1 )
        ) );
      }
    } );

    const init: SquareInitializer = {
      width: width,
      height: height,
      getVertex: ( x, y ) => {
        if ( x < 0 || y < 0 || x > width || y > height ) {
          return null;
        }
        return getVertex( x, y );
      },
      getEdge: ( x, y, orientation ) => {
        if ( x < 0 || y < 0 ) {
          return null;
        }
        if ( orientation === Orientation.HORIZONTAL ) {
          if ( x >= width || y > height ) {
            return null;
          }
          return getHorizontalEdge( x, y );
        }
        else {
          if ( x > width || y >= height ) {
            return null;
          }
          return getVerticalEdge( x, y );
        }
      },
      getHalfEdge: ( x0, y0, x1, y1 ) => {
        if ( x0 < 0 || y0 < 0 || x1 < 0 || y1 < 0 || x0 > width || y0 > height || x1 > width || y1 > height ) {
          return null;
        }

        const x = Math.min( x0, x1 );
        const y = Math.min( y0, y1 );

        if ( x0 === x1 && Math.abs( y0 - y1 ) === 1 ) {
          const edge = getVerticalEdge( x, y );
          return y0 < y1 ? edge.forwardHalf : edge.reversedHalf;
        }
        else if ( y0 === y1 && Math.abs( x0 - x1 ) === 1 ) {
          const edge = getHorizontalEdge( x, y );
          return x0 < x1 ? edge.forwardHalf : edge.reversedHalf;
        }
        else {
          throw new Error( 'invalid request' );
        }
      },
      getFace: ( x, y ) => {
        if ( x < 0 || y < 0 || x >= width || y >= height ) {
          return null;
        }
        return getFace( x, y );
      }
    };

    forEachFace( ( x, y ) => {
      getFace( x, y ).initialize( init );
    } );

    forEachVertex( ( x, y ) => {
      getVertex( x, y ).initialize( init );
      if ( x < width ) {
        getHorizontalEdge( x, y ).initialize( init, Orientation.HORIZONTAL );
      }
      if ( y < height ) {
        getVerticalEdge( x, y ).initialize( init, Orientation.VERTICAL );
      }
    } );

    const edges: SquareEdge[] = [
      ...horizontalEdges,
      ...verticalEdges
    ];

    const halfEdges = edges.flatMap( edge => [ edge.forwardHalf, edge.reversedHalf ] );

    const firstBoundaryHalfEdge = halfEdges.find( halfEdge => halfEdge.face === null )!;
    const outerBoundary: TSquareHalfEdge[] = [ firstBoundaryHalfEdge ];
    let nextBoundaryEdge = firstBoundaryHalfEdge.next;
    while ( nextBoundaryEdge !== firstBoundaryHalfEdge ) {
      outerBoundary.push( nextBoundaryEdge );
      nextBoundaryEdge = nextBoundaryEdge.next;
    }

    // TODO: use createBoardDescriptor instead, if we can skip the square-specific info.
    super( {
      edges,
      vertices,
      faces,
      halfEdges,
      outerBoundary: outerBoundary,
      innerBoundaries: []
    } );

    this.getVertex = init.getVertex;
    this.getEdge = init.getEdge;
    this.getHalfEdge = init.getHalfEdge;
    this.getFace = init.getFace;

    assertEnabled() && validateSquareBoard( this );
  }
}