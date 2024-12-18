import { TBoard } from '../../board/core/TBoard.ts';
import { TFace } from '../../board/core/TFace.ts';
import { TSerializedFace } from '../../board/core/TSerializedFace.ts';
import { deserializeFace } from '../../board/core/deserializeFace.ts';
import { serializeFace } from '../../board/core/serializeFace.ts';
import { TAction, TSerializedAction } from '../core/TAction.ts';
import { FaceState, TSerializedFaceState } from './FaceState.ts';
import { TFaceStateData } from './TFaceStateData.ts';

export class GeneralFaceStateAction implements TAction<TFaceStateData> {
  public constructor(
    public readonly board: TBoard,
    public readonly faceStateMap: Map<TFace, FaceState> = new Map(),
  ) {}

  public apply(state: TFaceStateData): void {
    for (const [face, faceState] of this.faceStateMap) {
      state.setFaceState(face, faceState);
    }
  }

  public getUndo(state: TFaceStateData): TAction<TFaceStateData> {
    const faceStateMap = new Map<TFace, FaceState>();

    for (const face of this.faceStateMap.keys()) {
      faceStateMap.set(face, state.getFaceState(face));
    }

    return new GeneralFaceStateAction(this.board, faceStateMap);
  }

  public isEmpty(): boolean {
    return this.faceStateMap.size === 0;
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'GeneralFaceAction',
      faces: Array.from(this.faceStateMap.entries()).map(([face, faceState]) => ({
        face: serializeFace(face),
        state: faceState.serialize(),
      })),
    };
  }

  public static deserializeAction(board: TBoard, serializedAction: TSerializedAction): GeneralFaceStateAction {
    return new GeneralFaceStateAction(
      board,
      new Map(
        serializedAction.faces.map((serializedFaceState: { face: TSerializedFace; state: TSerializedFaceState }) => [
          deserializeFace(board, serializedFaceState.face),
          FaceState.deserialize(deserializeFace(board, serializedFaceState.face), serializedFaceState.state),
        ]),
      ),
    );
  }
}
