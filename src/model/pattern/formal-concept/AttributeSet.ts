import _ from '../../../workarounds/_.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export class AttributeSet {
  protected constructor(
    public readonly numAttributes: number,

    // Note: We are going to store features in a bitwise order so we can use the usual < and > operators.
    // This means we're reversing index order conventions from classical FCA
    public data: bigint
  ) {}

  // Mutable

  public or( other: AttributeSet ): void {
    assertEnabled() && assert( this.numAttributes === other.numAttributes );

    this.data = this.data | other.data;
  }

  public and( other: AttributeSet ): void {
    assertEnabled() && assert( this.numAttributes === other.numAttributes );

    this.data = this.data & other.data;
  }

  public not(): void {
    this.data = ( 1n << BigInt( this.numAttributes ) ) - 1n - this.data;
  }

  public set( i: number ): void {
    assertEnabled() && assert( i < this.numAttributes && i >= 0 );

    this.data |= 1n << BigInt( i );
  }

  public clear( i: number ): void {
    this.data &= ~( 1n << BigInt( i ) );
  }

  // Immutable

  public isLessThan( other: AttributeSet ): boolean {
    assertEnabled() && assert( this.numAttributes === other.numAttributes );

    return this.data < other.data;
  }

  public isLessThanOrEqual( other: AttributeSet ): boolean {
    assertEnabled() && assert( this.numAttributes === other.numAttributes );

    return this.data <= other.data;
  }

  public isLessThanI( other: AttributeSet, i: number ): boolean {
    assertEnabled() && assert( this.numAttributes === other.numAttributes );

    // TODO: make more efficient!

    if ( !other.hasAttribute( i ) || this.hasAttribute( i ) ) {
      return false;
    }

    const mask = ~( ( 1n << BigInt( i + 1 ) ) - 1n );

    const highBits = this.data & mask;
    const otherHighBits = other.data & mask;

    return highBits === otherHighBits;
  }

  public union( other: AttributeSet ): AttributeSet {
    assertEnabled() && assert( this.numAttributes === other.numAttributes );

    return new AttributeSet( this.numAttributes, this.data | other.data );
  }

  public intersection( other: AttributeSet ): AttributeSet {
    assertEnabled() && assert( this.numAttributes === other.numAttributes );

    return new AttributeSet( this.numAttributes, this.data & other.data );
  }

  public complement(): AttributeSet {
    return new AttributeSet( this.numAttributes, ( 1n << BigInt( this.numAttributes ) ) - 1n - this.data );
  }

  public clone(): AttributeSet {
    return new AttributeSet( this.numAttributes, this.data );
  }

  public equals( other: AttributeSet ): boolean {
    return this.data === other.data;
  }

  public isSubsetOf( other: AttributeSet ): boolean {
    return ( this.data & other.data ) === this.data;
  }

  public isProperSubsetOf( other: AttributeSet ): boolean {
    return this.isSubsetOf( other ) && !this.equals( other );
  }

  public isEmpty(): boolean {
    return this.data === 0n;
  }

  public getCardinality(): number {
    let count = 0n;

    let data = this.data;
    while ( data ) {
      count += data & 1n;
      data >>= 1n;
    }

    return Number( count );
  }

  public withAttribute( i: number ): AttributeSet {
    return new AttributeSet( this.numAttributes, this.data | ( 1n << BigInt( i ) ) );
  }

  public withLowestBitSet( i: number ): AttributeSet {
    return new AttributeSet( this.numAttributes, ( this.data & ~( ( 1n << BigInt( i ) ) - 1n ) ) | ( 1n << BigInt( i ) ) );
  }

  public hasAttribute( i: number ): boolean {
    return ( this.data & ( 1n << BigInt( i ) ) ) !== 0n;
  }

  public getAttributes(): number[] {
    const attributes: number[] = [];

    for ( let i = 0; i < this.numAttributes; i++ ) {
      if ( this.hasAttribute( i ) ) {
        attributes.push( i );
      }
    }

    return attributes;
  }

  public toString(): string {
    // TODO: potentially reverse these! How do we handle the display?
    return `[${_.range( 0, this.numAttributes ).map( i => this.hasAttribute( i ) ? '1' : '0' ).join( '' )} (${this.getAttributes().join( ',' )}) #${this.numAttributes}]`;
  }

  public static getEmpty( numAttributes: number ): AttributeSet {
    return new AttributeSet( numAttributes, 0n );
  }

  public static getFull( numAttributes: number ): AttributeSet {
    return new AttributeSet( numAttributes, ( 1n << BigInt( numAttributes ) ) - 1n );
  }

  public static fromBinary( numAttributes: number, data: bigint ): AttributeSet {
    assertEnabled() && assert( data < ( 1n << BigInt( numAttributes ) ) && data >= 0n );

    return new AttributeSet( numAttributes, data );
  }

  public static fromCallback( numAttributes: number, callback: ( i: number ) => boolean ): AttributeSet {
    let data = 0n;

    for ( let i = 0; i < numAttributes; i++ ) {
      if ( callback( i ) ) {
        data |= 1n << BigInt( i );
      }
    }

    return new AttributeSet( numAttributes, data );
  }
}