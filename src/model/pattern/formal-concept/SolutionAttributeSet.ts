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
    public readonly optionalData: bigint,

    // Bit-pairs for each edge.
    // Non-exit edges: 0x1 for red, 0x2 for black
    // Exit edges: 0x1 for hard-red, 0x2 for black, 0x3 for red-or-double-black (e.g. solution has NO black edges on the exit vertex, so exit edge could be double-black)
    public readonly edgeHighlanderCode: bigint,
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

    const optionalString = `OPT: [${_.range( 0, this.numAttributes ).map( i => this.hasOptionalAttribute( i ) ? '1' : '0' ).join( '' )} (${this.getOptionalAttributes().join( ',' )})`;

    const edgeHighlanderCodeString = this.edgeHighlanderCode !== 0n ? `high-ts2: ${this.edgeHighlanderCode.toString( 2 )}` : '';

    // TODO: provide a mapping, so we can log what information is included
    return `${super.toString()} ${optionalString} ${edgeHighlanderCodeString})`;
  }

  public static fromSolutionBinary( numAttributes: number, data: bigint, optionalData: bigint, edgeHighlanderCode: bigint ): SolutionAttributeSet {
    return new SolutionAttributeSet( numAttributes, data, optionalData, edgeHighlanderCode );
  }
}