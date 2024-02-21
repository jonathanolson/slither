import { TState } from '../data/core/TState.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { HexagonalBoard } from '../board/hex/HexagonalBoard.ts';
import FaceState from '../data/face/FaceState.ts';
import { CompleteData } from '../data/combined/CompleteData.ts';
import { TProperty, TinyProperty } from 'phet-lib/axon';
import { Vector2 } from 'phet-lib/dot';

export class BasicPuzzle<Data> {

  public readonly stateProperty: TProperty<TState<Data>>;

  public constructor(
    public readonly board: TBoard,
    initialState: TState<Data>
  ) {
    this.stateProperty = new TinyProperty( initialState );
  }

  public static loadPointyTopHexagonalString( str: string ): BasicPuzzle<TCompleteData> {
    assertEnabled() && assert( str.startsWith( 'h' ) || str.startsWith( 'H' ) );
    const [ radiusString, faceValues ] = str.slice( 1 ).split( ' ' );
    const radius = parseInt( radiusString );

    const board = new HexagonalBoard( radius, Math.sqrt( 3 ) / 2, str.startsWith( 'h' ) );

    const faceLocations = HexagonalBoard.enumeratePointyFaceCoordinates( radius );

    // TODO: just be able to read it out?
    const faceMap = new Map<Vector2, FaceState>();

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