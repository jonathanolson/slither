import { TBoard } from '../../board/core/TBoard.ts';
import { TFace } from '../../board/core/TFace.ts';
import { TAction, TSerializedAction } from '../core/TAction.ts';
import { TFaceColor, TFaceColorData } from './TFaceColorData.ts';

import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export class GeneralFaceColorAction implements TAction<TFaceColorData> {
  public constructor(
    public readonly board: TBoard,
    // TODO: MAKE THIS USE FaceColorPointer!!!!!!
    // TODO: This will enable (a) serialization, but also (b) won't mess us up if we compose this with another type of action
    public readonly addedFaceColors: Set<TFaceColor>,
    public readonly removedFaceColors: Set<TFaceColor>,
    public readonly faceChangeMap: Map<TFace, TFaceColor>,
    public readonly oppositeChangeMap: Map<TFaceColor, TFaceColor | null>,
    public invalidFaceColor: boolean,
  ) {
    assertEnabled() && assert(removedFaceColors.size <= faceChangeMap.size);
  }

  public apply(state: TFaceColorData): void {
    state.modifyFaceColors(
      this.addedFaceColors,
      this.removedFaceColors,
      this.faceChangeMap,
      this.oppositeChangeMap,
      this.invalidFaceColor,
    );
  }

  public getUndo(state: TFaceColorData): TAction<TFaceColorData> {
    // TODO: we'd want to create new face colors for the ones we would need to "add back"?
    throw new Error('getUndo unimplemented in GeneralFaceColorAction');
  }

  public isEmpty(): boolean {
    return (
      this.addedFaceColors.size === 0 &&
      this.removedFaceColors.size === 0 &&
      this.faceChangeMap.size === 0 &&
      this.oppositeChangeMap.size === 0
    );
  }

  public serializeAction(): TSerializedAction {
    // TODO: implement
    throw new Error('serializeAction unimplemented in GeneralFaceColorAction');
  }

  public static deserializeAction(board: TBoard, serializedAction: TSerializedAction): GeneralFaceColorAction {
    throw new Error('deserializeAction unimplemented in GeneralFaceColorAction');
  }
}
