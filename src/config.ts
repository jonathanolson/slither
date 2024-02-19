
import { Enumeration, EnumerationValue } from "phet-lib/phet-core";
import EdgeState from "./model/EdgeState";
import { EnumerationProperty } from "phet-lib/axon";

export default class EdgePressStyle extends EnumerationValue {

  public constructor(
    public readonly fromWhite: EdgeState,
    public readonly fromBlack: EdgeState,
    public readonly fromRed: EdgeState
  ) {
    super();
  }

  public apply( edge: EdgeState ): EdgeState {
    if ( edge === EdgeState.WHITE ) {
      return this.fromWhite;
    }
    else if ( edge === EdgeState.BLACK ) {
      return this.fromBlack;
    }
    else {
      return this.fromRed;
    }
  }

  public static readonly CYCLE = new EdgePressStyle( EdgeState.BLACK, EdgeState.RED, EdgeState.WHITE );
  public static readonly REVERSE_CYCLE = new EdgePressStyle( EdgeState.RED, EdgeState.WHITE, EdgeState.BLACK );
  public static readonly WHITE_SET = new EdgePressStyle( EdgeState.WHITE, EdgeState.WHITE, EdgeState.WHITE );
  public static readonly BLACK_SET = new EdgePressStyle( EdgeState.BLACK, EdgeState.BLACK, EdgeState.BLACK );
  public static readonly RED_SET = new EdgePressStyle( EdgeState.RED, EdgeState.RED, EdgeState.RED );
  public static readonly BLACK_TOGGLE = new EdgePressStyle( EdgeState.BLACK, EdgeState.WHITE, EdgeState.BLACK );
  public static readonly RED_TOGGLE = new EdgePressStyle( EdgeState.RED, EdgeState.RED, EdgeState.WHITE );

  public static readonly enumeration = new Enumeration( EdgePressStyle );
}

const DEFAULTS = {
  pressStyle0: EdgePressStyle.CYCLE,
  pressStyle1: EdgePressStyle.WHITE_SET,
  pressStyle2: EdgePressStyle.REVERSE_CYCLE
} as const;

// Button 0 (left)
export const pressStyle0Property = new EnumerationProperty(
  localStorage.getItem( 'pressStyle0' )
    ? EdgePressStyle.enumeration.getValue( localStorage.getItem( 'pressStyle0' )! ) || DEFAULTS.pressStyle0
    : DEFAULTS.pressStyle0
);
pressStyle0Property.link( value => localStorage.setItem( 'pressStyle0', value.name ) );

// Button 1 (middle)
export const pressStyle1Property = new EnumerationProperty(
  localStorage.getItem( 'pressStyle1' )
    ? EdgePressStyle.enumeration.getValue( localStorage.getItem( 'pressStyle1' )! ) || DEFAULTS.pressStyle1
    : DEFAULTS.pressStyle1
);
pressStyle1Property.link( value => localStorage.setItem( 'pressStyle1', value.name ) );

// Button 2 (right)
export const pressStyle2Property = new EnumerationProperty(
  localStorage.getItem( 'pressStyle2' )
    ? EdgePressStyle.enumeration.getValue( localStorage.getItem( 'pressStyle2' )! ) || DEFAULTS.pressStyle2
    : DEFAULTS.pressStyle2
);
pressStyle2Property.link( value => localStorage.setItem( 'pressStyle2', value.name ) );

export const getPressStyle = ( button: 0 | 1 | 2 ) => {
  switch ( button ) {
    case 0:
      return pressStyle0Property.value;
    case 1:
      return pressStyle1Property.value;
    case 2:
      return pressStyle2Property.value;
  }
};