import { TState } from '../data/core/TState.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { HexagonalBoard } from '../board/hex/HexagonalBoard.ts';
import FaceValue from '../data/face/FaceValue.ts';
import { CompleteData } from '../data/combined/CompleteData.ts';
import { TinyProperty, TProperty } from 'phet-lib/axon';
import { Vector2 } from 'phet-lib/dot';
import { TStructure } from '../board/core/TStructure.ts';
import { TFaceData } from '../data/face/TFaceData.ts';
import { TSolvedPuzzle } from '../generator/TSolvedPuzzle.ts';
import { Orientation } from 'phet-lib/phet-core';
import EdgeState from '../data/edge/EdgeState.ts';
import { TFace } from '../board/core/TFace.ts';
import { SquareBoard } from '../board/square/SquareBoard.ts';

export class BasicPuzzle<Data> {

  public readonly stateProperty: TProperty<TState<Data>>;

  public constructor(
    public readonly board: TBoard,
    initialState: TState<Data>
  ) {
    this.stateProperty = new TinyProperty( initialState );
  }

  public static fromSolvedPuzzle<Structure extends TStructure, Data extends TFaceData>( puzzle: TSolvedPuzzle<Structure, Data> ): BasicPuzzle<Data> {
    return new BasicPuzzle( puzzle.board, puzzle.cleanState );
  }

  public static loadDefaultPuzzle(): BasicPuzzle<TCompleteData> {
    return BasicPuzzle.loadFromSimpleString(
      '10x18 .3.1....1..032....0......3.1....02.3...02....3.1...........2011.01..01.......3...2302..........1102...3.......22..03.0322...........3.2....13...2.30....2.2......1....103..2....1.3.'
    );
  }

  /**
   * The format is:
   *
   * `${width}x${height} ${faceValues}`
   *
   * where faceValues is a string of length width * height, with 0/1/2/3 for numbers, or `.` for blank faces (for null).
   */
  public static loadFromSimpleString( str: string ): BasicPuzzle<TCompleteData> {
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

    return new BasicPuzzle( board, state );
  }

  public static loadDeprecatedScalaString( str: string ): BasicPuzzle<TCompleteData> {
    if ( !str.includes( '!' ) ) {
      return BasicPuzzle.loadFromSimpleString( str );
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
      // TODO: factor out this code?
      const edgeOrientation = edge.start.logicalCoordinates.x === edge.end.logicalCoordinates.x ? Orientation.VERTICAL : Orientation.HORIZONTAL;

      if ( edgeOrientation === Orientation.HORIZONTAL ) {
        const southFace = edge.start.logicalCoordinates.x < edge.end.logicalCoordinates.x ? edge.forwardFace : edge.reversedFace;
        const northFace = edge.start.logicalCoordinates.x < edge.end.logicalCoordinates.x ? edge.reversedFace : edge.forwardFace;

        if ( southFace ) {
          return getEdgeState( southFace, NORTH );
        }
        else {
          return getEdgeState( northFace!, SOUTH );
        }
      }
      else {
        const westFace = edge.start.logicalCoordinates.y < edge.end.logicalCoordinates.y ? edge.reversedFace : edge.forwardFace;
        const eastFace = edge.start.logicalCoordinates.y < edge.end.logicalCoordinates.y ? edge.forwardFace : edge.reversedFace;

        if ( westFace ) {
          return getEdgeState( westFace, EAST );
        }
        else {
          return getEdgeState( eastFace!, WEST );
        }
      }
    } );

    return new BasicPuzzle( board, state );
  }

  public static loadPointyTopHexagonalString( str: string ): BasicPuzzle<TCompleteData> {
    assertEnabled() && assert( str.startsWith( 'h' ) || str.startsWith( 'H' ) );
    const [ radiusString, faceValues ] = str.slice( 1 ).split( ' ' );
    const radius = parseInt( radiusString );

    const board = new HexagonalBoard( radius, Math.sqrt( 3 ) / 2, str.startsWith( 'h' ) );

    const faceLocations = HexagonalBoard.enumeratePointyFaceCoordinates( radius );

    // TODO: just be able to read it out?
    const faceMap = new Map<Vector2, FaceValue>();

    for ( let i = 0; i < faceValues.length; i++ ) {
      const value = faceValues[ i ];
      if ( value === '.' ) {
        continue;
      }
      const face = faceLocations[ i ];
      faceMap.set( face, parseInt( value ) );
    }

    const state = CompleteData.fromFaces( board, CompleteData.faceMapLookup( faceMap ) );

    return new BasicPuzzle( board, state );
  }
}