export class Var {
  private static readonly UNDEF_VALUE: number = -1;
  public static readonly UNDEF: Var = new Var(Var.UNDEF_VALUE);
  private static readonly cache: Var[] = [];
  private _value: number;

  private constructor(value: number) {
    this._value = value;
  }

  public equals(obj: Var): boolean {
    return this === obj;
  }

  public value(): number {
    return this._value;
  }

  public static valueOf(value: number): Var {
    if (value === Var.UNDEF_VALUE) {
      return Var.UNDEF;
    }
    while (Var.cache.length <= value) {
      Var.cache.push(new Var(Var.cache.length));
    }
    return Var.cache[value];
  }

  public toString(): string {
    return `Var${this._value}`;
  }
}
