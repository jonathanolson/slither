import { Option } from './Option';

export class StringOption extends Option {
  private defaultValue: string | null;
  private value: string | null;

  public constructor( category: string, name: string, description: string, def: string | null );
  public constructor( category: string, name: string, description: string );
  public constructor( category: string, name: string, description: string, def: string | null = null ) {
    super( name, description, category, '<string>' );
    this.defaultValue = def;
    this.value = def;
  }

  public getValue(): string | null {
    return this.value;
  }

  public setValue( x: string ): this {
    this.value = x;
    return this;
  }

  public setDefault(): void {
    this.value = this.defaultValue;
  }

  public parse( str: string ): boolean {
    const prefix = `-${this.name}=`;
    if ( !str.startsWith( prefix ) ) {
      return false;
    }
    this.value = str.substring( prefix.length );
    return true;
  }

  public help( verbose: boolean ): void {
    Option.eprintf( '  -%-12s = %8s', this.name, this.typeName );
    for ( let i = 0; i < 24 - this.name.length - this.typeName.length; i++ ) {
      Option.eprintf( ' ' );
    }
    Option.eprintf( ' ' );
    Option.eprintf( '(default: %s)\n', this.defaultValue );
    if ( verbose ) {
      Option.eprintf( '\n        %s\n', this.description );
      Option.eprintf( '\n' );
    }
  }
}
