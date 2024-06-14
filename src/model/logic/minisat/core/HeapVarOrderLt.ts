import { VarOrderLt } from './VarOrderLt';
import { VecNumber } from '../mtl/VecNumber';

export class HeapVarOrderLt {
  private lt: VarOrderLt;
  private heap: VecNumber = new VecNumber();
  private indices: VecNumber = new VecNumber();

  private static left(i: number): number {
    return i * 2 + 1;
  }

  private static right(i: number): number {
    return (i + 1) * 2;
  }

  private static parent(i: number): number {
    return (i - 1) >> 1;
  }

  private percolateUp(i: number): void {
    const x = this.heap.get(i);
    let p = HeapVarOrderLt.parent(i);

    while (i !== 0 && this.lt.call(x, this.heap.get(p))) {
      this.heap.set(i, this.heap.get(p));
      this.indices.set(this.heap.get(p), i);
      i = p;
      p = HeapVarOrderLt.parent(p);
    }
    this.heap.set(i, x);
    this.indices.set(x, i);
  }

  private percolateDown(i: number): void {
    const x = this.heap.get(i);
    while (HeapVarOrderLt.left(i) < this.heap.size()) {
      const left = HeapVarOrderLt.left(i);
      const right = HeapVarOrderLt.right(i);
      const child = right < this.heap.size() && this.lt.call(this.heap.get(right), this.heap.get(left)) ? right : left;
      if (!this.lt.call(this.heap.get(child), x)) {
        break;
      }
      this.heap.set(i, this.heap.get(child));
      this.indices.set(this.heap.get(i), i);
      i = child;
    }
    this.heap.set(i, x);
    this.indices.set(x, i);
  }

  public constructor(lt: VarOrderLt) {
    this.lt = lt;
  }

  public size(): number {
    return this.heap.size();
  }

  public empty(): boolean {
    return this.heap.size() === 0;
  }

  public inHeap(n: number): boolean {
    return n < this.indices.size() && this.indices.get(n) >= 0;
  }

  public get(index: number): number {
    if (index >= this.heap.size()) {
      throw new Error('IndexOutOfBoundsException: index');
    }
    return this.heap.get(index);
  }

  public decrease(n: number): void {
    if (!this.inHeap(n)) {
      throw new Error('IllegalArgumentException: n');
    }
    this.percolateUp(this.indices.get(n));
  }

  public increase(n: number): void {
    if (!this.inHeap(n)) {
      throw new Error('IllegalArgumentException: n');
    }
    this.percolateDown(this.indices.get(n));
  }

  public update(n: number): void {
    if (!this.inHeap(n)) {
      this.insert(n);
    } else {
      this.percolateUp(this.indices.get(n));
      this.percolateDown(this.indices.get(n));
    }
  }

  public insert(n: number): void {
    this.indices.growTo(n + 1, -1);
    if (this.inHeap(n)) {
      throw new Error('IllegalArgumentException: n');
    }
    this.indices.set(n, this.heap.size());
    this.heap.push(n);
    this.percolateUp(this.indices.get(n));
  }

  public removeMin(): number {
    const x = this.heap.get(0);
    this.heap.set(0, this.heap.last());
    this.indices.set(this.heap.get(0), 0);
    this.indices.set(x, -1);
    this.heap.pop();
    if (this.heap.size() > 1) {
      this.percolateDown(0);
    }
    return x;
  }

  public build(ns: VecNumber): void {
    for (let i = 0; i < this.heap.size(); i++) {
      this.indices.set(this.heap.get(i), -1);
    }
    this.heap.clear();
    for (let i = 0; i < ns.size(); i++) {
      this.indices.set(ns.get(i), i);
      this.heap.push(ns.get(i));
    }
    for (let i = this.heap.size() / 2 - 1; i >= 0; i--) {
      this.percolateDown(i);
    }
  }

  public clear(): void {
    for (let i = 0; i < this.heap.size(); i++) {
      this.indices.set(this.heap.get(i), -1);
    }
    this.heap.clear();
  }
}
