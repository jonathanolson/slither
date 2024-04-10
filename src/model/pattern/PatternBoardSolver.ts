import { FormulaSolver } from '../logic/FormulaSolver.ts';
import { TPatternEdge } from './TPatternEdge.ts';
import { TPatternBoard } from './TPatternBoard.ts';
import { TFeature } from './feature/TFeature.ts';
import { Term } from '../logic/Term.ts';
import { getStructuralFeatures } from './feature/getStructuralFeatures.ts';

export class PatternBoardSolver {
  private readonly solver: FormulaSolver<TPatternEdge> = new FormulaSolver();
  private readonly getFormula: ( edge: TPatternEdge ) => Term<TPatternEdge>;

  public constructor( patternBoard: TPatternBoard ) {
    this.getFormula = ( edge: TPatternEdge ) => new Term<TPatternEdge>( edge, `e${edge.index}` );

    for ( const feature of getStructuralFeatures( patternBoard ) ) {
      this.addFeature( feature );
    }
  }

  public addFeature( feature: TFeature ): void {
    this.solver.addFormula( feature.getPossibleFormula( this.getFormula ) );
  }

  public getNextSolution(): TPatternEdge[] | null {
    return this.solver.getNextSolution();
  }

  public getRemainingSolutions(): TPatternEdge[][] {
    const result: TPatternEdge[][] = [];

    while ( true ) {
      const solution = this.getNextSolution();

      if ( solution ) {
        result.push( solution );
      }
      else {
        break;
      }
    }

    return result;
  }
}