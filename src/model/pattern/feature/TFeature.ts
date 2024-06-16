import { Formula } from '../../logic/Formula.ts';
import { Term } from '../../logic/Term.ts';
import { TPatternEdge } from '../pattern-board/TPatternEdge.ts';

export interface TFeature {
  isPossibleWith(isEdgeBlack: (edge: TPatternEdge) => boolean): boolean;

  getPossibleFormula(getFormula: (edge: TPatternEdge) => Term<TPatternEdge>): Formula<TPatternEdge>;
}
