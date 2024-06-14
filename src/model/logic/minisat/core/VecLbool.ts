import { VecIntObject } from '../mtl/VecIntObject';
import { Lbool } from './Lbool';

export class VecLbool extends VecIntObject<Lbool> {
  public constructor();
  public constructor(size: number);
  public constructor(size: number, pad: Lbool);
  public constructor(size?: number, pad?: Lbool) {
    if (typeof size === 'number') {
      if (pad !== undefined) {
        super(size, pad);
      } else {
        super(size);
      }
    } else {
      super();
    }
  }

  public create(value?: number): Lbool {
    if (value === undefined) {
      return Lbool.UNDEF;
    } else {
      return Lbool.valueOf(value);
    }
  }

  public value(variable: Lbool): number {
    return variable;
  }

  public compare(a: number, b: number): number {
    return a - b;
  }

  public toStringValue(value: number): string {
    return Lbool[value].toString();
  }
}
