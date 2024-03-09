import { TSerializedState, TState } from '../core/TState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TDelta } from '../core/TDelta.ts';
import { TinyEmitter } from 'phet-lib/axon';
import { TSolvedPuzzle } from '../../generator/TSolvedPuzzle.ts';
import { TStructure } from '../../board/core/TStructure.ts';
import { TFaceData } from '../face/TFaceData.ts';
import { TFaceColor, TFaceColorData } from './TFaceColorData.ts';
import { TFace } from '../../board/core/TFace.ts';
import { InvalidStateError } from '../../solver/InvalidStateError.ts';

// TODO: can we... ditch the TState part of this? In a way it is useful though
export class FaceColorValidator implements TState<TFaceColorData> {

  public readonly faceColorsChangedEmitter = new TinyEmitter<[
    addedFaceColors: Iterable<TFaceColor>,
    removedFaceColors: Iterable<TFaceColor>,
    oppositeChangedFaceColors: Iterable<TFaceColor>,
    changedFaces: Iterable<TFace>,
  ]>();

  public constructor(
    private readonly solvedPuzzle: TSolvedPuzzle<TStructure, TFaceData & TFaceColorData>
  ) {}

  public getFaceColors(): TFaceColor[] { throw new Error( 'unimplemented' ); }
  public getInsideColor(): TFaceColor { throw new Error( 'unimplemented' ); }
  public getOutsideColor(): TFaceColor { throw new Error( 'unimplemented' ); }

  public getFaceColor( face: TFace ): TFaceColor { throw new Error( 'unimplemented' ); }
  public getFacesWithColor( faceColor: TFaceColor ): TFace[] { throw new Error( 'unimplemented' ); }
  public getFaceColorMap(): Map<TFace, TFaceColor> { throw new Error( 'unimplemented' ); }
  public getOppositeFaceColor( faceColor: TFaceColor ): TFaceColor | null { throw new Error( 'unimplemented' ); }

  public hasInvalidFaceColors(): boolean { throw new Error( 'unimplemented' ); }

  public modifyFaceColors(
    addedFaceColors: Iterable<TFaceColor>,
    removedFaceColors: Iterable<TFaceColor>,
    faceChangeMap: Map<TFace, TFaceColor>,
    oppositeChangeMap: Map<TFaceColor, TFaceColor | null>,
    invalidFaceColor: boolean
  ): void {
    if ( invalidFaceColor ) {
      throw new InvalidStateError( 'invalid face color?' );
    }

    const faces = [ ...faceChangeMap.keys() ];

    const insideFaces = faces.filter( face => this.solvedPuzzle.state.getFaceColor( face ) === this.solvedPuzzle.state.getInsideColor() );
    const outsideFaces = faces.filter( face => this.solvedPuzzle.state.getFaceColor( face ) === this.solvedPuzzle.state.getOutsideColor() );

    const insideColors = new Set( insideFaces.map( face => faceChangeMap.get( face ) ).filter( color => color !== null ) as TFaceColor[] );
    const outsideColors = new Set( outsideFaces.map( face => faceChangeMap.get( face ) ).filter( color => color !== null ) as TFaceColor[] );

    for ( const color of insideColors ) {
      if ( outsideColors.has( color ) ) {
        throw new InvalidStateError( 'inside and outside colors are the same' );
      }

      const opposite = oppositeChangeMap.get( color );
      if ( opposite && insideColors.has( opposite ) ) {
        throw new InvalidStateError( 'opposite colors are the same' );
      }
    }

    for ( const color of outsideColors ) {
      const opposite = oppositeChangeMap.get( color );
      if ( opposite && outsideColors.has( opposite ) ) {
        throw new InvalidStateError( 'opposite colors are the same' );
      }
    }
  }

  public clone(): FaceColorValidator {
    return this;
  }

  public createDelta(): TDelta<TFaceColorData> {
    return this as unknown as TDelta<TFaceColorData>;
  }

  public serializeState( board: TBoard ): TSerializedState {
    throw new Error( 'unimplemented' );
  }
}