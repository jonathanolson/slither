import { AttributeSet } from './AttributeSet.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import _ from '../../../workarounds/_.ts';

export class SolutionAttributeSet extends AttributeSet {

  public readonly optionalDataComplement: bigint;
  public readonly withOptionalData: bigint;

  protected constructor(
    numAttributes: number,
    data: bigint,

    // We will be treated as a set of attribute sets, where all permutations of the attributes in this optionalData
    // will either be present or absent. This allows matching red exit edges properly, without undue computation.
    public readonly optionalData: bigint
  ) {
    super( numAttributes, data );

    this.optionalDataComplement = ( 1n << BigInt( numAttributes ) ) - 1n - this.optionalData;
    this.withOptionalData = data | this.optionalData;

    assertEnabled() && assert( ( data & optionalData ) === 0n );
  }

  public hasOptionalAttribute( i: number ): boolean {
    return ( this.optionalData & ( 1n << BigInt( i ) ) ) !== 0n;
  }

  public getOptionalAttributes(): number[] {
    const attributes: number[] = [];

    for ( let i = 0; i < this.numAttributes; i++ ) {
      if ( this.hasOptionalAttribute( i ) ) {
        attributes.push( i );
      }
    }

    return attributes;
  }

  public override toString(): string {
    // TODO: provide a mapping, so we can log what information is included
    return `${super.toString()} OPT: [${_.range( 0, this.numAttributes ).map( i => this.hasOptionalAttribute( i ) ? '1' : '0' ).join( '' )} (${this.getOptionalAttributes().join( ',' )})`;
  }

  public static fromSolutionBinary( numAttributes: number, data: bigint, optionalData: bigint ): SolutionAttributeSet {
    return new SolutionAttributeSet( numAttributes, data, optionalData );
  }
}