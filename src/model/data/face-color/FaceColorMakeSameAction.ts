import { TAction, TSerializedAction } from '../core/TAction.ts';
import FaceColorState, { TFaceColor, TFaceColorData } from './TFaceColorData.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TFace } from '../../board/core/TFace.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { dereferenceFaceColorPointer, TFaceColorPointer } from './FaceColorPointer.ts';

export class FaceColorMakeSameAction implements TAction<TFaceColorData> {
  public constructor(
    public readonly a: TFaceColorPointer,
    public readonly b: TFaceColorPointer
  ) {
    assertEnabled() && assert( a );
    assertEnabled() && assert( b );
  }

  public apply( state: TFaceColorData ): void {
    const a = dereferenceFaceColorPointer( state, this.a );
    const b = dereferenceFaceColorPointer( state, this.b );

    if ( a === b ) {
      return;
    }

    const aOpposite = state.getOppositeFaceColor( a );
    const bOpposite = state.getOppositeFaceColor( b );

    if ( assertEnabled() ) {
      const colors = new Set( state.getFaceColors() );
      assert( colors.has( a ) );
      assert( colors.has( b ) );
      if ( aOpposite ) {
        assert( colors.has( aOpposite ) );
      }
      if ( bOpposite ) {
        assert( colors.has( bOpposite ) );
      }
    }

    // TODO: based on opposite structure, we probably don't need both of these checks?
    if ( aOpposite && aOpposite === b || bOpposite && bOpposite === a ) {
      state.modifyFaceColors( [], [], new Map(), new Map(), true );
      return;
    }

    const removedFaceColors: TFaceColor[] = [];
    const faceChangeMap = new Map<TFace, TFaceColor>();
    const oppositeChangeMap = new Map<TFaceColor, TFaceColor | null>();

    const result = FaceColorMakeSameAction.combineFaces( a, b, state, removedFaceColors, faceChangeMap );
    const opposite = ( aOpposite && bOpposite ) ? FaceColorMakeSameAction.combineFaces( aOpposite, bOpposite, state, removedFaceColors, faceChangeMap ) : ( aOpposite || bOpposite );

    const hadOpposite = ( result === a && opposite === aOpposite ) || ( result === b && opposite === bOpposite );
    if ( !hadOpposite ) {
      oppositeChangeMap.set( result, opposite );
      if ( opposite ) {
        oppositeChangeMap.set( opposite, result );
      }
    }

    state.modifyFaceColors( [], removedFaceColors, faceChangeMap, oppositeChangeMap, false );
  }

  public getUndo( state: TFaceColorData ): TAction<TFaceColorData> {
    throw new Error( 'getUndo unimplemented in FaceColorMakeSameAction' );
  }

  public isEmpty(): boolean {
    return false;
  }

  public serializeAction(): TSerializedAction {
    // TODO: implement
    throw new Error( 'serializeAction unimplemented in FaceColorMakeSameAction' );
  }

  public static deserializeAction( board: TBoard, serializedAction: TSerializedAction ): FaceColorMakeSameAction {
    // TODO: implement
    throw new Error( 'deserializeAction unimplemented in FaceColorMakeSameAction' );
  }

  public static combineFaces(
    a: TFaceColor,
    b: TFaceColor,
    state: TFaceColorData,
    removedFaceColors: TFaceColor[],
    faceChangeMap: Map<TFace, TFaceColor>
  ): TFaceColor {
    let removedFaceColor: TFaceColor | null = null;
    if ( a.colorState !== FaceColorState.UNDECIDED ) {
      removedFaceColor = b;
    }
    else if ( b.colorState !== FaceColorState.UNDECIDED ) {
      removedFaceColor = a;
    }
    else {
      const aFaces = state.getFacesWithColor( a );
      const bFaces = state.getFacesWithColor( b );

      removedFaceColor = aFaces.length > bFaces.length ? b : a;
    }

    const keptFaceColor = removedFaceColor === a ? b : a;

    removedFaceColors.push( removedFaceColor );
    for ( const face of state.getFacesWithColor( removedFaceColor ) ) {
      faceChangeMap.set( face, keptFaceColor );
    }

    return keptFaceColor;
  }
}