import { TPatternBoard } from './TPatternBoard.ts';
import { computeEmbeddings } from './computeEmbeddings.ts';

export const arePatternBoardsIsomorphic = ( a: TPatternBoard, b: TPatternBoard ): boolean => {
  if (
    a.vertices.length !== b.vertices.length ||
    a.edges.length !== b.edges.length ||
    a.faces.length !== b.faces.length ||
    a.sectors.length !== b.sectors.length ||
    a.vertices.filter( v => v.isExit ).length !== b.vertices.filter( v => v.isExit ).length ||
    a.edges.filter( e => e.isExit ).length !== b.edges.filter( e => e.isExit ).length ||
    a.faces.filter( f => f.isExit ).length !== b.faces.filter( f => f.isExit ).length
  ) {
    return false;
  }

  // TODO: Wouldn't all of these be invertible? Don't need to do this double check?
  return computeEmbeddings( a, b ).length > 0 && computeEmbeddings( b, a ).length > 0;
};