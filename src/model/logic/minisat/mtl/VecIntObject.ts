export abstract class VecIntObject<T> implements Iterable<T> {
  private data: number[] | null = null;
  private sz: number = 0;
  private readonly defaultObject: T;
  private readonly defaultValue: number;

  public constructor();
  public constructor(size: number);
  public constructor(size: number, pad: T);
  public constructor(size?: number, pad?: T) {
    this.defaultObject = this.create();
    this.defaultValue = this.value(this.defaultObject);
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
      this.data![--this.sz] = this.defaultValue;
    }
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
  public push(elem: T): void;
  public push(elem?: T): void {
    if (this.sz === this.capacity) {
      this.capacity = this.sz + 1;
    }
    this.data![this.sz++] = elem === undefined ? this.defaultValue : this.value(elem);
  }

  public push_(elem: T): void {
    if (this.sz >= this.capacity) {
      throw new Error('Index out of bounds');
    }
    this.data![this.sz++] = this.value(elem);
  }

  public pop(): void {
    if (this.sz <= 0) {
      throw new Error('Index out of bounds');
    }
    this.sz--;
  }

  public last(): T {
    return this.create(this.data![this.sz - 1]);
  }

  public get(index: number): T {
    return this.create(this.data![index]);
  }

  public set(index: number, elem: T): T {
    this.data![index] = this.value(elem);
    return elem;
  }

  public copyTo(copy: VecIntObject<T>): void {
    copy.clear();
    copy.growTo(this.sz);
    if (this.sz <= 0) {
      return;
    }
    this.data!.slice(0, this.sz).forEach((val, idx) => (copy.data![idx] = val));
  }

  public moveTo(dest: VecIntObject<T>): void {
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
    const add = VecIntObject.imax((min_cap - cap + 1) & ~1, ((cap >> 1) + 2) & ~1);
    const newData: number[] = new Array(cap + add).fill(this.defaultValue);
    if (this.data !== null) {
      this.data.slice(0, this.sz).forEach((val, idx) => (newData[idx] = val));
    }
    this.data = newData;
  }

  public growTo(size: number, pad?: T): void {
    if (pad === undefined) {
      this.growTo(size, this.defaultObject);
    } else {
      if (this.sz >= size) {
        return;
      }
      this.capacity = size;
      for (let i = this.sz; i < size; i++) {
        this.data![i] = this.value(pad);
      }
      this.sz = size;
    }
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
    for (let i = 0; i < this.sz; ++i) {
      sb.push(sep + this.toStringValue(this.data![i]));
      sep = ', ';
    }
    sb.push(']');
    return sb.join('');
  }

  public quickSort(left: number, right: number): void {
    if (left <= right) {
      const p = this.data![(left + right) / 2];
      let l = left;
      let r = right;
      while (l <= r) {
        while (this.compare(this.data![l], p) < 0) {
          l++;
        }
        while (this.compare(this.data![r], p) > 0) {
          r--;
        }
        if (l <= r) {
          const tmp = this.data![l];
          this.data![l] = this.data![r];
          this.data![r] = tmp;
          l++;
          r--;
        }
      }
      this.quickSort(left, r);
      this.quickSort(l, right);
    }
  }

  public sort(): void {
    if (this.data === null) {
      return;
    }
    this.quickSort(0, this.sz - 1);
  }

  public remove(t: T): void {
    let j = 0;
    for (; j < this.data!.length && this.data![j] !== this.value(t); j++) {}
    if (j >= this.data!.length) {
      throw new Error('t');
    }
    for (; j < this.data!.length - 1; j++) {
      this.data![j] = this.data![j + 1];
    }
    this.pop();
  }

  protected abstract create(): T;
  protected abstract create(value: number): T;

  protected abstract value(object: T): number;

  protected abstract compare(a: number, b: number): number;

  protected abstract toStringValue(value: number): string;

  public [Symbol.iterator](): Iterator<T> {
    let i = 0;
    return {
      next: (): IteratorResult<T> => {
        if (i < this.sz) {
          return { done: false, value: this.create(this.data![i++]) };
        } else {
          return { done: true, value: undefined as any };
        }
      },
    };
  }
}
