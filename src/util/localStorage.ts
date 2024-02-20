import { Property } from "phet-lib/axon";
import { EnumerationValue } from "phet-lib/phet-core";

export type LocalStoragePropertyOptions<T> = {
  serialize: ( value: T ) => string;
  deserialize: ( value: string | null ) => T;
};

export class LocalStorageProperty<T> extends Property<T> {
  public constructor( key: string, options: LocalStoragePropertyOptions<T> ) {
    super( options.deserialize( localStorage.getItem( key ) ) );

    this.link( value => {
      const serialization = options.serialize( value );
      if ( localStorage.getItem( key ) !== serialization ) {
        localStorage.setItem( key, options.serialize( value ) );
      }
    } );
  }
}

export class LocalStorageBooleanProperty extends LocalStorageProperty<boolean> {
  public constructor( key: string, defaultValue: boolean ) {
    super( key, {
      serialize: value => value.toString(),
      deserialize: value => ( value === 'true' || value === 'false' ) ? value === 'true' : defaultValue
    } );
  }
}

export class LocalStorageEnumerationProperty<T extends EnumerationValue> extends LocalStorageProperty<T> {
  public constructor(
    key: string,
    defaultValue: T
  ) {
    super( key, {
      serialize: value => value.name,
      deserialize: value => value ? defaultValue.enumeration.getValue( value ) || defaultValue : defaultValue
    } );
  }
}