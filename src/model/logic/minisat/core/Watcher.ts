import { Clause } from './Clause';
import { Lit } from './Lit';

export class Watcher {
  public cref: Clause;
  public blocker: Lit;

  public constructor( cr: Clause, p: Lit ) {
    this.cref = cr;
    this.blocker = p;
  }

  public equals( obj: Watcher ): boolean {
    if ( !( obj instanceof Watcher ) ) {
      return false;
    }
    const o = obj as Watcher;
    return this.cref.equals( o.cref );
  }

  public toString(): string {
    return `Watcher(${this.cref}, ${this.blocker})`;
  }
}
