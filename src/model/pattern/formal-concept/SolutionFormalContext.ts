import { FormalContext } from './FormalContext.ts';
import { SolutionAttributeSet } from './SolutionAttributeSet.ts';
import { AttributeSet } from './AttributeSet.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export class SolutionFormalContext extends FormalContext {
  public constructor(
    numAttributes: number,
    public readonly solutionAttributeSets: SolutionAttributeSet[],
  ) {
    super( numAttributes, solutionAttributeSets );
  }

  public override getClosure( attributeSet: AttributeSet ): AttributeSet {
    assertEnabled() && assert( this.numAttributes === attributeSet.numAttributes );

    let closure = AttributeSet.getFull( this.numAttributes );

    // TODO: we're directly grabbing the data field, decent for performance, OK to have public?
    for ( const solutionAttributeSet of this.solutionAttributeSets ) {
      if ( ( attributeSet.data & solutionAttributeSet.data & solutionAttributeSet.optionalDataComplement ) === attributeSet.data ) {
        // TODO: can we perhaps just OR it with attributeSet.data? Why do we need to filter optionalData? We are... a closure, right?
        // TODO: Unclear whether that is correct. This is not too bad, leave it for now for correctness?
        closure.data = closure.data & ( solutionAttributeSet.data | ( attributeSet.data & solutionAttributeSet.optionalData ) );
      }
    }

    return closure;
  }
}