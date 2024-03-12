import { Enumeration, EnumerationValue } from 'phet-lib/phet-core';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export default class SectorState extends EnumerationValue {

  public constructor(
    public readonly zero: boolean,
    public readonly one: boolean,
    public readonly two: boolean,
    public readonly serializedValue: TSerializedSectorState
  ) {
    super();
  }

  public allows( n: number ): boolean {
    assertEnabled() && assert( n === 0 || n === 1 || n === 2 );

    return ( n === 0 && this.zero ) || ( n === 1 && this.one ) || ( n === 2 && this.two );
  }

  public isSubsetOf( other: SectorState ): boolean {
    return ( !this.zero || other.zero ) && ( !this.one || other.one ) && ( !this.two || other.two );
  }

  public withZero( zero: boolean ): SectorState {
    return SectorState.getWithValue( zero, this.one, this.two );
  }

  public withOne( one: boolean ): SectorState {
    return SectorState.getWithValue( this.zero, one, this.two );
  }

  public withTwo( two: boolean ): SectorState {
    return SectorState.getWithValue( this.zero, this.one, two );
  }

  public withAllowZero(): SectorState {
    return this.withZero( true );
  }

  public withAllowOne(): SectorState {
    return this.withOne( true );
  }

  public withAllowTwo(): SectorState {
    return this.withTwo( true );
  }

  public withDisallowZero(): SectorState {
    return this.withZero( false );
  }

  public withDisallowOne(): SectorState {
    return this.withOne( false );
  }

  public withDisallowTwo(): SectorState {
    return this.withTwo( false );
  }

  public serialize(): TSerializedSectorState {
    return this.serializedValue;
  }

  // This is effectively an error state
  public static readonly NONE = new SectorState( false, false, false, 0 );

  public static readonly ONLY_ZERO = new SectorState( true, false, false, 1 );
  public static readonly ONLY_ONE = new SectorState( false, true, false, 2 );
  public static readonly ONLY_TWO = new SectorState( false, false, true, 3 );

  public static readonly NOT_ZERO = new SectorState( false, true, true, 4 );
  public static readonly NOT_ONE = new SectorState( true, false, true, 5 );
  public static readonly NOT_TWO = new SectorState( true, true, false, 6 );

  public static readonly ANY = new SectorState( true, true, true, 7 );

  public static readonly enumeration = new Enumeration( SectorState );

  public static getWithValue( zero: boolean, one: boolean, two: boolean ): SectorState {
    return SectorState.enumeration.values.find( value => value.zero === zero && value.one === one && value.two === two )!;
  }

  public static getOnly( n: number ): SectorState {
    assertEnabled() && assert( n === 0 || n === 1 || n === 2 );

    return SectorState.getWithValue( n === 0, n === 1, n === 2 );
  }

  public static getNot( n: number ): SectorState {
    assertEnabled() && assert( n === 0 || n === 1 || n === 2 );

    return SectorState.getWithValue( n !== 0, n !== 1, n !== 2 );
  }

  public static deserialize( value: TSerializedSectorState ): SectorState {
    const sectorState = sectorStateMap.get( value );
    assertEnabled() && assert( sectorState, `invalid serialized value: ${value}` );

    return sectorState!;
  }

  public static trivialStates = [
    SectorState.NONE,
    SectorState.ONLY_ZERO,
    SectorState.ONLY_TWO,
    SectorState.ANY
  ];
}

export type TSerializedSectorState = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

const sectorStateMap = new Map<TSerializedSectorState, SectorState>( SectorState.enumeration.values.map( ( value: SectorState ) => [ value.serializedValue, value ] ) );
