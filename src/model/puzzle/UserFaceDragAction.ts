import { TBoard } from '../board/core/TBoard.ts';
import { TFace } from '../board/core/TFace.ts';
import { TSerializedFace } from '../board/core/TSerializedFace.ts';
import { deserializeFace } from '../board/core/deserializeFace.ts';
import { serializeFace } from '../board/core/serializeFace.ts';
import { EraseFaceCompleteAction } from '../data/combined/EraseFaceCompleteAction.ts';
import { EraseFaceOnlyCompleteAction } from '../data/combined/EraseFaceOnlyCompleteAction.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { TAction, TSerializedAction } from '../data/core/TAction.ts';
import { FaceColorMakeOppositeAction } from '../data/face-color/FaceColorMakeOppositeAction.ts';
import { FaceColorMakeSameAction } from '../data/face-color/FaceColorMakeSameAction.ts';
import FaceColorState, { TFaceColor } from '../data/face-color/TFaceColorData.ts';
import { getFaceColorPointer } from '../data/face-color/getFaceColorPointer.ts';

export class UserFaceDragAction implements TAction<TCompleteData> {
  public constructor(
    // TODO: how to support... outside better with drag input?
    public readonly primaryFaces: (TFace | null)[],
    public readonly secondaryFaces: (TFace | null)[],
    public readonly isAbsolute: boolean,
    public readonly state: FaceColorState,
    public readonly dragIndex: number,
  ) {}

  public apply(state: TCompleteData): void {
    console.log(this.state, this.primaryFaces, this.secondaryFaces);

    // returns changed
    const eraseIfOpposite = (face: TFace | null, colorA: TFaceColor, colorB: TFaceColor): boolean => {
      if (face && (state.getOppositeFaceColor(colorA) === colorB || state.getOppositeFaceColor(colorB) === colorA)) {
        new EraseFaceOnlyCompleteAction(face).apply(state);
        return true;
      }
      return false;
    };

    // returns changed
    const eraseIfSame = (face: TFace | null, colorA: TFaceColor, colorB: TFaceColor): boolean => {
      if (face && colorA === colorB) {
        new EraseFaceOnlyCompleteAction(face).apply(state);
        return true;
      }
      return false;
    };

    if (this.state !== FaceColorState.UNDECIDED) {
      const isOutside = this.state === FaceColorState.OUTSIDE;
      console.log('absolute', isOutside ? 'outside' : 'inside');

      const finalColor = isOutside ? state.getOutsideColor() : state.getInsideColor();

      for (const face of this.primaryFaces) {
        let currentColor = face ? state.getFaceColor(face) : state.getOutsideColor();
        if (finalColor !== currentColor) {
          eraseIfOpposite(face, currentColor, finalColor);
          currentColor = face ? state.getFaceColor(face) : state.getOutsideColor();

          new FaceColorMakeSameAction(getFaceColorPointer(state, currentColor), {
            type: 'absolute',
            isOutside: isOutside,
          }).apply(state);
        }
      }
    } else if (this.isAbsolute) {
      console.log('absolute erase');
      // erase!!!

      for (const face of this.primaryFaces) {
        if (face) {
          new EraseFaceCompleteAction(face).apply(state);
        }
      }
    } else {
      console.log('normal');

      if (this.primaryFaces.length && this.secondaryFaces.length) {
        const primaryFace = this.primaryFaces[0];
        const secondaryFace = this.secondaryFaces[0];

        let primaryColor = primaryFace ? state.getFaceColor(primaryFace) : state.getOutsideColor();
        let secondaryColor = secondaryFace ? state.getFaceColor(secondaryFace) : state.getOutsideColor();

        eraseIfSame(secondaryFace, primaryColor, secondaryColor);
        primaryColor = primaryFace ? state.getFaceColor(primaryFace) : state.getOutsideColor();
        secondaryColor = secondaryFace ? state.getFaceColor(secondaryFace) : state.getOutsideColor();

        new FaceColorMakeOppositeAction(
          getFaceColorPointer(state, primaryColor),
          getFaceColorPointer(state, secondaryColor),
        ).apply(state);
      }

      const makeSameArray = (faces: (TFace | null)[]) => {
        for (let i = 1; i < faces.length; i++) {
          const faceA = faces[i - 1];
          const faceB = faces[i];

          let colorA = faceA ? state.getFaceColor(faceA) : state.getOutsideColor();
          let colorB = faceB ? state.getFaceColor(faceB) : state.getOutsideColor();

          if (colorA !== colorB) {
            if (eraseIfOpposite(faceB, colorA, colorB)) {
              colorA = faceA ? state.getFaceColor(faceA) : state.getOutsideColor();
              colorB = faceB ? state.getFaceColor(faceB) : state.getOutsideColor();
            }
            new FaceColorMakeSameAction(getFaceColorPointer(state, colorA), getFaceColorPointer(state, colorB)).apply(
              state,
            );
          }
        }
      };
      makeSameArray(this.primaryFaces);
      makeSameArray(this.secondaryFaces);
    }
  }

  public getUndo(state: TCompleteData): TAction<TCompleteData> {
    throw new Error('unimplemented');
  }

  public isEmpty(): boolean {
    return (
      (this.primaryFaces.length === 0 || (this.state === FaceColorState.UNDECIDED && this.primaryFaces.length === 1)) &&
      this.secondaryFaces.length === 0
    );
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'UserFaceDragAction',
      primaryFaces: this.primaryFaces.map((face) => (face ? serializeFace(face) : null)),
      secondaryFaces: this.secondaryFaces.map((face) => (face ? serializeFace(face) : null)),
      isAbsolute: this.isAbsolute,
      state: this.state.name,
      dragIndex: this.dragIndex,
    };
  }

  public static deserializeAction(board: TBoard, serializedAction: TSerializedAction): UserFaceDragAction {
    return new UserFaceDragAction(
      serializedAction.primaryFaces.map((face: TSerializedFace | null) => (face ? deserializeFace(board, face) : null)),
      serializedAction.secondaryFaces.map((face: TSerializedFace | null) =>
        face ? deserializeFace(board, face) : null,
      ),
      serializedAction.isAbsolute,
      FaceColorState.enumeration.getValue(serializedAction.state),
      serializedAction.dragIndex,
    );
  }
}
