import { TSerializedState, TState } from '../core/TState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TDelta } from '../core/TDelta.ts';
import { TinyEmitter } from 'phet-lib/axon';
import { TFaceColor, TFaceColorData } from './TFaceColorData.ts';
import { TFace } from '../../board/core/TFace.ts';
import { InvalidStateError } from '../../solver/errors/InvalidStateError.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

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
    private readonly currentState: TState<TFaceColorData>,
    private readonly solvedState: TState<TFaceColorData>
  ) {}

  public getFaceColors(): TFaceColor[] {
    return this.currentState.getFaceColors();
  }

  public getInsideColor(): TFaceColor {
    return this.currentState.getInsideColor();
  }

  public getOutsideColor(): TFaceColor {
    return this.currentState.getOutsideColor();
  }

  public getFaceColor( face: TFace ): TFaceColor {
    return this.currentState.getFaceColor( face );
  }

  public getFacesWithColor( faceColor: TFaceColor ): TFace[] {
    return this.currentState.getFacesWithColor( faceColor );
  }

  public getFaceColorMap(): Map<TFace, TFaceColor> {
    return this.currentState.getFaceColorMap();
  }

  public getOppositeFaceColor( faceColor: TFaceColor ): TFaceColor | null {
    return this.currentState.getOppositeFaceColor( faceColor );
  }

  public hasInvalidFaceColors(): boolean {
    return this.currentState.hasInvalidFaceColors();
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

    const affectedColors = new Set<TFaceColor>( [
      ...faceChangeMap.values(),
      ...oppositeChangeMap.keys(),
      ...faceChangeMap.values()
    ] );

    const faceColorMap = new Map( this.currentState.getFaceColorMap() ); // overly-protective copy
    for ( const face of faceChangeMap.keys() ) {
      faceColorMap.set( face, faceChangeMap.get( face )! );
    }

    const getOppositeFaceColor = ( color: TFaceColor ): TFaceColor | null => {
      if ( oppositeChangeMap.has( color ) ) {
        return oppositeChangeMap.get( color )!;
      }
      else if ( [ ...addedFaceColors ].includes( color ) ) {
        return this.currentState.getOppositeFaceColor( color );
      }
      else {
        return null;
      }
    };

    const faceColorInverseMap = new Map<TFaceColor, Set<TFace>>();
    for ( const face of faceColorMap.keys() ) {
      const color = faceColorMap.get( face )!;

      // Pull from all colors, so we can handle opposite color checks properly (boo, performance?)
      if ( !faceColorInverseMap.has( color ) ) {
        faceColorInverseMap.set( color, new Set( [ face ] ) );
      }
      faceColorInverseMap.get( color )!.add( face );
    }

    for ( const color of affectedColors ) {
      const faces = [ ...faceColorInverseMap.get( color )! ];
      assertEnabled() && assert( faces.length > 0 );

      const solvedColor = this.solvedState.getFaceColor( faces[ 0 ] );

      for ( const face of faces ) {
        if ( this.solvedState.getFaceColor( face ) !== solvedColor ) {
          throw new InvalidStateError( 'invalid face color' );
        }
      }

      const oppositeColor = getOppositeFaceColor( color );
      if ( oppositeColor ) {
        const solvedOppositeColor = this.solvedState.getFaceColor( [ ...faceColorInverseMap.get( oppositeColor )! ][ 0 ] );

        if ( solvedColor === solvedOppositeColor ) {
          throw new InvalidStateError( 'opposite colors are the same' );
        }
      }
    }

    // TODO: are these checks still helpful?
    //
    // const faces = [ ...faceChangeMap.keys() ];
    //
    // const insideFaces = faces.filter( face => this.solvedState.getFaceColor( face ) === this.solvedState.getInsideColor() );
    // const outsideFaces = faces.filter( face => this.solvedState.getFaceColor( face ) === this.solvedState.getOutsideColor() );
    //
    // const insideColors = new Set( insideFaces.map( face => faceChangeMap.get( face ) ).filter( color => color !== null ) as TFaceColor[] );
    // const outsideColors = new Set( outsideFaces.map( face => faceChangeMap.get( face ) ).filter( color => color !== null ) as TFaceColor[] );
    //
    // for ( const color of insideColors ) {
    //   if ( outsideColors.has( color ) ) {
    //     throw new InvalidStateError( 'inside and outside colors are the same' );
    //   }
    //
    //   const opposite = oppositeChangeMap.get( color );
    //   if ( opposite && insideColors.has( opposite ) ) {
    //     throw new InvalidStateError( 'opposite colors are the same' );
    //   }
    // }
    //
    // for ( const color of outsideColors ) {
    //   const opposite = oppositeChangeMap.get( color );
    //   if ( opposite && outsideColors.has( opposite ) ) {
    //     throw new InvalidStateError( 'opposite colors are the same' );
    //   }
    // }
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