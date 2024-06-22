import { TFaceValueData } from '../../data/face-value/TFaceValueData.ts';
import { TBoard } from './TBoard.ts';
import { TFace } from './TFace.ts';

// Checks to see if various pattern matching with faces are valid.
export const hasNonzeroSeparateFace = (board: TBoard, state: TFaceValueData, faceSet: Set<TFace>): boolean => {
  for (const face of board.faces) {
    if (faceSet.has(face)) {
      continue;
    }

    const faceValue = state.getFaceValue(face);
    if (faceValue === 0 || faceValue === null) {
      continue;
    }

    for (const edge of face.edges) {
      const otherFace = edge.getOtherFace(face);
      if (!otherFace || faceSet.has(otherFace)) {
        continue;
      }
    }

    return true;
  }

  return false;
};
