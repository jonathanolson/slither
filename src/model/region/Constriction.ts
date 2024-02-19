import { Region } from './Region.ts';

export class Constriction {
  public constructor(
    public readonly a: Region,
    public readonly b: Region
  ) {}
}