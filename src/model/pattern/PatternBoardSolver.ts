import { FormulaSolver } from '../logic/FormulaSolver.ts';
import { TPatternEdge } from './TPatternEdge.ts';
import { TPatternBoard } from './TPatternBoard.ts';
import { TFeature } from './feature/TFeature.ts';
import { Term } from '../logic/Term.ts';
import { getStructuralFeatures } from './feature/getStructuralFeatures.ts';
import { logicNot, logicOr } from '../logic/operations.ts';

export class PatternBoardSolver {
  private readonly solver: FormulaSolver<TPatternEdge> = new FormulaSolver();
  private readonly getFormula: ( edge: TPatternEdge ) => Term<TPatternEdge>;

  public constructor( patternBoard: TPatternBoard ) {
    this.getFormula = ( edge: TPatternEdge ) => new Term<TPatternEdge>( edge, `e${edge.index}` );

    for ( const feature of getStructuralFeatures( patternBoard ) ) {
      this.addFeature( feature );
    }

    // We need to inform it of our one edge
    if ( patternBoard.vertices.length === 0 ) {
      this.solver.addFormula( logicOr( [
        this.getFormula( patternBoard.edges[ 0 ] ),
        logicNot( this.getFormula( patternBoard.edges[ 0 ] ) )
      ] ) );
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

  public static forEachSolution(
    patternBoard: TPatternBoard,
    features: TFeature[],
    callback: ( solution: TPatternEdge[] ) => void
  ): void {
    const solver = new PatternBoardSolver( patternBoard );

    for ( const feature of features ) {
      solver.addFeature( feature );
    }

    while ( true ) {
      // TODO: figure out if we should expose this for debugging (helps)
      // console.log( solver.solver.solver._clauseStrings() );

      const solution = solver.getNextSolution();

      if ( solution ) {
        callback( solution );
      }
      else {
        break;
      }
    }
  }

  public static getSolutions( patternBoard: TPatternBoard, features: TFeature[] ): TPatternEdge[][] {
    const solver = new PatternBoardSolver( patternBoard );

    for ( const feature of features ) {
      solver.addFeature( feature );
    }

    return solver.getRemainingSolutions();
  }

  public static hasSolution( patternBoard: TPatternBoard, features: TFeature[] ): boolean {
    const solver = new PatternBoardSolver( patternBoard );

    for ( const feature of features ) {
      solver.addFeature( feature );
    }

    return solver.getNextSolution() !== null;
  }
}