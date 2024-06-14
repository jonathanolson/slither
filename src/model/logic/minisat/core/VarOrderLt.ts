import { VecNumber } from '../mtl/VecNumber';

export class VarOrderLt {
  public readonly activity: VecNumber;

  public constructor(act: VecNumber) {
    this.activity = act;
  }

  public call(x: number, y: number): boolean {
    return this.activity.get(x) > this.activity.get(y);
  }
}
