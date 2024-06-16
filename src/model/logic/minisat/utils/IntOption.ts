import { IntRange } from './IntRange';
import { Option } from './Option';

export class IntOption extends Option {
  protected range: IntRange;
  protected defaultValue: number;
  protected value: number;

  public constructor(category: string, name: string, description: string, def: number, range: IntRange);
  public constructor(category: string, name: string, description: string, def: number);
  public constructor(category: string, name: string, description: string);
  public constructor(
    category: string,
    name: string,
    description: string,
    def: number = 0,
    range: IntRange = new IntRange(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER),
  ) {
    super(name, description, category, '<int>');
    this.defaultValue = def;
    this.range = range;
    this.value = def;
  }

  public getValue(): number {
    return this.value;
  }

  public setValue(value: number): this {
    this.value = value;
    return this;
  }

  public setDefault(): void {
    this.value = this.defaultValue;
  }

  public parse(str: string): boolean {
    const prefix = `-${this.name}=`;
    if (!str.startsWith(prefix)) {
      return false;
    }
    let tmp: number;
    try {
      tmp = parseInt(str.substring(prefix.length));
    } catch (e) {
      return false;
    }

    if (tmp > this.range.end) {
      const message = `ERROR! value <${str}> is too large for option "${this.name}".`;
      Option.eprintf(message);
      throw new Error(message);
    } else if (tmp < this.range.begin) {
      const message = `ERROR! value <${str}> is too small for option "${this.name}".`;
      Option.eprintf(message);
      throw new Error(message);
    }
    this.value = tmp;
    return true;
  }

  public help(verbose: boolean): void {
    Option.eprintf('  -%-12s = %-8s [', this.name, this.typeName);
    if (this.range.begin === Number.MIN_SAFE_INTEGER) {
      Option.eprintf('imin');
    } else {
      Option.eprintf('%4d', this.range.begin);
    }

    Option.eprintf(' .. ');
    if (this.range.end === Number.MAX_SAFE_INTEGER) {
      Option.eprintf('imax');
    } else {
      Option.eprintf('%4d', this.range.end);
    }

    Option.eprintf('] (default: %d)\n', this.defaultValue);
    if (verbose) {
      Option.eprintf('\n        %s\n', this.description);
      Option.eprintf('\n');
    }
  }
}
