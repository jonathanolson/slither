import FaceColorState from '../data/face-color/TFaceColorData.ts';

import { Enumeration, EnumerationValue } from 'phet-lib/phet-core';

export default class FaceColorPressStyle extends EnumerationValue {
  public constructor(
    public readonly fromUndecided: FaceColorState,
    public readonly fromInside: FaceColorState,
    public readonly fromOutside: FaceColorState,
  ) {
    super();
  }

  public apply(faceColorState: FaceColorState): FaceColorState {
    if (faceColorState === FaceColorState.UNDECIDED) {
      return this.fromUndecided;
    } else if (faceColorState === FaceColorState.OUTSIDE) {
      return this.fromOutside;
    } else {
      return this.fromInside;
    }
  }

  public static readonly CYCLE = new FaceColorPressStyle(
    FaceColorState.INSIDE,
    FaceColorState.OUTSIDE,
    FaceColorState.UNDECIDED,
  );
  public static readonly REVERSE_CYCLE = new FaceColorPressStyle(
    FaceColorState.OUTSIDE,
    FaceColorState.UNDECIDED,
    FaceColorState.INSIDE,
  );

  public static readonly INSIDE_TOGGLE = new FaceColorPressStyle(
    FaceColorState.INSIDE,
    FaceColorState.UNDECIDED,
    FaceColorState.INSIDE,
  );
  public static readonly OUTSIDE_TOGGLE = new FaceColorPressStyle(
    FaceColorState.OUTSIDE,
    FaceColorState.OUTSIDE,
    FaceColorState.UNDECIDED,
  );

  public static readonly UNDECIDED_SET = new FaceColorPressStyle(
    FaceColorState.UNDECIDED,
    FaceColorState.UNDECIDED,
    FaceColorState.UNDECIDED,
  );

  public static readonly enumeration = new Enumeration(FaceColorPressStyle);
}
