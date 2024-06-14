import { TAction, TSerializedAction } from '../core/TAction.ts';
import { TFaceColor, TFaceColorData } from './TFaceColorData.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TFace } from '../../board/core/TFace.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { serializeFace } from '../../board/core/serializeFace.ts';
import { deserializeFace } from '../../board/core/deserializeFace.ts';
import { TSerializedFace } from '../../board/core/TSerializedFace.ts';

export class FaceColorSetAbsoluteAction implements TAction<TFaceColorData> {
  public constructor(
    public readonly face: TFace,
    public readonly isInside: boolean,
  ) {
    assertEnabled() && assert(face);
  }

  public apply(state: TFaceColorData): void {
    const outsideColor = state.getOutsideColor();
    const insideColor = state.getInsideColor();

    const nextColor = this.isInside ? insideColor : outsideColor;
    const nextOppositeColor = this.isInside ? outsideColor : insideColor;

    const currentColor = state.getFaceColor(this.face);
    const currentOppositeColor = state.getOppositeFaceColor(currentColor);

    if (assertEnabled()) {
      const colors = new Set(state.getFaceColors());
      assert(colors.has(currentColor));
      if (currentOppositeColor) {
        assert(colors.has(currentOppositeColor));
      }
    }

    if (currentColor === nextColor) {
      // no-op!
    } else if (currentColor === nextOppositeColor) {
      // If it had the opposite color, we will JUST adjust this face directly (and none of the other ones)
      state.modifyFaceColors([], [], new Map([[this.face, nextColor]]), new Map(), false);
    } else {
      const removedColors = [currentColor, ...(currentOppositeColor ? [currentOppositeColor] : [])];

      const changeMap: Map<TFace, TFaceColor> = new Map();
      for (const colorFace of state.getFacesWithColor(currentColor)) {
        changeMap.set(colorFace, nextColor);
      }
      if (currentOppositeColor) {
        for (const colorFace of state.getFacesWithColor(currentOppositeColor)) {
          changeMap.set(colorFace, nextOppositeColor);
        }
      }

      state.modifyFaceColors([], removedColors, changeMap, new Map(), false);
    }
  }

  public getUndo(state: TFaceColorData): TAction<TFaceColorData> {
    throw new Error('getUndo unimplemented in FaceColorSetAbsoluteAction');
  }

  public isEmpty(): boolean {
    return false;
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'FaceColorSetAbsoluteAction',
      face: serializeFace(this.face),
      isInside: this.isInside,
    };
  }

  public static deserializeAction(board: TBoard, serializedAction: TSerializedAction): FaceColorSetAbsoluteAction {
    const face = deserializeFace(board, serializedAction.face as TSerializedFace);
    const isInside = serializedAction.isInside as boolean;

    return new FaceColorSetAbsoluteAction(face, isInside);
  }
}
