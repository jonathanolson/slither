import FaceColorState, { TFaceColor } from './TFaceColorData.ts';

export class GeneralFaceColor implements TFaceColor {
  public constructor(
    public readonly id: number,
    public readonly colorState: FaceColorState,
  ) {}
}
