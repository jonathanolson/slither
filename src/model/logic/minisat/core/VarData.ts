import { Clause } from './Clause';

export class VarData {
  public reason: Clause;
  public level: number;

  private constructor(reason: Clause, level: number) {
    this.reason = reason;
    this.level = level;
  }

  public equals(obj: VarData): boolean {
    return this === obj;
  }

  public static mkVarData(cr: Clause, l: number): VarData {
    return new VarData(cr, l);
  }
}
