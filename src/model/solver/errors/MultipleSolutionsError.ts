import { TEdge } from '../../board/core/TEdge.ts';

export class MultipleSolutionsError extends Error {
  public constructor(
    public readonly solutionEdges: TEdge[][]
  ) {
    super( 'Multiple solutions found' );
  }
}