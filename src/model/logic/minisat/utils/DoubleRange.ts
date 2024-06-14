export class DoubleRange {
  public begin: number;
  public beginInclusive: boolean;
  public end: number;
  public endInclusive: boolean;

  public constructor(begin: number, beginInclusive: boolean, end: number, endInclusive: boolean) {
    this.begin = begin;
    this.beginInclusive = beginInclusive;
    this.end = end;
    this.endInclusive = endInclusive;
  }
}
