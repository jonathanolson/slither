export class Term<T> {
  public constructor(
    public readonly value: T,
    public readonly name: string,
  ) {}
}
