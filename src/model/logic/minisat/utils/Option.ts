import { Vec } from '../mtl/Vec';

export abstract class Option {
  protected name: string;
  protected description: string;
  protected category: string;
  protected typeName: string;
  private static options: Vec<Option> = new Vec<Option>();
  private static usageStr: string;
  private static helpPrefixStr = '';

  public equals( t: Option ): boolean {
    return this.name === t.name;
  }

  public static getOptionList(): Vec<Option> {
    return this.options;
  }

  public static getUsageString(): string {
    return this.usageStr;
  }

  public static getHelpPrefixString(): string {
    return this.helpPrefixStr;
  }

  /** Clear all registered options */
  public static clear(): void {
    this.options.clear();
  }

  private static compareOptions( o1: Option, o2: Option ): number {
    let r = o1.category.localeCompare( o2.category );
    if ( r !== 0 ) {
      return r;
    }
    return o1.typeName.localeCompare( o2.typeName );
  }

  public constructor( name: string, description: string, category: string, typeName: string ) {
    this.name = name;
    this.description = description;
    this.category = category;
    this.typeName = typeName;
    Option.getOptionList().push( this );
  }

  public abstract parse( str: string ): boolean;

  public abstract help( verbose: boolean ): void;

  public helpDefault(): void {
    this.help( false );
  }

  public abstract setDefault(): void;

  public static parseOptions( args: string[], strict: boolean ): string[] {
    let opts = this.getOptionList();
    for ( let i = 0; i < opts.size(); ++i ) {
      opts.get( i ).setDefault();
    }

    let i: number, j: number;
    for ( i = j = 0; i < args.length; i++ ) {
      let str = args[ i ];
      let prefix = '--' + this.getHelpPrefixString() + 'help';
      if ( str.startsWith( prefix ) ) {
        if ( str.length === prefix.length ) {
          this.printUsageAndExit( args, false );
        }
        else if ( str.startsWith( prefix + '-verb' ) ) {
          this.printUsageAndExit( args, true );
        }
      }
      else {
        let parsedOk = false;
        for ( let k = 0, size = opts.size(); !parsedOk && k < size; k++ ) {
          parsedOk = opts.get( k ).parse( args[ i ] );
        }
        if ( !parsedOk ) {
          if ( strict && args[ i ].startsWith( '-' ) ) {
            let message = `ERROR! Unknown flag "${args[ i ]}". Use '--${this.getHelpPrefixString()}help' for help.`;
            this.eprintf( message );
            throw new Error( message );
          }
          else {
            args[ j++ ] = args[ i ];
          }
        }
      }
    }
    return args.slice( 0, args.length - i + j );
  }

  public static setUsageHelp( str: string ): void {
    this.usageStr = str;
  }

  public static setHelpPrefixStr( str: string ): void {
    this.helpPrefixStr = str;
  }

  public static printUsageAndExit( argv: string[], verbose: boolean ): void {
    let usage = this.getUsageString();
    if ( usage ) {
      this.eprintf( usage, argv[ 0 ] );
    }

    let opts = this.getOptionList();
    opts.sort( this.compareOptions );

    let prevCat: string | null = null;
    let prevType: string | null = null;

    for ( let i = 0, size = opts.size(); i < size; i++ ) {
      let opt = opts.get( i );
      let cat = opt.category;
      let type = opt.typeName;
      if ( cat !== prevCat ) {
        this.eprintf( `\n${cat} OPTIONS:\n\n` );
      }
      else if ( type !== prevType ) {
        this.eprintf( `\n` );
      }
      opt.help( verbose );
      prevCat = cat;
      prevType = type;
    }

    this.eprintf( `\nHELP OPTIONS:\n\n` );
    this.eprintf( `  --${this.getHelpPrefixString()}help        Print help message.\n` );
    this.eprintf( `  --${this.getHelpPrefixString()}help-verb   Print verbose help message.\n` );
    this.eprintf( `\n` );
    throw new Error();
  }

  protected static eprintf( format: string, ...args: any[] ): void {
    console.error( format, ...args );
  }
}
