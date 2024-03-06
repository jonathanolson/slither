import { GeneralFaceColorAction } from './GeneralFaceColorAction.ts';
import { TDelta } from '../core/TDelta.ts';
import { serializeFaceColorData, TFaceColor, TFaceColorData, TSerializedFaceColorData } from './TFaceColorData.ts';
import { TinyEmitter } from 'phet-lib/axon';
import { TBoard } from '../../board/core/TBoard.ts';
import { TState } from '../core/TState.ts';
import { TFace } from '../../board/core/TFace.ts';

export class GeneralFaceColorDelta extends GeneralFaceColorAction implements TDelta<TFaceColorData> {

  public readonly faceColorsChangedEmitter = new TinyEmitter<[
    addedFaceColors: Iterable<TFaceColor>,
    removedFaceColors: Iterable<TFaceColor>,
    oppositeChangedFaceColors: Iterable<TFaceColor>,
    changedFaces: Iterable<TFace>,
  ]>;

  public constructor(
    board: TBoard,
    public readonly parentState: TState<TFaceColorData>,
    addedFaceColors: Set<TFaceColor> = new Set(),
    removedFaceColors: Set<TFaceColor> = new Set(),
    faceChangeMap: Map<TFace, TFaceColor> = new Map(),
    oppositeChangeMap: Map<TFaceColor, TFaceColor | null> = new Map()
  ) {
    super( board, addedFaceColors, removedFaceColors, faceChangeMap, oppositeChangeMap );
  }

  public getFaceColors(): TFaceColor[] {
    return [
      ...[ ...this.parentState.getFaceColors() ].filter( faceColor => !this.removedFaceColors.has( faceColor ) ),
      ...this.addedFaceColors
    ];
  }

  public getInsideColor(): TFaceColor {
    return this.parentState.getInsideColor();
  }

  public getOutsideColor(): TFaceColor {
    return this.parentState.getOutsideColor();
  }

  public getFaceColor( face: TFace ): TFaceColor {
    return this.faceChangeMap.get( face ) ?? this.parentState.getFaceColor( face );
  }

  public getFacesWithColor( faceColor: TFaceColor ): TFace[] {
    const faces = new Set( this.parentState.getFacesWithColor( faceColor ) );

    for ( const [ face, newColor ] of this.faceChangeMap.entries() ) {
      if ( newColor === faceColor ) {
        faces.add( face );
      }
      else if ( faces.has( face ) ) {
        faces.delete( face );
      }
    }

    return [ ...faces ];
  }

  public getFaceColorMap(): Map<TFace, TFaceColor> {
    const map = new Map( this.parentState.getFaceColorMap() ); // TODO: get rid of excessive copy?

    for ( const [ face, newColor ] of this.faceChangeMap.entries() ) {
      map.set( face, newColor );
    }

    return map;
  }

  public getOppositeFaceColor( faceColor: TFaceColor ): TFaceColor | null {
    const oppositeChange = this.oppositeChangeMap.get( faceColor );
    return oppositeChange !== undefined ? oppositeChange : this.parentState.getOppositeFaceColor( faceColor );
  }

  public modifyFaceColors(
    addedFaceColors: Iterable<TFaceColor>,
    removedFaceColors: Iterable<TFaceColor>,
    faceChangeMap: Map<TFace, TFaceColor>,
    oppositeChangeMap: Map<TFaceColor, TFaceColor>
  ): void {
    /*
        addedFaceColors: Set<TFaceColor>,
    removedFaceColors: Set<TFaceColor>,
    faceChangeMap: Map<TFace, TFaceColor>,
    oppositeChangeMap: Map<TFaceColor, TFaceColor>
     */
    for ( const addedFaceColor of addedFaceColors ) {
      this.addedFaceColors.add( addedFaceColor );
    }

    for ( const removedFaceColor of removedFaceColors ) {
      if ( this.addedFaceColors.has( removedFaceColor ) ) {
        this.addedFaceColors.delete( removedFaceColor );
      }
      else {
        this.removedFaceColors.add( removedFaceColor );
      }
    }

    // TODO: consider checking the parent state to see if we can just remove bits?
    for ( const [ face, newColor ] of faceChangeMap.entries() ) {
      this.faceChangeMap.set( face, newColor );
    }

    for ( const [ oldColor, newColor ] of oppositeChangeMap.entries() ) {
      this.oppositeChangeMap.set( oldColor, newColor );
    }

    const oppositeChangedFaceColors = new Set<TFaceColor>( oppositeChangeMap.keys() );

    this.faceColorsChangedEmitter.emit(
      addedFaceColors,
      removedFaceColors,
      oppositeChangedFaceColors,
      faceChangeMap.keys()
    );
  }

  public clone(): GeneralFaceColorDelta {
    return new GeneralFaceColorDelta( this.board, this.parentState, new Set( this.addedFaceColors ), new Set( this.removedFaceColors ), new Map( this.faceChangeMap ), new Map( this.oppositeChangeMap ) );
  }

  public createDelta(): TDelta<TFaceColorData> {
    return new GeneralFaceColorDelta( this.board, this );
  }

  public serializeState( board: TBoard ): TSerializedFaceColorData {
    return serializeFaceColorData( this );
  }
}