import { Option } from './Option';
import { DoubleRange } from './DoubleRange';

export class DoubleOption extends Option {
  private range: DoubleRange;
  private defaultValue: number;
  private value: number;

  public constructor(category: string, name: string, description: string, def: number, range: DoubleRange);
  public constructor(category: string, name: string, description: string, def: number);
  public constructor(category: string, name: string, description: string);
  public constructor(
    category: string,
    name: string,
    description: string,
    def: number = 0,
    range: DoubleRange = new DoubleRange(Number.MIN_VALUE, false, Number.MAX_VALUE, false),
  ) {
    super(name, description, category, '<double>');
    this.defaultValue = def;
    this.range = range;
    this.value = def;
  }

  public getValue(): number {
    return this.value;
  }

  public setValue(x: number): this {
    this.value = x;
    return this;
  }

  public setDefault(): void {
    this.value = this.defaultValue;
  }

  public parse(str: string): boolean {
    let prefix = '-' + this.name + '=';
    if (!str.startsWith(prefix)) {
      return false;
    }
    let tmp: number;
    try {
      tmp = parseFloat(str.substring(prefix.length));
    } catch (e) {
      return false;
    }

    if (tmp >= this.range.end && (!this.range.endInclusive || tmp !== this.range.end)) {
      let message = `ERROR! value <${str}> is too large for option "${this.name}".`;
      Option.eprintf(message);
      throw new Error(message);
    } else if (tmp <= this.range.begin && (!this.range.beginInclusive || tmp !== this.range.begin)) {
      let message = `ERROR! value <${str}> is too small for option "${this.name}".`;
      Option.eprintf(message);
      throw new Error(message);
    }
    this.value = tmp;
    return true;
  }

  public help(verbose: boolean): void {
    Option.eprintf(
      '  -%-12s = %-8s %c%4.2f .. %4.2f%c (default: %g)\n',
      this.name,
      this.typeName,
      this.range.beginInclusive ? '[' : '(',
      this.range.begin,
      this.range.end,
      this.range.endInclusive ? ']' : ')',
      this.defaultValue,
    );
    if (verbose) {
      Option.eprintf('\n        %s\n', this.description);
      Option.eprintf('\n');
    }
  }
}
