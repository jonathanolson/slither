import { Vector2 } from "phet-lib/dot";
import { CardinalDirection, OrdinalDirection } from './Direction.ts';
import { Orientation } from "phet-lib/phet-core";
import EdgeState from "./EdgeState.ts";
import FaceState from "./FaceState.ts";
import assert from "../workarounds/assert.ts";
import _ from '../workarounds/_';

export interface TVertex {
  logicalCoordinates: Vector2;
  viewCoordinates: Vector2;
  incidentHalfEdges: THalfEdge[];
  reflectedHalfEdges: THalfEdge[];
  edges: TEdge[];
  faces: TFace[];
  getHalfEdgeTo( otherVertex: TVertex ): THalfEdge;
  getHalfEdgeFrom( otherVertex: TVertex ): THalfEdge;
  getEdgeTo( otherVertex: TVertex ): TEdge;
};

export interface THalfEdge {
  start: TVertex;
  end: TVertex;
  isReversed: boolean;
  edge: TEdge;
  reversed: THalfEdge;
  next: THalfEdge;
  previous: THalfEdge;
  face: TFace | null;
};

export interface TEdge {
  start: TVertex;
  end: TVertex;
  forwardHalf: THalfEdge;
  reversedHalf: THalfEdge;
  forwardFace: TFace | null;
  reversedFace: TFace | null;
  getOtherVertex( vertex: TVertex ): TVertex;
  getOtherFace( face: TFace | null ): TFace | null;
};

export interface TFace {
  logicalCoordinates: Vector2;
  viewCoordinates: Vector2;
  halfEdges: THalfEdge[];
  edges: TEdge[];
  vertices: TVertex[];
};

export interface TSquareVertex extends TVertex {
  logicalCoordinates: Vector2;
  viewCoordinates: Vector2;
  incidentHalfEdges: TSquareHalfEdge[];
  reflectedHalfEdges: TSquareHalfEdge[];
  edges: TSquareEdge[];
  faces: TSquareFace[];
  getHalfEdgeTo( otherVertex: TSquareVertex ): TSquareHalfEdge;
  getHalfEdgeFrom( otherVertex: TSquareVertex ): TSquareHalfEdge;
  getEdgeTo( otherVertex: TSquareVertex ): TSquareEdge;

  // Square-specific
  northIncidentHalfEdge: TSquareHalfEdge | null;
  eastIncidentHalfEdge: TSquareHalfEdge | null;
  southIncidentHalfEdge: TSquareHalfEdge | null;
  westIncidentHalfEdge: TSquareHalfEdge | null;
  northReflectedHalfEdge: TSquareHalfEdge | null;
  eastReflectedHalfEdge: TSquareHalfEdge | null;
  southReflectedHalfEdge: TSquareHalfEdge | null;
  westReflectedHalfEdge: TSquareHalfEdge | null;
  northEdge: TSquareEdge | null;
  eastEdge: TSquareEdge | null;
  southEdge: TSquareEdge | null;
  westEdge: TSquareEdge | null;
  northeastFace: TSquareFace | null;
  southeastFace: TSquareFace | null;
  southwestFace: TSquareFace | null;
  northwestFace: TSquareFace | null;
  getHalfEdge( direction: CardinalDirection ): TSquareHalfEdge | null;
  getEdge( direction: CardinalDirection ): TSquareEdge | null;
  getFace( direction: OrdinalDirection ): TSquareFace | null;
  getDirectionOfHalfEdge( halfEdge: TSquareHalfEdge ): CardinalDirection;
  getDirectionOfEdge( edge: TSquareEdge ): CardinalDirection;
  getDirectionOfFace( face: TSquareFace ): OrdinalDirection;
};

export interface TSquareHalfEdge extends THalfEdge {
  start: TSquareVertex;
  end: TSquareVertex;
  isReversed: boolean;
  edge: TSquareEdge;
  reversed: TSquareHalfEdge;
  next: TSquareHalfEdge;
  previous: TSquareHalfEdge;
  face: TSquareFace | null;

  // Square-specific
  orientation: Orientation;
  northVertex: TSquareVertex; // defined for vertical - should fire an assertion if guessed wrong orientation
  eastVertex: TSquareVertex; // defined for horizontal - should fire an assertion if guessed wrong orientation
  southVertex: TSquareVertex; // defined for vertical - should fire an assertion if guessed wrong orientation
  westVertex: TSquareVertex; // defined for horizontal - should fire an assertion if guessed wrong orientation
};

export interface TSquareEdge extends TEdge {
  start: TSquareVertex;
  end: TSquareVertex;
  forwardHalf: TSquareHalfEdge;
  reversedHalf: TSquareHalfEdge;
  forwardFace: TSquareFace | null;
  reversedFace: TSquareFace | null;
  getOtherVertex( vertex: TSquareVertex ): TSquareVertex;
  getOtherFace( face: TSquareFace | null ): TSquareFace | null;

  // Square-specific
  orientation: Orientation;
  northVertex: TSquareVertex; // defined for vertical - should fire an assertion if guessed wrong orientation
  eastVertex: TSquareVertex; // defined for horizontal - should fire an assertion if guessed wrong orientation
  southVertex: TSquareVertex; // defined for vertical - should fire an assertion if guessed wrong orientation
  westVertex: TSquareVertex; // defined for horizontal - should fire an assertion if guessed wrong orientation
  northFace: TSquareFace | null; // defined for horizontal - should fire an assertion if guessed wrong orientation
  eastFace: TSquareFace | null; // defined for vertical - should fire an assertion if guessed wrong orientation
  southFace: TSquareFace | null; // defined for horizontal - should fire an assertion if guessed wrong orientation
  westFace: TSquareFace | null; // defined for vertical - should fire an assertion if guessed wrong orientation
};

export interface TSquareFace extends TFace {
  logicalCoordinates: Vector2;
  viewCoordinates: Vector2;
  halfEdges: TSquareHalfEdge[];
  edges: TSquareEdge[];
  vertices: TSquareVertex[];

  // Square-specific
  northHalfEdge: TSquareHalfEdge;
  eastHalfEdge: TSquareHalfEdge;
  southHalfEdge: TSquareHalfEdge;
  westHalfEdge: TSquareHalfEdge;
  northEdge: TSquareEdge;
  eastEdge: TSquareEdge;
  southEdge: TSquareEdge;
  westEdge: TSquareEdge;
  northeastVertex: TSquareVertex;
  southeastVertex: TSquareVertex;
  southwestVertex: TSquareVertex;
  northwestVertex: TSquareVertex;
  getHalfEdge( direction: CardinalDirection ): TSquareHalfEdge;
  getEdge( direction: CardinalDirection ): TSquareEdge;
  getVertex( direction: OrdinalDirection ): TSquareVertex;
  getDirectionOfHalfEdge( halfEdge: TSquareHalfEdge ): CardinalDirection;
  getDirectionOfEdge( edge: TSquareEdge ): CardinalDirection;
  getDirectionOfVertex( vertex: TSquareVertex ): OrdinalDirection;
};

// TODO: do we want this on ALL of our state types? Is this valuable to separate out?
// NOTE: Extends the state type(!)
export type TState<StateData> = {
  clone(): TState<StateData>;
  createDelta(): TStateDelta<StateData>;
} & StateData;

export interface TAction<StateData> {
  // TODO: consider a concept of "will this do anything?" - when would we use that?
  apply( state: StateData ): void;
  applyUndoable( state: StateData ): TAction<StateData>; // returns the undo action

  // TODO: What are we... intending with this?
  isEmpty(): boolean;
};

// TODO: create actions which apply auto-solve after the action is applied?

export type TStateDelta<StateData> = {
  // TODO: do we really need anything here? createConsolidatedAction?
} & TState<StateData> & TAction<StateData>;


export interface TFaceStateData {
  getFaceState( face: TFace ): FaceState;
  setFaceState( face: TFace, state: FaceState ): void;
}

export interface TEdgeStateData {
  getEdgeState( edge: TEdge ): EdgeState;
  setEdgeState( edge: TEdge, state: EdgeState ): void;
};

export class CompositeAction<State> implements TAction<State> {

  public constructor(
    public readonly actions: TAction<State>[]
  ) {}

  public apply( state: State ): void {
    for ( let i = 0; i < this.actions.length; i++ ) {
      this.actions[ i ].apply( state );
    }
  }

  public applyUndoable( state: State ): TAction<State> {
    return new CompositeAction( this.actions.map( action => action.applyUndoable( state ) ).reverse() );
  }

  public isEmpty(): boolean {
    return this.actions.some( action => !action.isEmpty() );
  }
}

export class EdgeStateSetAction implements TAction<TEdgeStateData> {

  public constructor(
    public readonly edge: TEdge,
    public readonly state: EdgeState
  ) {}

  public apply( state: TEdgeStateData ): void {
    state.setEdgeState( this.edge, this.state );
  }

  public applyUndoable( state: TEdgeStateData ): TAction<TEdgeStateData> {
    const previousState = state.getEdgeState( this.edge );
    this.apply( state );
    return new EdgeStateSetAction( this.edge, previousState );
  }

  public isEmpty(): boolean {
    return false;
  }
}

// TODO: immediate user repeat of "toggle" should undo auto-solve (that is probably out of the scope of these simple actions)
// TODO: Potentially a UserEdgeStateToggleAction that does this and other things?
export class EdgeStateToggleAction implements TAction<TEdgeStateData> {

  public constructor(
    public readonly edge: TEdge,
    public readonly forward: boolean = true
  ) {}

  public apply( state: TEdgeStateData ): void {
    const currentState = state.getEdgeState( this.edge );
    if ( currentState === EdgeState.WHITE ) {
      state.setEdgeState( this.edge, this.forward ? EdgeState.BLACK : EdgeState.RED );
    }
    else if ( currentState === EdgeState.BLACK ) {
      state.setEdgeState( this.edge, this.forward ? EdgeState.RED : EdgeState.WHITE );
    }
    else {
      state.setEdgeState( this.edge, this.forward ? EdgeState.WHITE : EdgeState.BLACK );
    }
  }

  public applyUndoable( state: TEdgeStateData ): TAction<TEdgeStateData> {
    this.apply( state );
    return new EdgeStateToggleAction( this.edge, !this.forward );
  }

  public isEmpty(): boolean {
    return false;
  }
}

export type TStructure = {
  HalfEdge: THalfEdge;
  Edge: TEdge;
  Face: TFace;
  Vertex: TVertex;
};

export type TSquareStructure = {
  HalfEdge: TSquareHalfEdge;
  Edge: TSquareEdge;
  Face: TSquareFace;
  Vertex: TSquareVertex;
};

export type TBoard<Structure extends TStructure> = {
  edges: Structure[ 'Edge' ][];
  vertices: Structure[ 'Vertex' ][];
  faces: Structure[ 'Face' ][];
};

export class BaseVertex<Structure extends TStructure> implements TVertex {

  // Half-edges with this vertex as their end vertex, in CCW order
  public incidentHalfEdges!: Structure[ 'HalfEdge' ][];

  // Half-edges with this vertex as their start vertex, in CCW order
  public reflectedHalfEdges!: Structure[ 'HalfEdge' ][];

  // Edges, in CCW order
  public edges!: Structure[ 'Edge' ][];

  // Faces, in CCW order (TODO: how to relate the order of edges/faces? Do we... link them?)
  public faces!: Structure[ 'Face' ][];

  public constructor(
    // 2d coordinates (for hex, we'll want logical/view coordinate separation)
    public readonly logicalCoordinates: Vector2,
    public readonly viewCoordinates: Vector2
  ) {}

  public getHalfEdgeTo( otherVertex: Structure[ 'Vertex' ] ): Structure[ 'HalfEdge' ] {
    const halfEdge = this.reflectedHalfEdges.find( halfEdge => halfEdge.end === otherVertex );
    assert && assert( halfEdge );
    return halfEdge!;
  }

  public getHalfEdgeFrom( otherVertex: Structure[ 'Vertex' ] ): Structure[ 'HalfEdge' ] {
    const halfEdge = this.incidentHalfEdges.find( halfEdge => halfEdge.start === otherVertex )!;
    assert && assert( halfEdge );
    return halfEdge!;
  }

  public getEdgeTo( otherVertex: Structure[ 'Vertex' ] ): Structure[ 'Edge' ] {
    const edge = this.edges.find( edge => edge.start === otherVertex || edge.end === otherVertex )!;
    assert && assert( edge );
    return edge!;
  }
}

export class BaseHalfEdge<Structure extends TStructure> implements THalfEdge {

  public edge!: Structure[ 'Edge' ];

  public reversed!: Structure[ 'HalfEdge' ];

  public next!: Structure[ 'HalfEdge' ];
  public previous!: Structure[ 'HalfEdge' ];

  // The face to the "left" of the directed half-edge
  public face: Structure[ 'Face' ] | null = null;

  public constructor(
    public readonly start: Structure[ 'Vertex' ],
    public readonly end: Structure[ 'Vertex' ],
    public readonly isReversed: boolean
  ) {}
}

export class BaseEdge<Structure extends TStructure> implements TEdge {

  public forwardHalf!: Structure[ 'HalfEdge' ];
  public reversedHalf!: Structure[ 'HalfEdge' ];

  public forwardFace!: Structure[ 'Face' ] | null;
  public reversedFace!: Structure[ 'Face' ] | null;

  public constructor(
    public readonly start: Structure[ 'Vertex' ],
    public readonly end: Structure[ 'Vertex' ]
  ) {}

  public getOtherVertex( vertex: Structure[ 'Vertex' ] ): Structure[ 'Vertex' ] {
    assert && assert( vertex === this.start || vertex === this.end, 'vertex must be one of the two vertices of this edge' );

    return vertex === this.start ? this.end : this.start;
  }

  public getOtherFace( face: Structure[ 'Face' ] | null ): Structure[ 'Face' ] | null {
    assert && assert( face === this.forwardFace || face === this.reversedFace, 'face must be one of the two faces of this edge' );

    // We can't have null forward/reversed faces!
    return face === this.forwardFace ? this.reversedFace : this.forwardFace;
  }
}

export class BaseFace<Structure extends TStructure> implements TFace {

  // Half-edges, in CCW order
  public halfEdges!: Structure[ 'HalfEdge' ][];

  // Edges, in CCW order
  public edges!: Structure[ 'Edge' ][];

  // Vertices, in CCW order (TODO: how to relate the order of edges/faces? Do we... link them?)
  public vertices!: Structure[ 'Vertex' ][];

  public constructor(
    // 2d coordinates (for hex, we'll want logical/view coordinate separation)
    public readonly logicalCoordinates: Vector2,
    public readonly viewCoordinates: Vector2 // NOTE: We may tweak the center for better "text" feel, so this might not be the centroid?
  ) {}
}

export class BaseBoard<Structure extends TStructure> implements TBoard<Structure> {
  public constructor(
    public readonly edges: Structure[ 'Edge' ][],
    public readonly vertices: Structure[ 'Vertex' ][],
    public readonly faces: Structure[ 'Face' ][]
  ) {}
}

export type SquareInitializer = {
  width: number;
  height: number;
  // For the upper-left corner of each primitive. Edges go down(south) or right(east) from this.
  getVertex( x: number, y: number ): TSquareVertex | null;
  getEdge( x: number, y: number, orientation: Orientation ): TSquareEdge | null;
  getHalfEdge( x0: number, y0: number, x1: number, y1: number ): TSquareHalfEdge | null;
  getFace( x: number, y: number ): TSquareFace | null;
};

export class SquareVertex extends BaseVertex<TSquareStructure> implements TSquareVertex {
  public northIncidentHalfEdge: TSquareHalfEdge | null = null;
  public eastIncidentHalfEdge: TSquareHalfEdge | null = null;
  public southIncidentHalfEdge: TSquareHalfEdge | null = null;
  public westIncidentHalfEdge: TSquareHalfEdge | null = null;
  public northReflectedHalfEdge: TSquareHalfEdge | null = null;
  public eastReflectedHalfEdge: TSquareHalfEdge | null = null;
  public southReflectedHalfEdge: TSquareHalfEdge | null = null;
  public westReflectedHalfEdge: TSquareHalfEdge | null = null;
  public northEdge: TSquareEdge | null = null;
  public eastEdge: TSquareEdge | null = null;
  public southEdge: TSquareEdge | null = null;
  public westEdge: TSquareEdge | null = null;
  public northeastFace: TSquareFace | null = null;
  public southeastFace: TSquareFace | null = null;
  public southwestFace: TSquareFace | null = null;
  public northwestFace: TSquareFace | null = null;

  public initialize( init: SquareInitializer ) {
    const x = this.logicalCoordinates.x;
    const y = this.logicalCoordinates.y;

    this.westEdge = init.getEdge( x - 1, y, Orientation.HORIZONTAL );
    this.northEdge = init.getEdge( x, y - 1, Orientation.VERTICAL );
    this.eastEdge = init.getEdge( x, y, Orientation.HORIZONTAL );
    this.southEdge = init.getEdge( x, y, Orientation.VERTICAL );

    this.westIncidentHalfEdge = this.westEdge ? this.westEdge.forwardHalf : null;
    this.northIncidentHalfEdge = this.northEdge ? this.northEdge.forwardHalf : null;
    this.eastIncidentHalfEdge = this.eastEdge ? this.eastEdge.reversedHalf : null;
    this.southIncidentHalfEdge = this.southEdge ? this.southEdge.reversedHalf : null;
    this.westReflectedHalfEdge = this.westEdge ? this.westEdge.reversedHalf : null;
    this.northReflectedHalfEdge = this.northEdge ? this.northEdge.reversedHalf : null;
    this.eastReflectedHalfEdge = this.eastEdge ? this.eastEdge.forwardHalf : null;
    this.southReflectedHalfEdge = this.southEdge ? this.southEdge.forwardHalf : null;

    this.northwestFace = init.getFace( x - 1, y - 1 );
    this.northeastFace = init.getFace( x, y - 1 );
    this.southeastFace = init.getFace( x, y );
    this.southwestFace = init.getFace( x - 1, y );

    this.incidentHalfEdges = [
      this.westIncidentHalfEdge,
      this.southIncidentHalfEdge,
      this.eastIncidentHalfEdge,
      this.northIncidentHalfEdge
    ].filter( e => e !== null ) as TSquareHalfEdge[];

    this.reflectedHalfEdges = [
      this.westReflectedHalfEdge,
      this.southReflectedHalfEdge,
      this.eastReflectedHalfEdge,
      this.northReflectedHalfEdge
    ].filter( e => e !== null ) as TSquareHalfEdge[];

    this.edges = [ this.westEdge, this.southEdge, this.eastEdge, this.northEdge ].filter( e => e !== null ) as TSquareEdge[];
    this.faces = [ this.northwestFace, this.southwestFace, this.southeastFace, this.northeastFace ].filter( e => e !== null ) as TSquareFace[];
  }

  getHalfEdge( direction: CardinalDirection ): TSquareHalfEdge | null {
    switch ( direction ) {
      case CardinalDirection.NORTH:
        return this.northIncidentHalfEdge;
      case CardinalDirection.EAST:
        return this.eastIncidentHalfEdge;
      case CardinalDirection.SOUTH:
        return this.southIncidentHalfEdge;
      case CardinalDirection.WEST:
        return this.westIncidentHalfEdge;
      default:
        throw new Error( `Invalid direction: ${direction}` );
    }
  }

  getEdge( direction: CardinalDirection ): TSquareEdge | null {
    switch ( direction ) {
      case CardinalDirection.NORTH:
        return this.northEdge;
      case CardinalDirection.EAST:
        return this.eastEdge;
      case CardinalDirection.SOUTH:
        return this.southEdge;
      case CardinalDirection.WEST:
        return this.westEdge;
      default:
        throw new Error( `Invalid direction: ${direction}` );
    }
  }

  getFace( direction: OrdinalDirection ): TSquareFace | null {
    switch ( direction ) {
      case OrdinalDirection.NORTHEAST:
        return this.northeastFace;
      case OrdinalDirection.SOUTHEAST:
        return this.southeastFace;
      case OrdinalDirection.SOUTHWEST:
        return this.southwestFace;
      case OrdinalDirection.NORTHWEST:
        return this.northwestFace;
      default:
        throw new Error( `Invalid direction: ${direction}` );
    }
  }

  getDirectionOfHalfEdge( halfEdge: TSquareHalfEdge ): CardinalDirection {
    if ( halfEdge === this.northIncidentHalfEdge ) {
      return CardinalDirection.NORTH;
    }
    else if ( halfEdge === this.eastIncidentHalfEdge ) {
      return CardinalDirection.EAST;
    }
    else if ( halfEdge === this.southIncidentHalfEdge ) {
      return CardinalDirection.SOUTH;
    }
    else if ( halfEdge === this.westIncidentHalfEdge ) {
      return CardinalDirection.WEST;
    }
    else {
      throw new Error( `Invalid half-edge: ${halfEdge}` );
    }
  }

  getDirectionOfEdge( edge: TSquareEdge ): CardinalDirection {
    if ( edge === this.northEdge ) {
      return CardinalDirection.NORTH;
    }
    else if ( edge === this.eastEdge ) {
      return CardinalDirection.EAST;
    }
    else if ( edge === this.southEdge ) {
      return CardinalDirection.SOUTH;
    }
    else if ( edge === this.westEdge ) {
      return CardinalDirection.WEST;
    }
    else {
      throw new Error( `Invalid edge: ${edge}` );
    }
  }

  getDirectionOfFace( face: TSquareFace ): OrdinalDirection {
    if ( face === this.northeastFace ) {
      return OrdinalDirection.NORTHEAST;
    }
    else if ( face === this.southeastFace ) {
      return OrdinalDirection.SOUTHEAST;
    }
    else if ( face === this.southwestFace ) {
      return OrdinalDirection.SOUTHWEST;
    }
    else if ( face === this.northwestFace ) {
      return OrdinalDirection.NORTHWEST;
    }
    else {
      throw new Error( `Invalid face: ${face}` );
    }
  }
}

export class SquareHalfEdge extends BaseHalfEdge<TSquareStructure> implements TSquareHalfEdge {
  public orientation!: Orientation;
  public northVertex!: TSquareVertex; // defined for vertical - should fire an assertion if guessed wrong orientation
  public eastVertex!: TSquareVertex; // defined for horizontal - should fire an assertion if guessed wrong orientation
  public southVertex!: TSquareVertex; // defined for vertical - should fire an assertion if guessed wrong orientation
  public westVertex!: TSquareVertex; // defined for horizontal - should fire an assertion if guessed wrong orientation

  public initialize( init: SquareInitializer, orientation: Orientation, edge: SquareEdge ) {
    this.orientation = orientation;
    this.edge = edge;
    this.reversed = this.isReversed ? edge.forwardHalf : edge.reversedHalf;

    const start = this.start.logicalCoordinates;
    const end = this.end.logicalCoordinates;

    const delta = end.minus( start );
    assert && assert( delta.magnitude === 1 );
    const ccw = ( v: Vector2 ) => new Vector2( v.y, -v.x );
    const cw = ( v: Vector2 ) => new Vector2( -v.y, v.x );

    // Our face is to the CCW, we can take the minimum values of x/y for the four corners to load it
    const offsetStart = ccw( delta ).plus( start );
    const offsetEnd = ccw( delta ).plus( end );
    this.face = init.getFace(
      Math.min( start.x, end.x, offsetStart.x, offsetEnd.x ),
      Math.min( start.y, end.y, offsetStart.y, offsetEnd.y )
    );

    const nextPoints = [ ccw( delta ), delta, cw( delta ) ].map( p => end.plus( p ) );
    const previousPoints = [ ccw( delta ), delta.negated(), cw( delta ) ].map( p => start.plus( p ) );

    this.next =
      init.getHalfEdge( end.x, end.y, nextPoints[ 0 ].x, nextPoints[ 0 ].y ) ||
      init.getHalfEdge( end.x, end.y, nextPoints[ 1 ].x, nextPoints[ 1 ].y ) ||
      init.getHalfEdge( end.x, end.y, nextPoints[ 2 ].x, nextPoints[ 2 ].y )!;

    this.previous =
      init.getHalfEdge( previousPoints[ 0 ].x, previousPoints[ 0 ].y, start.x, start.y ) ||
      init.getHalfEdge( previousPoints[ 1 ].x, previousPoints[ 1 ].y, start.x, start.y ) ||
      init.getHalfEdge( previousPoints[ 2 ].x, previousPoints[ 2 ].y, start.x, start.y )!;

    if ( orientation === Orientation.HORIZONTAL ) {
      this.westVertex = edge.start;
      this.eastVertex = edge.end;
    }
    else {
      this.northVertex = edge.start;
      this.southVertex = edge.end;
    }
  }
}

export class SquareEdge extends BaseEdge<TSquareStructure> implements TSquareEdge {
  public orientation!: Orientation;
  public northVertex!: TSquareVertex; // defined for vertical - should fire an assertion if guessed wrong orientation
  public eastVertex!: TSquareVertex; // defined for horizontal - should fire an assertion if guessed wrong orientation
  public southVertex!: TSquareVertex; // defined for vertical - should fire an assertion if guessed wrong orientation
  public westVertex!: TSquareVertex; // defined for horizontal - should fire an assertion if guessed wrong orientation
  public northFace: TSquareFace | null = null; // defined for horizontal - should fire an assertion if guessed wrong orientation
  public eastFace: TSquareFace | null = null; // defined for vertical - should fire an assertion if guessed wrong orientation
  public southFace: TSquareFace | null = null; // defined for horizontal - should fire an assertion if guessed wrong orientation
  public westFace: TSquareFace | null = null; // defined for vertical - should fire an assertion if guessed wrong orientation

  public initialize( init: SquareInitializer, orientation: Orientation ) {

    this.orientation = orientation;

    ( this.forwardHalf as SquareHalfEdge ).initialize( init, orientation, this );
    ( this.reversedHalf as SquareHalfEdge ).initialize( init, orientation, this );

    this.forwardFace = this.forwardHalf.face;
    this.reversedFace = this.reversedHalf.face;

    if ( orientation === Orientation.HORIZONTAL ) {
      this.westVertex = this.start;
      this.eastVertex = this.end;
      this.northFace = this.forwardFace;
      this.southFace = this.reversedFace;
    }
    else {
      this.northVertex = this.start;
      this.southVertex = this.end;
      this.eastFace = this.forwardFace;
      this.westFace = this.reversedFace;
    }
  }
}

export class SquareFace extends BaseFace<TSquareStructure> implements TSquareFace {
  public northHalfEdge!: TSquareHalfEdge;
  public eastHalfEdge!: TSquareHalfEdge;
  public southHalfEdge!: TSquareHalfEdge;
  public westHalfEdge!: TSquareHalfEdge;
  public northEdge!: TSquareEdge;
  public eastEdge!: TSquareEdge;
  public southEdge!: TSquareEdge;
  public westEdge!: TSquareEdge;
  public northeastVertex!: TSquareVertex;
  public southeastVertex!: TSquareVertex;
  public southwestVertex!: TSquareVertex;
  public northwestVertex!: TSquareVertex;

  public initialize( init: SquareInitializer ) {
    const x = this.logicalCoordinates.x;
    const y = this.logicalCoordinates.y;

    this.westEdge = init.getEdge( x, y, Orientation.VERTICAL )!;
    this.southEdge = init.getEdge( x, y, Orientation.HORIZONTAL )!;
    this.eastEdge = init.getEdge( x + 1, y, Orientation.VERTICAL )!;
    this.northEdge = init.getEdge( x, y, Orientation.HORIZONTAL )!;

    this.westHalfEdge = this.westEdge.forwardHalf;
    this.southHalfEdge = this.southEdge.forwardHalf;
    this.eastHalfEdge = this.eastEdge.reversedHalf;
    this.northHalfEdge = this.northEdge.reversedHalf;

    this.northwestVertex = init.getVertex( x, y )!;
    this.southwestVertex = init.getVertex( x, y + 1 )!;
    this.southeastVertex = init.getVertex( x + 1, y + 1 )!;
    this.northeastVertex = init.getVertex( x + 1, y )!;

    this.edges = [ this.westEdge, this.southEdge, this.eastEdge, this.northEdge ];
    this.halfEdges = [ this.westHalfEdge, this.southHalfEdge, this.eastHalfEdge, this.northHalfEdge ];
    this.vertices = [ this.northwestVertex, this.southwestVertex, this.southeastVertex, this.northeastVertex ];
  }

  getHalfEdge( direction: CardinalDirection ): TSquareHalfEdge {
    switch( direction ) {
      case CardinalDirection.NORTH:
        return this.northHalfEdge;
      case CardinalDirection.EAST:
        return this.eastHalfEdge;
      case CardinalDirection.SOUTH:
        return this.southHalfEdge;
      case CardinalDirection.WEST:
        return this.westHalfEdge;
      default:
        throw new Error( `Invalid direction: ${direction}` );

    }
  }

  getEdge( direction: CardinalDirection ): TSquareEdge {
    switch( direction ) {
      case CardinalDirection.NORTH:
        return this.northEdge;
      case CardinalDirection.EAST:
        return this.eastEdge;
      case CardinalDirection.SOUTH:
        return this.southEdge;
      case CardinalDirection.WEST:
        return this.westEdge;
      default:
        throw new Error( `Invalid direction: ${direction}` );
    }
  }

  getVertex( direction: OrdinalDirection ): TSquareVertex {
    switch( direction ) {
      case OrdinalDirection.NORTHEAST:
        return this.northeastVertex;
      case OrdinalDirection.SOUTHEAST:
        return this.southeastVertex;
      case OrdinalDirection.SOUTHWEST:
        return this.southwestVertex;
      case OrdinalDirection.NORTHWEST:
        return this.northwestVertex;
      default:
        throw new Error( `Invalid direction: ${direction}` );
    }
  }

  getDirectionOfHalfEdge( halfEdge: TSquareHalfEdge ): CardinalDirection {
    if ( halfEdge === this.northHalfEdge ) {
      return CardinalDirection.NORTH;
    }
    else if ( halfEdge === this.eastHalfEdge ) {
      return CardinalDirection.EAST;
    }
    else if ( halfEdge === this.southHalfEdge ) {
      return CardinalDirection.SOUTH;
    }
    else if ( halfEdge === this.westHalfEdge ) {
      return CardinalDirection.WEST;
    }
    else {
      throw new Error( `Invalid half-edge: ${halfEdge}` );
    }
  }

  getDirectionOfEdge( edge: TSquareEdge ): CardinalDirection {
    if ( edge === this.northEdge ) {
      return CardinalDirection.NORTH;
    }
    else if ( edge === this.eastEdge ) {
      return CardinalDirection.EAST;
    }
    else if ( edge === this.southEdge ) {
      return CardinalDirection.SOUTH;
    }
    else if ( edge === this.westEdge ) {
      return CardinalDirection.WEST;
    }
    else {
      throw new Error( `Invalid edge: ${edge}` );
    }
  }

  getDirectionOfVertex( vertex: TSquareVertex ): OrdinalDirection {
    if ( vertex === this.northeastVertex ) {
      return OrdinalDirection.NORTHEAST;
    }
    else if ( vertex === this.southeastVertex ) {
      return OrdinalDirection.SOUTHEAST;
    }
    else if ( vertex === this.southwestVertex ) {
      return OrdinalDirection.SOUTHWEST;
    }
    else if ( vertex === this.northwestVertex ) {
      return OrdinalDirection.NORTHWEST;
    }
    else {
      throw new Error( `Invalid vertex: ${vertex}` );
    }
  }
}

export class SquareBoard extends BaseBoard<TSquareStructure> implements TBoard<TSquareStructure> {

  // For the upper-left corner of each primitive. Edges go down(south) or right(east) from this.
  public readonly getVertex: ( x: number, y: number ) => TSquareVertex | null;
  public readonly getEdge: ( x: number, y: number, orientation: Orientation ) => TSquareEdge | null;
  public readonly getHalfEdge: ( x0: number, y0: number, x1: number, y1: number ) => TSquareHalfEdge | null;
  public readonly getFace: ( x: number, y: number ) => TSquareFace | null;

  public constructor(
    // width/height for faces
    public readonly width: number,
    public readonly height: number
  ) {

    const forEachFace = ( f: ( x: number, y: number ) => void ) => {
      for ( let y = 0; y < height; y++ ) {
        for ( let x = 0; x < width; x++ ) {
          f( x, y );
        }
      }
    };

    const forEachVertex = ( f: ( x: number, y: number ) => void ) => {
      for ( let y = 0; y <= height; y++ ) {
        for ( let x = 0; x <= width; x++ ) {
          f( x, y );
        }
      }
    }

    const faces: SquareFace[] = [];
    const vertices: SquareVertex[] = [];
    const horizontalEdges: SquareEdge[] = [];
    const verticalEdges: SquareEdge[] = [];

    // upper-left of each "face" or "edge" coordinate
    const getFace = ( x: number, y: number ) => faces[ y * width + x ];
    const getVertex = ( x: number, y: number ) => vertices[ y * ( width + 1 ) + x ];
    const getHorizontalEdge = ( x: number, y: number ) => horizontalEdges[ y * width + x ];
    const getVerticalEdge = ( x: number, y: number ) => verticalEdges[ y * ( width + 1 ) + x ];

    forEachFace( ( x, y ) => {
      faces.push( new SquareFace(
        new Vector2( x, y ),
        new Vector2( x + 0.5, y + 0.5 )
      ) );
    } );

    forEachVertex( ( x, y ) => {
      vertices.push( new SquareVertex(
        new Vector2( x, y ),
        new Vector2( x, y )
      ) );
    } );

    forEachVertex( ( x, y ) => {
      const createEdge = ( start: SquareVertex, end: SquareVertex ): SquareEdge => {
        const edge = new SquareEdge( start, end );

        edge.forwardHalf = new SquareHalfEdge( start, end, false );
        edge.reversedHalf = new SquareHalfEdge( end, start, true );

        return edge;
      };

      if ( x < width ) {
        horizontalEdges.push( createEdge(
          getVertex( x, y ),
          getVertex( x + 1, y )
        ) );
      }

      if ( y < height ) {
        verticalEdges.push( createEdge(
          getVertex( x, y ),
          getVertex( x, y + 1 )
        ) );
      }
    } );

    const init: SquareInitializer = {
      width: width,
      height: height,
      getVertex: ( x, y ) => {
        if ( x < 0 || y < 0 || x > width || y > height ) {
          return null;
        }
        return getVertex( x, y );
      },
      getEdge: ( x, y, orientation ) => {
        if ( x < 0 || y < 0 ) {
          return null;
        }
        if ( orientation === Orientation.HORIZONTAL ) {
          if ( x >= width || y > height ) {
            return null;
          }
          return getHorizontalEdge( x, y );
        }
        else {
          if ( x > width || y >= height ) {
            return null;
          }
          return getVerticalEdge( x, y );
        }
      },
      getHalfEdge: ( x0, y0, x1, y1 ) => {
        if ( x0 < 0 || y0 < 0 || x1 < 0 || y1 < 0 || x0 > width || y0 > height || x1 > width || y1 > height ) {
          return null;
        }

        const x = Math.min( x0, x1 );
        const y = Math.min( y0, y1 );

        if ( x0 === x1 && Math.abs( y0 - y1 ) === 1 ) {
          const edge = getVerticalEdge( x, y );
          return y0 < y1 ? edge.forwardHalf : edge.reversedHalf;
        }
        else if ( y0 === y1 && Math.abs( x0 - x1 ) === 1 ) {
          const edge = getHorizontalEdge( x, y );
          return x0 < x1 ? edge.forwardHalf : edge.reversedHalf;
        }
        else {
          throw new Error( 'invalid request' );
        }
      },
      getFace: ( x, y ) => {
        if ( x < 0 || y < 0 || x >= width || y >= height ) {
          return null;
        }
        return getFace( x, y );
      }
    };

    forEachFace( ( x, y ) => {
      getFace( x, y ).initialize( init );
    } );

    forEachVertex( ( x, y ) => {
      getVertex( x, y ).initialize( init );
      if ( x < width ) {
        getHorizontalEdge( x, y ).initialize( init, Orientation.HORIZONTAL );
      }
      if ( y < height ) {
        getVerticalEdge( x, y ).initialize( init, Orientation.VERTICAL );
      }
    } );

    const edges: SquareEdge[] = [
      ...horizontalEdges,
      ...verticalEdges
    ];

    super( edges, vertices, faces );

    this.getVertex = init.getVertex;
    this.getEdge = init.getEdge;
    this.getHalfEdge = init.getHalfEdge;
    this.getFace = init.getFace;
  }
}
