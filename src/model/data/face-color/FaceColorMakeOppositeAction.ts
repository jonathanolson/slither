import { TAction, TSerializedAction } from '../core/TAction.ts';
import { TFaceColor, TFaceColorData } from './TFaceColorData.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TFace } from '../../board/core/TFace.ts';
import { FaceColorMakeSameAction } from './FaceColorMakeSameAction.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { TFaceColorPointer, TSerializedFaceColorPointer } from './FaceColorPointer.ts';
import { deserializeFaceColorPointer } from './deserializeFaceColorPointer.ts';
import { serializeFaceColorPointer } from './serializeFaceColorPointer.ts';
import { dereferenceFaceColorPointer } from './dereferenceFaceColorPointer.ts';

export class FaceColorMakeOppositeAction implements TAction<TFaceColorData> {
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
      state.modifyFaceColors( [], [], new Map(), new Map(), true );
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

    if ( ( aOpposite && aOpposite === b ) || ( bOpposite && bOpposite === a ) ) {
      return;
    }

    if ( aOpposite && aOpposite === bOpposite ) {
      state.modifyFaceColors( [], [], new Map(), new Map(), true );
      return;
    }

    const removedFaceColors: TFaceColor[] = [];
    const faceChangeMap = new Map<TFace, TFaceColor>();
    const oppositeChangeMap = new Map<TFaceColor, TFaceColor | null>();

    const newA = bOpposite ? FaceColorMakeSameAction.combineFaces( a, bOpposite, state, removedFaceColors, faceChangeMap ) : a;
    const newB = aOpposite ? FaceColorMakeSameAction.combineFaces( b, aOpposite, state, removedFaceColors, faceChangeMap ) : b;

    oppositeChangeMap.set( newA, newB );
    oppositeChangeMap.set( newB, newA );

    state.modifyFaceColors( [], removedFaceColors, faceChangeMap, oppositeChangeMap, false );
  }

  public getUndo( state: TFaceColorData ): TAction<TFaceColorData> {
    throw new Error( 'getUndo unimplemented in FaceColorMakeOppositeAction' );
  }

  public isEmpty(): boolean {
    return false;
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'FaceColorMakeOppositeAction',
      a: serializeFaceColorPointer( this.a ),
      b: serializeFaceColorPointer( this.b ),
    };
  }

  public static deserializeAction( board: TBoard, serializedAction: TSerializedAction ): FaceColorMakeOppositeAction {
    return new FaceColorMakeOppositeAction(
      deserializeFaceColorPointer( board, serializedAction.a as TSerializedFaceColorPointer ),
      deserializeFaceColorPointer( board, serializedAction.b as TSerializedFaceColorPointer ),
    );
  }
}