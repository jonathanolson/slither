import { AttributeSet } from './AttributeSet.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export class SolutionAttributeSet extends AttributeSet {

  public readonly optionalDataComplement: bigint;

  protected constructor(
    numAttributes: number,
    data: bigint,

    // We will be treated as a set of attribute sets, where all permutations of the attributes in this optionalData
    // will either be present or absent. This allows matching red exit edges properly, without undue computation.
    public readonly optionalData: bigint
  ) {
    super( numAttributes, data );

    this.optionalDataComplement = ( 1n << BigInt( numAttributes ) ) - 1n - this.optionalData;

    assertEnabled() && assert( ( data & optionalData ) === 0n );
  }
}