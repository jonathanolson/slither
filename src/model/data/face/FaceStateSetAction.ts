import { TAction, TSerializedAction } from '../core/TAction.ts';
import { TFaceData } from './TFaceData.ts';
import { deserializeFace, serializeFace, TFace } from '../../board/core/TFace.ts';
import FaceState from './FaceState.ts';
import { TBoard } from '../../board/core/TBoard.ts';

export class FaceStateSetAction implements TAction<TFaceData> {

  public constructor(
    public readonly face: TFace,
    public readonly state: FaceState
  ) {}

  public apply( state: TFaceData ): void {
    state.setFaceState( this.face, this.state );
  }

  public getUndo( state: TFaceData ): TAction<TFaceData> {
    const previousState = state.getFaceState( this.face );
    return new FaceStateSetAction( this.face, previousState );
  }

  public isEmpty(): boolean {
    return false;
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'FaceStateSetAction',
      edge: serializeFace( this.face ),
      state: this.state
    };
  }

  public static deserializeAction( board: TBoard, serializedAction: TSerializedAction ): FaceStateSetAction {
    return new FaceStateSetAction(
      deserializeFace( board, serializedAction.edge ),
      serializedAction.state
    );
  }
}
