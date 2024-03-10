import { TSerializedState, TState } from '../core/TState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TDelta } from '../core/TDelta.ts';
import { TinyEmitter } from 'phet-lib/axon';
import { TFaceColor, TFaceColorData } from './TFaceColorData.ts';
import { TFace } from '../../board/core/TFace.ts';
import { InvalidStateError } from '../../solver/errors/InvalidStateError.ts';

// TODO: can we... ditch the TState part of this? In a way it is useful though
export class FaceColorValidator implements TState<TFaceColorData> {

  public readonly faceColorsChangedEmitter = new TinyEmitter<[
    addedFaceColors: Iterable<TFaceColor>,
    removedFaceColors: Iterable<TFaceColor>,
    oppositeChangedFaceColors: Iterable<TFaceColor>,
    changedFaces: Iterable<TFace>,
  ]>();

  public constructor(
    // @ts-expect-error
    private readonly board: TBoard,
    private readonly solvedState: TState<TFaceColorData>
  ) {}

  public getFaceColors(): TFaceColor[] {
    return this.solvedState.getFaceColors();
  }

  public getInsideColor(): TFaceColor {
    return this.solvedState.getInsideColor();
  }

  public getOutsideColor(): TFaceColor {
    return this.solvedState.getOutsideColor();
  }

  public getFaceColor( face: TFace ): TFaceColor {
    return this.solvedState.getFaceColor( face );
  }

  public getFacesWithColor( faceColor: TFaceColor ): TFace[] {
    return this.solvedState.getFacesWithColor( faceColor );
  }

  public getFaceColorMap(): Map<TFace, TFaceColor> {
    return this.solvedState.getFaceColorMap();
  }

  public getOppositeFaceColor( faceColor: TFaceColor ): TFaceColor | null {
    return this.solvedState.getOppositeFaceColor( faceColor );
  }

  public hasInvalidFaceColors(): boolean {
    return this.solvedState.hasInvalidFaceColors();
  }

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

    const insideFaces = faces.filter( face => this.solvedState.getFaceColor( face ) === this.solvedState.getInsideColor() );
    const outsideFaces = faces.filter( face => this.solvedState.getFaceColor( face ) === this.solvedState.getOutsideColor() );

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