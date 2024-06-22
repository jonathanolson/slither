import { TFaceValueData } from '../../data/face-value/TFaceValueData.ts';
import { TBoard } from './TBoard.ts';

export const getQuickBoardSpanningFaceCount = (board: TBoard, state: TFaceValueData): number => {
  const nonzeroFaces = new Set(
    board.faces.filter((face) => {
      const value = state.getFaceValue(face);

      return value !== null && value !== 0;
    }),
  );

  if (nonzeroFaces.size === 0) {
    return 0;
  }

  // Add the initial face
  const visitedFaces = new Set();
  // TODO: could get the REAL count by doing this for each face, but that would get expensive
  const dirtyFaces = new Set([[...nonzeroFaces][0]]);
  let spanningFaceCount = 0;

  while (dirtyFaces.size) {
    spanningFaceCount += 1;

    const faces = [...dirtyFaces];
    dirtyFaces.clear();

    for (const face of faces) {
      visitedFaces.add(face);
    }

    for (const face of faces) {
      for (const vertex of face.vertices) {
        for (const otherFace of vertex.faces) {
          if (!visitedFaces.has(otherFace)) {
            dirtyFaces.add(otherFace);
          }
        }
      }
    }
  }

  return spanningFaceCount;
};
