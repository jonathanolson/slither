import { TPatternEdge } from '../TPatternEdge.ts';
import { Term } from '../../logic/Term.ts';
import { Formula } from '../../logic/Formula.ts';

export interface TFeature {
  isPossibleWith( isEdgeBlack: ( edge: TPatternEdge ) => boolean ): boolean;

  getPossibleFormula( getFormula: ( edge: TPatternEdge ) => Term<TPatternEdge> ): Formula<TPatternEdge>;
}