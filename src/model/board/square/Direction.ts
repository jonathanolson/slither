import { Vector2 } from 'phet-lib/dot';
import { Enumeration, EnumerationValue } from 'phet-lib/phet-core';

export class CardinalDirection extends EnumerationValue {
  public ccw!: CardinalDirection;
  public cw!: CardinalDirection;
  public opposite!: CardinalDirection;

  public left!: CardinalDirection;
  public right!: CardinalDirection;
  public back!: CardinalDirection;

  public halfLeft!: OrdinalDirection;
  public halfRight!: OrdinalDirection;

  public delta!: Vector2;

  public static readonly NORTH = new CardinalDirection();
  public static readonly EAST = new CardinalDirection();
  public static readonly SOUTH = new CardinalDirection();
  public static readonly WEST = new CardinalDirection();

  public static readonly enumeration = new Enumeration(CardinalDirection);
}

export class OrdinalDirection extends EnumerationValue {
  public ccw!: OrdinalDirection;
  public cw!: OrdinalDirection;
  public opposite!: OrdinalDirection;

  public left!: OrdinalDirection;
  public right!: OrdinalDirection;
  public back!: OrdinalDirection;

  public halfLeft!: CardinalDirection;
  public halfRight!: CardinalDirection;

  public static readonly NORTHEAST = new OrdinalDirection();
  public static readonly SOUTHEAST = new OrdinalDirection();
  public static readonly SOUTHWEST = new OrdinalDirection();
  public static readonly NORTHWEST = new OrdinalDirection();

  public static readonly enumeration = new Enumeration(OrdinalDirection);
}

type Direction = CardinalDirection | OrdinalDirection;

export default Direction;

// Statically hook up everything, so we'll hopefully get good runtime performance.

CardinalDirection.NORTH.ccw = CardinalDirection.NORTH.left = CardinalDirection.WEST;
CardinalDirection.NORTH.cw = CardinalDirection.NORTH.right = CardinalDirection.EAST;
CardinalDirection.NORTH.opposite = CardinalDirection.NORTH.back = CardinalDirection.SOUTH;
CardinalDirection.NORTH.halfLeft = OrdinalDirection.NORTHWEST;
CardinalDirection.NORTH.halfRight = OrdinalDirection.NORTHEAST;

CardinalDirection.EAST.ccw = CardinalDirection.EAST.left = CardinalDirection.NORTH;
CardinalDirection.EAST.cw = CardinalDirection.EAST.right = CardinalDirection.SOUTH;
CardinalDirection.EAST.opposite = CardinalDirection.EAST.back = CardinalDirection.WEST;
CardinalDirection.EAST.halfLeft = OrdinalDirection.NORTHEAST;
CardinalDirection.EAST.halfRight = OrdinalDirection.SOUTHEAST;

CardinalDirection.SOUTH.ccw = CardinalDirection.SOUTH.left = CardinalDirection.EAST;
CardinalDirection.SOUTH.cw = CardinalDirection.SOUTH.right = CardinalDirection.WEST;
CardinalDirection.SOUTH.opposite = CardinalDirection.SOUTH.back = CardinalDirection.NORTH;
CardinalDirection.SOUTH.halfLeft = OrdinalDirection.SOUTHEAST;
CardinalDirection.SOUTH.halfRight = OrdinalDirection.SOUTHWEST;

CardinalDirection.WEST.ccw = CardinalDirection.WEST.left = CardinalDirection.SOUTH;
CardinalDirection.WEST.cw = CardinalDirection.WEST.right = CardinalDirection.NORTH;
CardinalDirection.WEST.opposite = CardinalDirection.WEST.back = CardinalDirection.EAST;
CardinalDirection.WEST.halfLeft = OrdinalDirection.SOUTHWEST;
CardinalDirection.WEST.halfRight = OrdinalDirection.NORTHWEST;

// visual-style directions
CardinalDirection.WEST.delta = new Vector2(-1, 0);
CardinalDirection.EAST.delta = new Vector2(1, 0);
CardinalDirection.NORTH.delta = new Vector2(0, -1);
CardinalDirection.SOUTH.delta = new Vector2(0, 1);

OrdinalDirection.NORTHEAST.ccw = OrdinalDirection.NORTHEAST.left = OrdinalDirection.NORTHWEST;
OrdinalDirection.NORTHEAST.cw = OrdinalDirection.NORTHEAST.right = OrdinalDirection.SOUTHEAST;
OrdinalDirection.NORTHEAST.opposite = OrdinalDirection.NORTHEAST.back = OrdinalDirection.SOUTHWEST;
OrdinalDirection.NORTHEAST.halfLeft = CardinalDirection.NORTH;
OrdinalDirection.NORTHEAST.halfRight = CardinalDirection.EAST;

OrdinalDirection.SOUTHEAST.ccw = OrdinalDirection.SOUTHEAST.left = OrdinalDirection.NORTHEAST;
OrdinalDirection.SOUTHEAST.cw = OrdinalDirection.SOUTHEAST.right = OrdinalDirection.SOUTHWEST;
OrdinalDirection.SOUTHEAST.opposite = OrdinalDirection.SOUTHEAST.back = OrdinalDirection.NORTHWEST;
OrdinalDirection.SOUTHEAST.halfLeft = CardinalDirection.EAST;
OrdinalDirection.SOUTHEAST.halfRight = CardinalDirection.SOUTH;

OrdinalDirection.SOUTHWEST.ccw = OrdinalDirection.SOUTHWEST.left = OrdinalDirection.SOUTHEAST;
OrdinalDirection.SOUTHWEST.cw = OrdinalDirection.SOUTHWEST.right = OrdinalDirection.NORTHWEST;
OrdinalDirection.SOUTHWEST.opposite = OrdinalDirection.SOUTHWEST.back = OrdinalDirection.NORTHEAST;
OrdinalDirection.SOUTHWEST.halfLeft = CardinalDirection.SOUTH;
OrdinalDirection.SOUTHWEST.halfRight = CardinalDirection.WEST;

OrdinalDirection.NORTHWEST.ccw = OrdinalDirection.NORTHWEST.left = OrdinalDirection.SOUTHWEST;
OrdinalDirection.NORTHWEST.cw = OrdinalDirection.NORTHWEST.right = OrdinalDirection.NORTHWEST;
OrdinalDirection.NORTHWEST.opposite = OrdinalDirection.NORTHWEST.back = OrdinalDirection.NORTHEAST;
OrdinalDirection.NORTHWEST.halfLeft = CardinalDirection.WEST;
OrdinalDirection.NORTHWEST.halfRight = CardinalDirection.NORTH;
