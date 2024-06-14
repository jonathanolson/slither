import { VecIntObject } from '../mtl/VecIntObject';
import { Lit } from './Lit';

export class VecLit extends VecIntObject<Lit> {
  public constructor();
  public constructor(size: number);
  public constructor(size: number, pad: Lit);
  public constructor(...lits: Lit[]);
  public constructor(sizeOrLits?: number | Lit, pad?: Lit) {
    if (typeof sizeOrLits === 'number') {
      if (pad !== undefined) {
        super(sizeOrLits, pad);
      } else {
        super(sizeOrLits);
      }
    } else if (Array.isArray(sizeOrLits)) {
      super();
      for (const e of sizeOrLits) {
        this.push(e);
      }
    } else {
      super();
    }
  }

  public create(value?: number): Lit {
    if (value === undefined) {
      return Lit.UNDEF;
    } else {
      return Lit.valueOf(value);
    }
  }

  public value(variable: Lit): number {
    return variable.value();
  }

  public compare(a: number, b: number): number {
    return a - b;
  }

  public toStringValue(value: number): string {
    return Lit.valueOf(value).toString();
  }
}
