export class VecNumber {
  private data: number[] | null = null;
  private sz: number = 0;

  public constructor();
  public constructor(size: number);
  public constructor(size: number, pad: number);
  public constructor(size?: number, pad?: number) {
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
    this.shrink_(nelems);
  }

  public shrink_(nelems: number): void {
    if (nelems > this.sz) {
      throw new Error('nelems');
    }
    this.sz -= nelems;
  }

  public get capacity(): number {
    return this.data === null ? 0 : this.data.length;
  }

  public push(): void;
  public push(elem: number): void;
  public push(elem?: number): void {
    if (this.sz === this.capacity) {
      this.capacity = this.sz + 1;
    }
    this.data![this.sz++] = elem === undefined ? 0 : elem;
  }

  public pop(): void {
    if (this.sz <= 0) {
      throw new Error('Index out of bounds');
    }
    this.sz--;
  }

  public last(): number {
    return this.data![this.sz - 1];
  }

  public get(index: number): number {
    if (index >= this.sz) {
      throw new Error('index');
    }
    return this.data![index];
  }

  public set(index: number, elem: number): number {
    if (index >= this.sz) {
      throw new Error('index');
    }
    return (this.data![index] = elem);
  }

  public copyTo(copy: VecNumber): void {
    copy.clear();
    copy.growTo(this.sz);
    if (this.sz <= 0) {
      return;
    }
    this.data!.slice(0, this.sz).forEach((val, idx) => (copy.data![idx] = val));
  }

  public moveTo(dest: VecNumber): void {
    dest.clear(true);
    dest.data = this.data;
    dest.sz = this.sz;
    this.data = null;
    this.sz = 0;
  }

  public static imax(x: number, y: number): number {
    const mask = (y - x) >> (4 * 8 - 1);
    return (x & mask) + (y & ~mask);
  }

  public set capacity(min_cap: number) {
    const cap = this.capacity;
    if (cap >= min_cap) {
      return;
    }
    const add = VecNumber.imax((min_cap - cap + 1) & ~1, ((cap >> 1) + 2) & ~1);
    const newData: number[] = new Array(cap + add).fill(0);
    if (this.data !== null) {
      this.data.slice(0, this.sz).forEach((val, idx) => (newData[idx] = val));
    }
    this.data = newData;
  }

  public growTo(size: number, pad: number = 0): void {
    if (this.sz >= size) {
      return;
    }
    this.capacity = size;
    for (let i = this.sz; i < size; i++) {
      this.data![i] = pad;
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
}
