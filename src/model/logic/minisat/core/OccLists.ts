import { Vec } from '../mtl/Vec';
import { VecNumber } from '../mtl/VecNumber';
import { Lit } from './Lit';
import { VecLit } from './VecLit';
import { Watcher } from './Watcher';

export class OccLists {
  private occs: Vec<Vec<Watcher>> = new Vec<Vec<Watcher>>();
  private dirty: VecNumber = new VecNumber();
  private dirties: VecLit = new VecLit();

  public constructor() {}

  public init(idx: Lit): void {
    const size = idx.value() + 1;
    for (let i = this.occs.size(); i < size; ++i) {
      this.occs.push(new Vec<Watcher>());
    }
    this.dirty.growTo(size, 0);
  }

  public get(idx: Lit): Vec<Watcher> {
    return this.occs.get(idx.value());
  }

  public set(idx: Lit, element: Vec<Watcher>): Vec<Watcher> {
    return this.occs.set(idx.value(), element);
  }

  public lookup(idx: Lit): Vec<Watcher> {
    if (this.dirty.get(idx.value()) !== 0) {
      this.clean(idx);
    }
    return this.occs.get(idx.value());
  }

  public smudge(idx: Lit): void {
    if (this.dirty.get(idx.value()) === 0) {
      this.dirty.set(idx.value(), 1);
      this.dirties.push(idx);
    }
  }

  public clear(): void {
    this.occs.clear();
    this.dirty.clear();
    this.dirties.clear();
  }

  public cleanAll(): void {
    for (let i = 0; i < this.dirties.size(); i++) {
      if (this.dirty.get(this.dirties.get(i).value()) !== 0) {
        this.clean(this.dirties.get(i));
      }
    }
    this.dirties.clear();
  }

  private deleted(w: Watcher): boolean {
    return w.cref.mark() === 1;
  }

  public clean(idx: Lit): void {
    const vec = this.occs.get(idx.value());
    let i = 0,
      j = 0;
    for (i = 0; i < vec.size(); i++) {
      if (!this.deleted(vec.get(i))) {
        vec.set(j++, vec.get(i));
      }
    }
    vec.shrink(i - j);
    this.dirty.set(idx.value(), 0);
  }

  public toString(): string {
    return `OccLists(occs=${this.occs}, dirty=${this.dirty}, dirties=${this.dirties})`;
  }
}
