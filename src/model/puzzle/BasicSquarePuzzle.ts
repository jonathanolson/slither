import { TState } from '../data/core/TState.ts';
import { TSquareBoard } from '../board/square/TSquareBoard.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { SquareBoard } from '../board/square/SquareBoard.ts';
import { CompleteData } from '../data/combined/CompleteData.ts';
import { TFace } from '../board/core/TFace.ts';
import EdgeState from '../data/edge/EdgeState.ts';
import { TSquareEdge } from '../board/square/TSquareEdge.ts';
import { TinyProperty, TProperty } from 'phet-lib/axon';
import { Orientation } from 'phet-lib/phet-core';

export class BasicSquarePuzzle<Data> {

  public readonly stateProperty: TProperty<TState<Data>>;

  public constructor(
    public readonly board: TSquareBoard,
    initialState: TState<Data>
  ) {
    this.stateProperty = new TinyProperty( initialState );
  }

  /**
   * The format is:
   *
   * `${width}x${height} ${faceValues}`
   *
   * where faceValues is a string of length width * height, with 0/1/2/3 for numbers, or `.` for blank faces (for null).
   */
  public static loadFromSimpleString( str: string ): BasicSquarePuzzle<TCompleteData> {
    const [ size, faceValues ] = str.split( ' ' );
    const [ width, height ] = size.split( 'x' ).map( x => parseInt( x ) );

    const board = new SquareBoard( width, height );

    const state = CompleteData.fromFaces( board, face => {
      const index = face.logicalCoordinates.y * width + face.logicalCoordinates.x;
      const value = faceValues[ index ];
      if ( value === '.' ) {
        return null;
      }
      else {
        return parseInt( value );
      }
    } );

    return new BasicSquarePuzzle( board, state );
  }

  public static loadDeprecatedScalaString( str: string ): BasicSquarePuzzle<TCompleteData> {
    if ( !str.includes( '!' ) ) {
      return BasicSquarePuzzle.loadFromSimpleString( str );
    }

    // After each face value, we used to provide two digits: BlackDigit and RedDigit.
    // 0x1 mask is for E, 0x2 mask is for N, 0x4 mask is for W, 0x8 mask is for S.
    const EAST = 0x1;
    const NORTH = 0x2;
    const WEST = 0x4;
    const SOUTH = 0x8;

    // "complex" format from that code
    const [ size, faceValues ] = str.split( ' ' );
    const [ width, height ] = size.split( 'x' ).map( x => parseInt( x ) );

    const board = new SquareBoard( width, height );

    const getFaceIndex = ( face: TFace ) => 3 * ( face.logicalCoordinates.y * width + face.logicalCoordinates.x ) + 1;
    const getEdgeState = ( face: TFace, mask: number ): EdgeState => {
      const index = getFaceIndex( face );

      const blackDigit = parseInt( faceValues[ index + 1 ] );
      const redDigit = parseInt( faceValues[ index + 2 ] );

      if ( blackDigit & mask ) {
        return EdgeState.BLACK;
      }
      else if ( redDigit & mask ) {
        return EdgeState.RED;
      }
      else {
        return EdgeState.WHITE;
      }
    };

    const state = CompleteData.fromFacesEdges( board, face => {
      const value = faceValues[ getFaceIndex( face ) ];
      if ( value === '.' ) {
        return null;
      }
      else {
        return parseInt( value );
      }
    }, edge => {
      const squareEdge = edge as TSquareEdge;

      if ( squareEdge.orientation === Orientation.HORIZONTAL ) {
        if ( squareEdge.southFace ) {
          return getEdgeState( squareEdge.southFace, NORTH );
        }
        else {
          return getEdgeState( squareEdge.northFace!, SOUTH );
        }
      }
      else {
        if ( squareEdge.westFace ) {
          return getEdgeState( squareEdge.westFace, EAST );
        }
        else {
          return getEdgeState( squareEdge.eastFace!, WEST );
        }
      }
    } );

    return new BasicSquarePuzzle( board, state );
  }
}