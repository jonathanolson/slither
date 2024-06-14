import { Option } from './Option';

export class BoolOption extends Option {
  protected defaultValue: boolean;
  protected value: boolean;

  public constructor(category: string, name: string, description: string, v: boolean);
  public constructor(category: string, name: string, description: string);
  public constructor(category: string, name: string, description: string, v: boolean = false) {
    super(name, description, category, '<bool>');
    this.defaultValue = v;
    this.value = v;
  }

  public getValue(): boolean {
    return this.value;
  }

  public setValue(b: boolean): this {
    this.value = b;
    return this;
  }

  public setDefault(): void {
    this.value = this.defaultValue;
  }

  public parse(str: string): boolean {
    if (str === '-no-' + this.name) {
      this.value = false;
    } else if (str === '-' + this.name) {
      this.value = true;
    } else {
      return false;
    }
    return true;
  }

  public help(verbose: boolean): void {
    Option.eprintf('  -%s, -no-%s', this.name, this.name);
    for (let i = 0; i < 32 - this.name.length * 2; i++) {
      Option.eprintf(' ');
    }
    Option.eprintf(' ');
    Option.eprintf('(default: %s)\n', this.defaultValue ? 'on' : 'off');
    if (verbose) {
      Option.eprintf('\n        %s\n', this.description);
      Option.eprintf('\n');
    }
  }
}
