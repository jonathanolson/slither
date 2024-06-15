import { Enumeration, EnumerationValue } from 'phet-lib/phet-core';
import EdgeState from '../data/edge-state/EdgeState.ts';

export default class EdgePressStyle extends EnumerationValue {
  public constructor(
    public readonly fromWhite: EdgeState,
    public readonly fromBlack: EdgeState,
    public readonly fromRed: EdgeState,
  ) {
    super();
  }

  public apply(edgeState: EdgeState): EdgeState {
    if (edgeState === EdgeState.WHITE) {
      return this.fromWhite;
    } else if (edgeState === EdgeState.BLACK) {
      return this.fromBlack;
    } else {
      return this.fromRed;
    }
  }

  public static readonly CYCLE = new EdgePressStyle(EdgeState.BLACK, EdgeState.RED, EdgeState.WHITE);
  public static readonly REVERSE_CYCLE = new EdgePressStyle(EdgeState.RED, EdgeState.WHITE, EdgeState.BLACK);

  public static readonly BLACK_TOGGLE = new EdgePressStyle(EdgeState.BLACK, EdgeState.WHITE, EdgeState.BLACK);
  public static readonly RED_TOGGLE = new EdgePressStyle(EdgeState.RED, EdgeState.RED, EdgeState.WHITE);

  public static readonly WHITE_SET = new EdgePressStyle(EdgeState.WHITE, EdgeState.WHITE, EdgeState.WHITE);
  public static readonly BLACK_SET = new EdgePressStyle(EdgeState.BLACK, EdgeState.BLACK, EdgeState.BLACK);
  public static readonly RED_SET = new EdgePressStyle(EdgeState.RED, EdgeState.RED, EdgeState.RED);

  public static readonly enumeration = new Enumeration(EdgePressStyle);
}
