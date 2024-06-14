import { TAction, TSerializedAction } from '../core/TAction.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { TCompleteData } from './TCompleteData.ts';
import { TFace } from '../../board/core/TFace.ts';
import { serializeFace } from '../../board/core/serializeFace.ts';
import { EraseEdgeCompleteAction } from './EraseEdgeCompleteAction.ts';
import { TSerializedFace } from '../../board/core/TSerializedFace.ts';
import { deserializeFace } from '../../board/core/deserializeFace.ts';

export class EraseFaceCompleteAction implements TAction<TCompleteData> {
  public constructor(public readonly face: TFace) {
    assertEnabled() && assert(face);
  }

  public apply(state: TCompleteData): void {
    this.face.edges.forEach((edge) => {
      new EraseEdgeCompleteAction(edge).apply(state);
    });
  }

  public getUndo(state: TCompleteData): TAction<TCompleteData> {
    throw new Error('getUndo unimplemented in EraseFaceCompleteAction');
  }

  public isEmpty(): boolean {
    return false;
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'EraseFaceCompleteAction',
      face: serializeFace(this.face),
    };
  }

  public static deserializeAction(board: TBoard, serializedAction: TSerializedAction): EraseFaceCompleteAction {
    const face = deserializeFace(board, serializedAction.face as TSerializedFace);

    return new EraseFaceCompleteAction(face);
  }
}
