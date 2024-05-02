import { SolutionAttributeSet } from './SolutionAttributeSet.ts';
import { TablePruner } from './TablePruner.ts';

export class SolutionFormalContext {

  public tablePruner: TablePruner | null = null;

  // TODO: consider trying a THIRD level here?

  public constructor(
    public readonly numAttributes: number,
    public readonly solutionAttributeSets: SolutionAttributeSet[],

    // Whether we are running highlander filtering
    public readonly highlander: boolean,
  ) {

    if ( !this.highlander ) {
      this.tablePruner = new TablePruner( numAttributes, solutionAttributeSets );
    }
  }

  public getClosure( attributeSet: bigint ): bigint {

    // // TODO: we're directly grabbing the data field, decent for performance, OK to have public?
    // for ( const solutionAttributeSet of this.solutionAttributeSets ) {
    //   if ( ( attributeSet.data & solutionAttributeSet.withOptionalData ) === attributeSet.data ) {
    //     // TODO: can we perhaps just OR it with attributeSet.data? Why do we need to filter optionalData? We are... a closure, right?
    //     // TODO: Unclear whether that is correct. This is not too bad, leave it for now for correctness?
    //     closure.data = closure.data & ( solutionAttributeSet.data | ( attributeSet.data & solutionAttributeSet.optionalData ) );
    //   }
    // }

    let solutionAttributeSets = this.solutionAttributeSets;

    if ( this.tablePruner ) {
      solutionAttributeSets = this.tablePruner.getSolutionAttributeSets( attributeSet );
    }

    return SolutionAttributeSet.solutionClosure( this.numAttributes, solutionAttributeSets, attributeSet );
  }
}