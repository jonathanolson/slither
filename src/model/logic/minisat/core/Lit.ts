export class Lit {
  private static readonly UNDEF_VALUE = -2;
  private static readonly ERROR_VALUE = -1;
  private static readonly cache: Lit[] = [];
  private x: number;

  private constructor( x: number ) {
    this.x = x;
  }

  public compareTo( o: Lit ): number {
    return this.x - o.x;
  }

  public equals( obj: Lit ): boolean {
    return this.compareTo( obj ) === 0;
  }

  public static valueOf( x: number ): Lit {
    switch ( x ) {
      case Lit.UNDEF_VALUE:
        return Lit.UNDEF;
      case Lit.ERROR_VALUE:
        return Lit.ERROR;
    }
    for ( let i = Lit.cache.length; i <= x; ++i ) {
      Lit.cache.push( new Lit( i ) );
    }
    return Lit.cache[ x ];
  }

  public static valueOfVar( variable: number, sign: boolean ): Lit {
    if ( variable < 0 ) {
      throw new Error( 'variable' );
    }
    return Lit.valueOf( variable + variable + ( sign ? 1 : 0 ) );
  }

  public not(): Lit {
    return Lit.valueOf( this.x ^ 1 );
  }

  public xor( b: boolean ): Lit {
    return Lit.valueOf( this.x ^ ( b ? 1 : 0 ) );
  }

  public sign(): boolean {
    return ( this.x & 1 ) === 1;
  }

  public var(): number {
    return this.x >>> 1;
  }

  public value(): number {
    return this.x;
  }

  public static readonly UNDEF = new Lit( Lit.UNDEF_VALUE );
  public static readonly ERROR = new Lit( Lit.ERROR_VALUE );

  public toString(): string {
    switch ( this.x ) {
      case Lit.UNDEF_VALUE:
        return 'UNDEF';
      case Lit.ERROR_VALUE:
        return 'ERROR';
    }
    return `Lit(${this.var()}, ${this.sign()})`;
  }
}
