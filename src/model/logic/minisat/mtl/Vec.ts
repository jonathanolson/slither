// TODO: handle if we need equals on numbers
export class Vec<T extends { equals(t: T): boolean }> implements Iterable<T> {
  private data: T[] | null = null;
  private sz: number = 0;

  public static imax(x: number, y: number): number {
    const mask = (y - x) >> (4 * 8 - 1);
    return (x & mask) + (y & ~mask);
  }

  public equals(t: Vec<T>): boolean {
    return this === t;
    // // TODO: should I see if we do instance equality here?
    // if ( this.sz !== t.sz ) {
    //   return false;
    // }
    // for ( let i = 0; i < this.sz; ++i ) {
    //   if ( !this.data![ i ].equals( t.data![ i ] ) ) {
    //     return false;
    //   }
    // }
    // return true;
  }

  public constructor();
  public constructor(size: number);
  public constructor(size: number, pad: T);
  public constructor(size?: number, pad?: T) {
    if (size !== undefined && pad !== undefined) {
      this.growTo(size, pad);
    } else if (size !== undefined) {
      this.growTo(size);
    }
  }

  public size(): number {
    return this.sz;
  }

  public shrink(nelems: number): void {
    if (nelems > this.sz) {
      throw new Error('nelems');
    }
    for (let i = 0; i < nelems; ++i) {
      this.data![--this.sz] = null as any;
    }
  }

  public shrink_(nelems: number): void {
    if (nelems > this.sz) {
      throw new Error('nelems');
    }
    this.sz -= nelems;
  }

  public push(): void;
  public push(elem: T): void;
  public push(elem?: T): void {
    if (this.sz === this.capacity) {
      this.capacity = this.sz + 1;
    }
    this.data![this.sz++] = elem === undefined ? (null as any) : elem;
  }

  public pop(): void {
    if (this.sz <= 0) {
      throw new Error('Index out of bounds');
    }
    this.sz--;
  }

  public last(): T {
    return this.data![this.sz - 1];
  }

  public get(index: number): T {
    return this.data![index];
  }

  public set(index: number, elem: T): T {
    return (this.data![index] = elem);
  }

  public copyTo(copy: Vec<T>): void {
    copy.clear();
    copy.growTo(this.sz);
    if (this.sz <= 0) {
      return;
    }
    this.data!.slice(0, this.sz).forEach((val, idx) => (copy.data![idx] = val));
  }

  public moveTo(dest: Vec<T>): void {
    dest.clear(true);
    dest.data = this.data;
    dest.sz = this.sz;
    this.data = null;
    this.sz = 0;
  }

  public get capacity(): number {
    return this.data === null ? 0 : this.data.length;
  }

  public set capacity(min_cap: number) {
    const cap = this.capacity;
    if (cap >= min_cap) {
      return;
    }
    const add = Vec.imax((min_cap - cap + 1) & ~1, ((cap >> 1) + 2) & ~1);
    const newData: T[] = new Array(cap + add) as T[];
    if (this.data !== null) {
      this.data.slice(0, this.sz).forEach((val, idx) => (newData[idx] = val));
    }
    this.data = newData;
  }

  public growTo(size: number, pad?: T): void {
    if (this.sz >= size) {
      return;
    }
    this.capacity = size;
    for (let i = this.sz; i < size; i++) {
      this.data![i] = pad === undefined ? (null as any) : pad;
    }
    this.sz = size;
  }

  public clear(dealloc: boolean = false): void {
    if (this.data !== null) {
      this.sz = 0;
      if (dealloc) {
        this.data = null;
      }
    }
  }

  public toString(): string {
    const sb: string[] = [];
    sb.push('[');
    let sep = '';
    for (let i = 0; i < this.data!.length; ++i) {
      sb.push(sep + this.data![i]);
      sep = ', ';
    }
    sb.push(']');
    return sb.join('');
  }

  public sort(comp: (a: T, b: T) => number): void {
    if (this.sz <= 1) {
      return;
    }
    this.data!.sort(comp);
  }

  public remove(t: T): void {
    let j = 0;
    for (; j < this.data!.length && !this.data![j].equals(t); j++) {}
    if (j >= this.data!.length) {
      throw new Error('t');
    }
    for (; j < this.data!.length - 1; j++) {
      this.data![j] = this.data![j + 1];
    }
    this.pop();
  }

  public [Symbol.iterator](): Iterator<T> {
    let i = 0;
    return {
      next: (): IteratorResult<T> => {
        if (i < this.sz) {
          return { done: false, value: this.data![i++] };
        } else {
          return { done: true, value: undefined as any };
        }
      },
    };
  }
}
