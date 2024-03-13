import { TAction, TSerializedAction } from '../core/TAction.ts';
import { TFaceData } from './TFaceData.ts';
import { deserializeFace, serializeFace, TFace } from '../../board/core/TFace.ts';
import FaceValue from './FaceValue.ts';
import { TBoard } from '../../board/core/TBoard.ts';

export class FaceValueSetAction implements TAction<TFaceData> {

  public constructor(
    public readonly face: TFace,
    public readonly state: FaceValue
  ) {}

  public apply( state: TFaceData ): void {
    state.setFaceValue( this.face, this.state );
  }

  public getUndo( state: TFaceData ): TAction<TFaceData> {
    const previousValue = state.getFaceValue( this.face );
    return new FaceValueSetAction( this.face, previousValue );
  }

  public isEmpty(): boolean {
    return false;
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'FaceValueSetAction',
      edge: serializeFace( this.face ),
      state: this.state
    };
  }

  public static deserializeAction( board: TBoard, serializedAction: TSerializedAction ): FaceValueSetAction {
    return new FaceValueSetAction(
      deserializeFace( board, serializedAction.edge ),
      serializedAction.state
    );
  }
}
