import { Enumeration, EnumerationValue } from 'phet-lib/phet-core';
import EdgePressStyle from './EdgePressStyle.ts';
import FaceColorPressStyle from './FaceColorPressStyle.ts';
import { LocalStorageEnumerationProperty } from '../../util/localStorage.ts';

export default class StateTransitionMode extends EnumerationValue {
  public constructor(
    public readonly edgePressStyles: [EdgePressStyle, EdgePressStyle, EdgePressStyle],
    public readonly faceColorPressStyles: [FaceColorPressStyle, FaceColorPressStyle, FaceColorPressStyle],
  ) {
    super();
  }

  public static readonly CYCLIC = new StateTransitionMode(
    [EdgePressStyle.CYCLE, EdgePressStyle.WHITE_SET, EdgePressStyle.REVERSE_CYCLE],
    [FaceColorPressStyle.CYCLE, FaceColorPressStyle.UNDECIDED_SET, FaceColorPressStyle.REVERSE_CYCLE],
  );

  public static readonly TOGGLE = new StateTransitionMode(
    [EdgePressStyle.BLACK_TOGGLE, EdgePressStyle.WHITE_SET, EdgePressStyle.RED_TOGGLE],
    [FaceColorPressStyle.INSIDE_TOGGLE, FaceColorPressStyle.UNDECIDED_SET, FaceColorPressStyle.OUTSIDE_TOGGLE],
  );

  public static readonly enumeration = new Enumeration(StateTransitionMode);
}

export const stateTransitionModeProperty = new LocalStorageEnumerationProperty(
  'stateTransitionModeProperty',
  StateTransitionMode.CYCLIC,
);
