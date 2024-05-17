import { VecIntObject } from '../mtl/VecIntObject';
import { Var } from './Var';

export class VecVar extends VecIntObject<Var> {

  public constructor();
  public constructor( size: number );
  public constructor( size: number, pad: Var );
  public constructor( size?: number, pad?: Var ) {
    if ( typeof size === 'number' ) {
      if ( pad !== undefined ) {
        super( size, pad );
      }
      else {
        super( size );
      }
    }
    else {
      super();
    }
  }

  public create( value?: number ): Var {
    if ( value === undefined ) {
      return Var.UNDEF;
    }
    else {
      return Var.valueOf( value );
    }
  }

  public value( variable: Var ): number {
    return variable.value();
  }

  public compare( a: number, b: number ): number {
    return a - b;
  }

  public toStringValue( value: number ): string {
    return `Var${value}`;
  }
}
