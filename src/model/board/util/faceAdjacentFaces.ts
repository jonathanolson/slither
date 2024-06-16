import { TFace } from '../core/TFace.ts';


// TODO: use this more
export const faceAdjacentFaces = (face: TFace): TFace[] => {
  const adjacentFaces: TFace[] = [];
  for (const edge of face.edges) {
    const otherFace = edge.getOtherFace(face);
    if (otherFace) {
      adjacentFaces.push(otherFace);
    }
  }
  return adjacentFaces;
};
