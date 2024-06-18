import { TBoard } from '../../board/core/TBoard.ts';
import { TFace } from '../../board/core/TFace.ts';
import { TSerializedFace } from '../../board/core/TSerializedFace.ts';
import { deserializeFace } from '../../board/core/deserializeFace.ts';
import { serializeFace } from '../../board/core/serializeFace.ts';
import { TAction, TSerializedAction } from '../core/TAction.ts';
import EdgeState from '../edge-state/EdgeState.ts';
import { GeneralFaceColor } from '../face-color/GeneralFaceColor.ts';
import { getFaceColorGlobalId } from '../face-color/GeneralFaceColorData.ts';
import FaceColorState from '../face-color/TFaceColorData.ts';
import { TCompleteData } from './TCompleteData.ts';

import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export class EraseFaceOnlyCompleteAction implements TAction<TCompleteData> {
  public constructor(public readonly face: TFace) {
    assertEnabled() && assert(face);
  }

  public apply(state: TCompleteData): void {
    const color = state.getFaceColor(this.face);
    const oppositeColor = state.getOppositeFaceColor(color);
    const facesWithColor = state.getFacesWithColor(color);

    // Clear the edges
    for (const edge of this.face.edges) {
      if (state.getEdgeState(edge) !== EdgeState.WHITE) {
        state.setEdgeState(edge, EdgeState.WHITE);
      }
    }

    if (color.colorState !== FaceColorState.UNDECIDED || oppositeColor || facesWithColor.length > 1) {
      // If we can, just detach the opposite color
      if (color.colorState === FaceColorState.UNDECIDED && facesWithColor.length === 1) {
        assertEnabled() && assert(oppositeColor);

        state.modifyFaceColors(
          [],
          [],
          new Map(),
          new Map([
            [color, null],
            [oppositeColor!, null],
          ]),
          false,
        );
      } else {
        const newColor = new GeneralFaceColor(getFaceColorGlobalId(), FaceColorState.UNDECIDED);

        state.modifyFaceColors([newColor], [], new Map([[this.face, newColor]]), new Map(), false);
      }
    }
  }

  public getUndo(state: TCompleteData): TAction<TCompleteData> {
    throw new Error('getUndo unimplemented in EraseFaceOnlyCompleteAction');
  }

  public isEmpty(): boolean {
    return false;
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'EraseFaceOnlyCompleteAction',
      face: serializeFace(this.face),
    };
  }

  public static deserializeAction(board: TBoard, serializedAction: TSerializedAction): EraseFaceOnlyCompleteAction {
    const face = deserializeFace(board, serializedAction.face as TSerializedFace);

    return new EraseFaceOnlyCompleteAction(face);
  }
}
