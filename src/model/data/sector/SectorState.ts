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

  public isSubsetOf( other: SectorState ): boolean {
    return ( !this.zero || other.zero ) && ( !this.one || other.one ) && ( !this.two || other.two );
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

  public static deserialize( value: TSerializedSectorState ): SectorState {
    const sectorState = sectorStateMap.get( value );
    assertEnabled() && assert( sectorState, `invalid serialized value: ${value}` );

    return sectorState!;
  }
}

export type TSerializedSectorState = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

const sectorStateMap = new Map<TSerializedSectorState, SectorState>( SectorState.enumeration.values.map( ( value: SectorState ) => [ value.serializedValue, value ] ) );
