import { TFeature } from './TFeature.ts';
import { TPatternVertex } from '../pattern-board/TPatternVertex.ts';
import { TPatternEdge } from '../pattern-board/TPatternEdge.ts';
import { Term } from '../../logic/Term.ts';
import { Formula } from '../../logic/Formula.ts';
import { logicZeroOrTwo } from '../../logic/operations.ts';

// Either 0 or 2 edges connected to a vertex will be black.
export class VertexFeature implements TFeature {
  public constructor(public readonly vertex: TPatternVertex) {}

  public isPossibleWith(isEdgeBlack: (edge: TPatternEdge) => boolean): boolean {
    const blackCount = this.vertex.edges.filter((edge) => isEdgeBlack(edge)).length;
    return blackCount === 0 || blackCount === 2;
  }

  public getPossibleFormula(getFormula: (edge: TPatternEdge) => Term<TPatternEdge>): Formula<TPatternEdge> {
    return logicZeroOrTwo(this.vertex.edges.map((edge) => getFormula(edge)));
  }
}
