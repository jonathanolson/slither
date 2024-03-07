import { TAction, TSerializedAction } from '../core/TAction.ts';
import { TFaceColor, TFaceColorData } from './TFaceColorData.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TFace } from '../../board/core/TFace.ts';
import { FaceColorMakeSameAction } from './FaceColorMakeSameAction.ts';

export class FaceColorMakeOppositeAction implements TAction<TFaceColorData> {
  public constructor(
    public readonly a: TFaceColor,
    public readonly b: TFaceColor
  ) {}

  public apply( state: TFaceColorData ): void {

    if ( this.a === this.b ) {
      state.modifyFaceColors( [], [], new Map(), new Map(), true );
      return;
    }

    const aOpposite = state.getOppositeFaceColor( this.a );
    const bOpposite = state.getOppositeFaceColor( this.b );

    if ( aOpposite && aOpposite === this.b || bOpposite && bOpposite === this.a ) {
      return;
    }

    if ( aOpposite && aOpposite === bOpposite ) {
      state.modifyFaceColors( [], [], new Map(), new Map(), true );
      return;
    }

    const removedFaceColors: TFaceColor[] = [];
    const faceChangeMap = new Map<TFace, TFaceColor>();
    const oppositeChangeMap = new Map<TFaceColor, TFaceColor | null>();

    const newA = bOpposite ? FaceColorMakeSameAction.combineFaces( this.a, bOpposite, state, removedFaceColors, faceChangeMap ) : this.a;
    const newB = aOpposite ? FaceColorMakeSameAction.combineFaces( this.b, aOpposite, state, removedFaceColors, faceChangeMap ) : this.b;

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
    // TODO: implement
    throw new Error( 'serializeAction unimplemented in FaceColorMakeOppositeAction' );
  }

  public static deserializeAction( board: TBoard, serializedAction: TSerializedAction ): FaceColorMakeOppositeAction {
    // TODO: implement
    throw new Error( 'deserializeAction unimplemented in FaceColorMakeOppositeAction' );
  }
}