import { Vector2 } from "phet-lib/dot";
import { CardinalDirection, OrdinalDirection } from './Direction.ts';
import { Orientation } from "phet-lib/phet-core";
import EdgeState from "./EdgeState.ts";
import FaceState from "./FaceState.ts";
import assert, { assertEnabled } from '../workarounds/assert.ts';
import _ from '../workarounds/_';
import { TEmitter, TProperty, TReadOnlyProperty, TinyEmitter, TinyProperty } from "phet-lib/axon";
import { GeneralSimpleRegionData } from './region.ts';

export interface TVertex {
  logicalCoordinates: Vector2;
  viewCoordinates: Vector2;
  incomingHalfEdges: THalfEdge[];
  outgoingHalfEdges: THalfEdge[];
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
  vertices: TVertex[];
  faces: TFace[];
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
  incomingHalfEdges: TSquareHalfEdge[];
  outgoingHalfEdges: TSquareHalfEdge[];
  edges: TSquareEdge[];
  faces: TSquareFace[];
  getHalfEdgeTo( otherVertex: TSquareVertex ): TSquareHalfEdge;
  getHalfEdgeFrom( otherVertex: TSquareVertex ): TSquareHalfEdge;
  getEdgeTo( otherVertex: TSquareVertex ): TSquareEdge;

  // Square-specific
  northIncomingHalfEdge: TSquareHalfEdge | null;
  eastIncomingHalfEdge: TSquareHalfEdge | null;
  southIncomingHalfEdge: TSquareHalfEdge | null;
  westIncomingHalfEdge: TSquareHalfEdge | null;
  northOutgoingHalfEdge: TSquareHalfEdge | null;
  eastOutgoingHalfEdge: TSquareHalfEdge | null;
  southOutgoingHalfEdge: TSquareHalfEdge | null;
  westOutgoingHalfEdge: TSquareHalfEdge | null;
  northEdge: TSquareEdge | null;
  eastEdge: TSquareEdge | null;
  southEdge: TSquareEdge | null;
  westEdge: TSquareEdge | null;
  northeastFace: TSquareFace | null;
  southeastFace: TSquareFace | null;
  southwestFace: TSquareFace | null;
  northwestFace: TSquareFace | null;
  getIncomingHalfEdge( direction: CardinalDirection ): TSquareHalfEdge | null;
  getOutgoingHalfEdge( direction: CardinalDirection ): TSquareHalfEdge | null;
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
export type TState<Data> = {
  clone(): TState<Data>;
  createDelta(): TDelta<Data>;
} & Data;

export interface TAction<Data> {
  // TODO: consider a concept of "will this do anything?" - when would we use that?
  apply( state: Data ): void;
  getUndo( state: Data ): TAction<Data>; // the action to undo this action (if we applied the action on it).

  // TODO: What are we... intending with this?
  isEmpty(): boolean;
};

// TODO: create actions which apply auto-solve after the action is applied?

export type TDelta<Data> = {
  // Refine the clone from a TState => TDelta
  clone(): TDelta<Data>;

  // TODO: do we really need anything here? createConsolidatedAction?
} & TState<Data> & TAction<Data>;

export interface TFaceData {
  getFaceState( face: TFace ): FaceState;
  setFaceState( face: TFace, state: FaceState ): void;

  // TODO: consider passing in the old value?
  faceStateChangedEmitter: TEmitter<[ TFace, FaceState ]>;
}

export type TFaceDataListener = ( face: TFace, state: FaceState ) => void;

export interface TEdgeData {
  getEdgeState( edge: TEdge ): EdgeState;
  setEdgeState( edge: TEdge, state: EdgeState ): void;

  // TODO: consider passing in the old value?
  edgeStateChangedEmitter: TEmitter<[ TEdge, EdgeState ]>;
};

export type TEdgeDataListener = ( edge: TEdge, state: EdgeState ) => void;


export interface TSimpleRegion {
  id: number; // tracked across simple regions over time
  a: TVertex;
  b: TVertex;
  halfEdges: THalfEdge[]; // for simple regions, these are ordered from a to b
  edges: TEdge[]; // for simple regions, these are ordered from a to b
}

export interface TSimpleRegionData {
  getSimpleRegions(): TSimpleRegion[];
  getSimpleRegionWithVertex( vertex: TVertex ): TSimpleRegion | null;
  getSimpleRegionWithEdge( edge: TEdge ): TSimpleRegion | null;
  getSimpleRegionWithId( id: number ): TSimpleRegion | null;
  getWeirdEdges(): TEdge[];

  modifyRegions(
    addedRegions: Iterable<TSimpleRegion>,
    removedRegions: Iterable<TSimpleRegion>,
    addedWeirdEdges: Iterable<TEdge>,
    removedWeirdEdges: Iterable<TEdge>
  ): void;

  simpleRegionsChangedEmitter: TEmitter<[
    addedRegions: Iterable<TSimpleRegion>,
    removedRegions: Iterable<TSimpleRegion>,
    addedWeirdEdges: Iterable<TEdge>,
    removedWeirdEdges: Iterable<TEdge>
  ]>;
}

export type TSimpleRegionDataListener = ( simpleRegions: Iterable<TSimpleRegion> ) => void;

export class CompositeAction<State> implements TAction<State> {

  public constructor(
    public readonly actions: TAction<State>[]
  ) {}

  public apply( state: State ): void {
    for ( let i = 0; i < this.actions.length; i++ ) {
      this.actions[ i ].apply( state );
    }
  }

  public getUndo( state: State ): TAction<State> {
    return new CompositeAction( this.actions.map( action => action.getUndo( state ) ).reverse() );
  }

  public isEmpty(): boolean {
    return this.actions.some( action => !action.isEmpty() );
  }
}

export class FaceStateSetAction implements TAction<TFaceData> {

  public constructor(
    public readonly face: TFace,
    public readonly state: FaceState
  ) {}

  public apply( state: TFaceData ): void {
    state.setFaceState( this.face, this.state );
  }

  public getUndo( state: TFaceData ): TAction<TFaceData> {
    const previousState = state.getFaceState( this.face );
    return new FaceStateSetAction( this.face, previousState );
  }

  public isEmpty(): boolean {
    return false;
  }
}

export class EdgeStateSetAction implements TAction<TEdgeData> {

  public constructor(
    public readonly edge: TEdge,
    public readonly state: EdgeState
  ) {}

  public apply( state: TEdgeData ): void {
    state.setEdgeState( this.edge, this.state );
  }

  public getUndo( state: TEdgeData ): TAction<TEdgeData> {
    const previousState = state.getEdgeState( this.edge );
    return new EdgeStateSetAction( this.edge, previousState );
  }

  public isEmpty(): boolean {
    return false;
  }
}

// TODO: immediate user repeat of "toggle" should undo auto-solve (that is probably out of the scope of these simple actions)
// TODO: Potentially a UserEdgeStateToggleAction that does this and other things?
export class EdgeStateCycleAction implements TAction<TEdgeData> {

  public constructor(
    public readonly edge: TEdge,
    public readonly forward: boolean = true
  ) {}

  public apply( state: TEdgeData ): void {
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

  public getUndo( _state: TEdgeData ): TAction<TEdgeData> {
    return new EdgeStateCycleAction( this.edge, !this.forward );
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

export type TBoard<Structure extends TStructure = TStructure> = {
  edges: Structure[ 'Edge' ][];
  vertices: Structure[ 'Vertex' ][];
  faces: Structure[ 'Face' ][];
};

export type TSquareBoard<Structure extends TSquareStructure = TSquareStructure> = {
  // Number of faces in each direction
  width: number;
  height: number;

  getVertex: ( x: number, y: number ) => TSquareVertex | null;
  getEdge: ( x: number, y: number, orientation: Orientation ) => TSquareEdge | null;
  getHalfEdge: ( x0: number, y0: number, x1: number, y1: number ) => TSquareHalfEdge | null;
  getFace: ( x: number, y: number ) => TSquareFace | null;
} & TBoard<Structure>;

export type TReadOnlyPuzzle<Structure extends TStructure = TStructure, State extends TState<TFaceData> = TState<TFaceData>> = {
  board: TBoard<Structure>;
  stateProperty: TReadOnlyProperty<State>;
};

export type TPuzzle<Structure extends TStructure = TStructure, State extends TState<TFaceData> = TState<TFaceData>> = {
  board: TBoard<Structure>;
  stateProperty: TProperty<State>;
};

export type TSquarePuzzle<Structure extends TSquareStructure = TSquareStructure, State extends TState<TFaceData> = TState<TFaceData>> = {
  board: TSquareBoard<Structure>;
  stateProperty: TProperty<State>;
};

export type TReadOnlySquarePuzzle<Structure extends TSquareStructure = TSquareStructure, State extends TState<TFaceData> = TState<TFaceData>> = {
  board: TSquareBoard<Structure>;
  stateProperty: TReadOnlyProperty<State>;
};

export class BaseVertex<Structure extends TStructure> implements TVertex {

  // Half-edges with this vertex as their end vertex, in CCW order
  public incomingHalfEdges!: Structure[ 'HalfEdge' ][];

  // Half-edges with this vertex as their start vertex, in CCW order
  public outgoingHalfEdges!: Structure[ 'HalfEdge' ][];

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
    const halfEdge = this.outgoingHalfEdges.find( halfEdge => halfEdge.end === otherVertex );
    assertEnabled() && assert( halfEdge );
    return halfEdge!;
  }

  public getHalfEdgeFrom( otherVertex: Structure[ 'Vertex' ] ): Structure[ 'HalfEdge' ] {
    const halfEdge = this.incomingHalfEdges.find( halfEdge => halfEdge.start === otherVertex )!;
    assertEnabled() && assert( halfEdge );
    return halfEdge!;
  }

  public getEdgeTo( otherVertex: Structure[ 'Vertex' ] ): Structure[ 'Edge' ] {
    const edge = this.edges.find( edge => edge.start === otherVertex || edge.end === otherVertex )!;
    assertEnabled() && assert( edge );
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

  public vertices!: Structure[ 'Vertex' ][];
  public faces!: Structure[ 'Face' ][];

  public constructor(
    public readonly start: Structure[ 'Vertex' ],
    public readonly end: Structure[ 'Vertex' ]
  ) {}

  public getOtherVertex( vertex: Structure[ 'Vertex' ] ): Structure[ 'Vertex' ] {
    assertEnabled() && assert( vertex === this.start || vertex === this.end, 'vertex must be one of the two vertices of this edge' );

    return vertex === this.start ? this.end : this.start;
  }

  public getOtherFace( face: Structure[ 'Face' ] | null ): Structure[ 'Face' ] | null {
    assertEnabled() && assert( face === this.forwardFace || face === this.reversedFace, 'face must be one of the two faces of this edge' );

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
  public northIncomingHalfEdge: TSquareHalfEdge | null = null;
  public eastIncomingHalfEdge: TSquareHalfEdge | null = null;
  public southIncomingHalfEdge: TSquareHalfEdge | null = null;
  public westIncomingHalfEdge: TSquareHalfEdge | null = null;
  public northOutgoingHalfEdge: TSquareHalfEdge | null = null;
  public eastOutgoingHalfEdge: TSquareHalfEdge | null = null;
  public southOutgoingHalfEdge: TSquareHalfEdge | null = null;
  public westOutgoingHalfEdge: TSquareHalfEdge | null = null;
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

    this.westIncomingHalfEdge = this.westEdge ? this.westEdge.forwardHalf : null;
    this.northIncomingHalfEdge = this.northEdge ? this.northEdge.forwardHalf : null;
    this.eastIncomingHalfEdge = this.eastEdge ? this.eastEdge.reversedHalf : null;
    this.southIncomingHalfEdge = this.southEdge ? this.southEdge.reversedHalf : null;
    this.westOutgoingHalfEdge = this.westEdge ? this.westEdge.reversedHalf : null;
    this.northOutgoingHalfEdge = this.northEdge ? this.northEdge.reversedHalf : null;
    this.eastOutgoingHalfEdge = this.eastEdge ? this.eastEdge.forwardHalf : null;
    this.southOutgoingHalfEdge = this.southEdge ? this.southEdge.forwardHalf : null;

    this.northwestFace = init.getFace( x - 1, y - 1 );
    this.northeastFace = init.getFace( x, y - 1 );
    this.southeastFace = init.getFace( x, y );
    this.southwestFace = init.getFace( x - 1, y );

    this.incomingHalfEdges = [
      this.westIncomingHalfEdge,
      this.southIncomingHalfEdge,
      this.eastIncomingHalfEdge,
      this.northIncomingHalfEdge
    ].filter( e => e !== null ) as TSquareHalfEdge[];

    this.outgoingHalfEdges = [
      this.westOutgoingHalfEdge,
      this.southOutgoingHalfEdge,
      this.eastOutgoingHalfEdge,
      this.northOutgoingHalfEdge
    ].filter( e => e !== null ) as TSquareHalfEdge[];

    this.edges = [ this.westEdge, this.southEdge, this.eastEdge, this.northEdge ].filter( e => e !== null ) as TSquareEdge[];
    this.faces = [ this.northwestFace, this.southwestFace, this.southeastFace, this.northeastFace ].filter( e => e !== null ) as TSquareFace[];
  }

  getIncomingHalfEdge( direction: CardinalDirection ): TSquareHalfEdge | null {
    switch ( direction ) {
      case CardinalDirection.NORTH:
        return this.northIncomingHalfEdge;
      case CardinalDirection.EAST:
        return this.eastIncomingHalfEdge;
      case CardinalDirection.SOUTH:
        return this.southIncomingHalfEdge;
      case CardinalDirection.WEST:
        return this.westIncomingHalfEdge;
      default:
        throw new Error( `Invalid direction: ${direction}` );
    }
  }

  getOutgoingHalfEdge( direction: CardinalDirection ): TSquareHalfEdge | null {
    switch ( direction ) {
      case CardinalDirection.NORTH:
        return this.northOutgoingHalfEdge;
      case CardinalDirection.EAST:
        return this.eastOutgoingHalfEdge;
      case CardinalDirection.SOUTH:
        return this.southOutgoingHalfEdge;
      case CardinalDirection.WEST:
        return this.westOutgoingHalfEdge;
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
    if ( halfEdge === this.northIncomingHalfEdge ) {
      return CardinalDirection.NORTH;
    }
    else if ( halfEdge === this.eastIncomingHalfEdge ) {
      return CardinalDirection.EAST;
    }
    else if ( halfEdge === this.southIncomingHalfEdge ) {
      return CardinalDirection.SOUTH;
    }
    else if ( halfEdge === this.westIncomingHalfEdge ) {
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
    assertEnabled() && assert( delta.magnitude === 1 );
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
    this.vertices = [ this.start, this.end ];
    this.faces = [ this.forwardFace, this.reversedFace ].filter( f => f !== null ) as TSquareFace[];

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

    this.northEdge = init.getEdge( x, y, Orientation.HORIZONTAL )!;
    this.westEdge = init.getEdge( x, y, Orientation.VERTICAL )!;
    this.southEdge = init.getEdge( x, y + 1, Orientation.HORIZONTAL )!;
    this.eastEdge = init.getEdge( x + 1, y, Orientation.VERTICAL )!;

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

export class SquareBoard extends BaseBoard<TSquareStructure> implements TSquareBoard {

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

    assertEnabled() && validateSquareBoard( this );
  }
}

export const validateBoard = ( board: TBoard ): void => {
  if ( !assertEnabled() ) {
    return;
  }

  board.edges.forEach( edge => {
    const forwardHalf = edge.forwardHalf;
    const reversedHalf = edge.reversedHalf;

    assert( forwardHalf.edge === edge );
    assert( reversedHalf.edge === edge );
    assert( !forwardHalf.isReversed );
    assert( reversedHalf.isReversed );

    assert( forwardHalf.reversed === reversedHalf );
    assert( reversedHalf.reversed === forwardHalf );

    assert( forwardHalf.start === edge.start );
    assert( forwardHalf.end === edge.end );
    assert( reversedHalf.start === edge.end );
    assert( reversedHalf.end === edge.start );

    assert( forwardHalf.next.previous === forwardHalf );
    assert( forwardHalf.previous.next === forwardHalf );
    assert( reversedHalf.next.previous === reversedHalf );
    assert( reversedHalf.previous.next === reversedHalf );
    assert( forwardHalf.next !== forwardHalf );
    assert( forwardHalf.previous !== forwardHalf );
    assert( reversedHalf.next !== reversedHalf );
    assert( reversedHalf.previous !== reversedHalf );

    assert( forwardHalf.next.face === forwardHalf.face );
    assert( forwardHalf.previous.face === forwardHalf.face );
    assert( reversedHalf.next.face === reversedHalf.face );
    assert( reversedHalf.previous.face === reversedHalf.face );

    assert( forwardHalf.face === edge.forwardFace );
    assert( reversedHalf.face === edge.reversedFace );
  } );

  board.vertices.forEach( vertex => {
    vertex.incomingHalfEdges.forEach( halfEdge => {
      assert( halfEdge.end === vertex );
    } );
    vertex.outgoingHalfEdges.forEach( halfEdge => {
      assert( halfEdge.start === vertex );
    } );
    const getIncomingHalfEdge = ( n: number ) => vertex.incomingHalfEdges[ ( n + vertex.incomingHalfEdges.length ) % vertex.incomingHalfEdges.length ];
    const getOutgoingHalfEdge = ( n: number ) => vertex.outgoingHalfEdges[ ( n + vertex.outgoingHalfEdges.length ) % vertex.outgoingHalfEdges.length ];
    _.range( 0, vertex.incomingHalfEdges.length ).forEach( i => {
      const incoming = getIncomingHalfEdge( i );
      const outgoing = getOutgoingHalfEdge( i );
      assert( incoming.reversed === outgoing );

      assert( incoming.next === getOutgoingHalfEdge( i - 1 ) );
      assert( outgoing.previous === getIncomingHalfEdge( i + 1 ) );
    } );
    vertex.edges.forEach( edge => {
      assert( edge.start === vertex || edge.end === vertex );
      assert( vertex.incomingHalfEdges.includes( edge.forwardHalf ) || vertex.outgoingHalfEdges.includes( edge.forwardHalf ) );
      assert( vertex.incomingHalfEdges.includes( edge.reversedHalf ) || vertex.outgoingHalfEdges.includes( edge.reversedHalf ) );

      if ( edge.forwardFace ) {
        assert( edge.forwardFace.vertices.includes( vertex ) );
        assert( vertex.faces.includes( edge.forwardFace ) );
      }
      if ( edge.reversedFace ) {
        assert( edge.reversedFace.vertices.includes( vertex ) );
        assert( vertex.faces.includes( edge.reversedFace ) );
      }
    } );
    vertex.faces.forEach( face => {
      assert( face.vertices.includes( vertex ) );
    } );
  } );
};

export const validateSquareBoard = ( board: TSquareBoard ): void => {

  if ( !assertEnabled() ) {
    return;
  }
  validateBoard( board );

  board.vertices.forEach( vertex => {
    const atTop = vertex.logicalCoordinates.y === 0;
    const atBottom = vertex.logicalCoordinates.y === board.height;
    const atLeft = vertex.logicalCoordinates.x === 0;
    const atRight = vertex.logicalCoordinates.x === board.width;

    assert( ( vertex.northIncomingHalfEdge === null ) === atTop );
    assert( ( vertex.eastIncomingHalfEdge === null ) === atRight );
    assert( ( vertex.southIncomingHalfEdge === null ) === atBottom );
    assert( ( vertex.westIncomingHalfEdge === null ) === atLeft );
    assert( ( vertex.northOutgoingHalfEdge === null ) === atTop );
    assert( ( vertex.eastOutgoingHalfEdge === null ) === atRight );
    assert( ( vertex.southOutgoingHalfEdge === null ) === atBottom );
    assert( ( vertex.westOutgoingHalfEdge === null ) === atLeft );
    assert( ( vertex.northEdge === null ) === atTop );
    assert( ( vertex.eastEdge === null ) === atRight );
    assert( ( vertex.southEdge === null ) === atBottom );
    assert( ( vertex.westEdge === null ) === atLeft );

    const checkEdges = (
      edge: TSquareEdge,
      incomingHalfEdge: TSquareHalfEdge,
      outgoingHalfEdge: TSquareHalfEdge,
      direction: CardinalDirection
    ) => {
      assert( edge.forwardHalf === incomingHalfEdge || edge.forwardHalf === outgoingHalfEdge );
      assert( edge.reversedHalf === incomingHalfEdge || edge.reversedHalf === outgoingHalfEdge );
      assert( incomingHalfEdge.reversed === outgoingHalfEdge );

      const coordinate = vertex.logicalCoordinates.plus( direction.delta );
      assert( incomingHalfEdge.start.logicalCoordinates.equals( coordinate ) );
      assert( outgoingHalfEdge.end.logicalCoordinates.equals( coordinate ) );
      assert( incomingHalfEdge.end.logicalCoordinates.equals( vertex.logicalCoordinates ) );
      assert( outgoingHalfEdge.start.logicalCoordinates.equals( vertex.logicalCoordinates ) );
    };
    if ( !atTop ) {
      checkEdges( vertex.northEdge!, vertex.northIncomingHalfEdge!, vertex.northOutgoingHalfEdge!, CardinalDirection.NORTH );
    }
    if ( !atRight ) {
      checkEdges( vertex.eastEdge!, vertex.eastIncomingHalfEdge!, vertex.eastOutgoingHalfEdge!, CardinalDirection.EAST );
    }
    if ( !atBottom ) {
      checkEdges( vertex.southEdge!, vertex.southIncomingHalfEdge!, vertex.southOutgoingHalfEdge!, CardinalDirection.SOUTH );
    }
    if ( !atLeft ) {
      checkEdges( vertex.westEdge!, vertex.westIncomingHalfEdge!, vertex.westOutgoingHalfEdge!, CardinalDirection.WEST );
    }

    assert( ( vertex.northeastFace === null ) === ( atTop || atRight ) );
    assert( ( vertex.southeastFace === null ) === ( atBottom || atRight ) );
    assert( ( vertex.southwestFace === null ) === ( atBottom || atLeft ) );
    assert( ( vertex.northwestFace === null ) === ( atTop || atLeft ) );
  } );

  board.edges.forEach( edge => {
    assert( edge.northVertex === edge.forwardHalf.northVertex );
    assert( edge.eastVertex === edge.forwardHalf.eastVertex );
    assert( edge.southVertex === edge.forwardHalf.southVertex );
    assert( edge.westVertex === edge.forwardHalf.westVertex );
    assert( edge.northVertex === edge.reversedHalf.northVertex );
    assert( edge.eastVertex === edge.reversedHalf.eastVertex );
    assert( edge.southVertex === edge.reversedHalf.southVertex );
    assert( edge.westVertex === edge.reversedHalf.westVertex );

    assert( edge.orientation === edge.forwardHalf.orientation );
    assert( edge.orientation === edge.reversedHalf.orientation );

    if ( edge.orientation === Orientation.HORIZONTAL ) {
      assert( edge.westFace === null );
      assert( edge.eastFace === null );

      assert( edge.westVertex !== null );
      assert( edge.eastVertex !== null );
      assert( edge.northFace === edge.forwardFace );
      assert( edge.southFace === edge.reversedFace );
    }
    else {
      assert( edge.northFace === null );
      assert( edge.southFace === null );

      assert( edge.northVertex !== null );
      assert( edge.southVertex !== null );
      assert( edge.eastFace === edge.forwardFace );
      assert( edge.westFace === edge.reversedFace );
    }
  } );

  board.faces.forEach( face => {
    assert( face.northHalfEdge.face === face );
    assert( face.eastHalfEdge.face === face );
    assert( face.southHalfEdge.face === face );
    assert( face.westHalfEdge.face === face );

    // Loop around face
    assert( face.northHalfEdge.next === face.westHalfEdge );
    assert( face.westHalfEdge.next === face.southHalfEdge );
    assert( face.southHalfEdge.next === face.eastHalfEdge );
    assert( face.eastHalfEdge.next === face.northHalfEdge );

    assert( face.northHalfEdge.edge === face.northEdge );
    assert( face.eastHalfEdge.edge === face.eastEdge );
    assert( face.southHalfEdge.edge === face.southEdge );
    assert( face.westHalfEdge.edge === face.westEdge );

    assert( face.northwestVertex === face.northEdge.start );
    assert( face.northwestVertex === face.westEdge.start );
    assert( face.northeastVertex === face.northEdge.end );
    assert( face.northeastVertex === face.eastEdge.start );
    assert( face.southwestVertex === face.southEdge.start );
    assert( face.southwestVertex === face.westEdge.end );
    assert( face.southeastVertex === face.southEdge.end );
    assert( face.southeastVertex === face.eastEdge.end );
  } );
};

export interface TFaceData {
  getFaceState( face: TFace ): FaceState;
  setFaceState( face: TFace, state: FaceState ): void;
}

export interface TEdgeData {
  getEdgeState( edge: TEdge ): EdgeState;
  setEdgeState( edge: TEdge, state: EdgeState ): void;
};

export interface TFaceEdgeData extends TFaceData, TEdgeData {};

export interface TCompleteData extends TFaceData, TEdgeData, TSimpleRegionData {};

// TODO: faster forms for Square in particular
// TODO: abstract out structure here
export class GeneralFaceData implements TState<TFaceData> {

  public readonly faceStateChangedEmitter = new TinyEmitter<[ TFace, FaceState ]>();

  public readonly faceStateMap: Map<TFace, FaceState> = new Map();

  public constructor(
    public readonly board: TBoard,
    getInitialFaceState: ( face: TFace ) => FaceState,
  ) {
    board.faces.forEach( face => {
      this.faceStateMap.set( face, getInitialFaceState( face ) );
    } );
  }

  public getFaceState( face: TFace ): FaceState {
    assertEnabled() && assert( this.faceStateMap.has( face ) );

    return this.faceStateMap.get( face )!;
  }

  public setFaceState( face: TFace, state: FaceState ): void {
    assertEnabled() && assert( this.faceStateMap.has( face ) );

    const oldState = this.faceStateMap.get( face )!;

    if ( oldState !== state ) {
      this.faceStateMap.set( face, state );

      this.faceStateChangedEmitter.emit( face, state );
    }
  }

  public clone(): GeneralFaceData {
    return new GeneralFaceData( this.board, face => this.getFaceState( face ) );
  }

  public createDelta(): TDelta<TFaceData> {
    return new GeneralFaceDelta( this.board, this );
  }
}

export class GeneralFaceAction implements TAction<TFaceData> {
  public constructor(
    public readonly board: TBoard,
    public readonly faceStateMap: Map<TFace, FaceState> = new Map()
  ) {}

  public apply( state: TFaceData ): void {
    for ( const [ face, faceState ] of this.faceStateMap ) {
      state.setFaceState( face, faceState );
    }
  }

  public getUndo( state: TFaceData ): TAction<TFaceData> {
    const faceStateMap = new Map<TFace, FaceState>();

    for ( const [ face, _faceState ] of this.faceStateMap ) {
      faceStateMap.set( face, state.getFaceState( face ) );
    }

    return new GeneralFaceAction( this.board, faceStateMap );
  }

  public isEmpty(): boolean {
    return this.faceStateMap.size === 0;
  }
}

export class GeneralFaceDelta extends GeneralFaceAction implements TDelta<TFaceData> {

  public readonly faceStateChangedEmitter = new TinyEmitter<[ TFace, FaceState ]>();

  public constructor(
    board: TBoard,
    public readonly parentState: TState<TFaceData>,
    faceStateMap: Map<TFace, FaceState> = new Map()
  ) {
    super( board, faceStateMap );
  }

  public getFaceState( face: TFace ): FaceState {
    if ( this.faceStateMap.has( face ) ) {
      return this.faceStateMap.get( face )!;
    }
    else {
      return this.parentState.getFaceState( face );
    }
  }

  public setFaceState( face: TFace, state: FaceState ): void {
    const oldState = this.getFaceState( face );

    if ( oldState !== state ) {
      this.faceStateMap.set( face, state );

      this.faceStateChangedEmitter.emit( face, state );
    }
  }

  public clone(): GeneralFaceDelta {
    return new GeneralFaceDelta( this.board, this.parentState, new Map( this.faceStateMap ) );
  }

  public createDelta(): TDelta<TFaceData> {
    return new GeneralFaceDelta( this.board, this, new Map() );
  }
}

// TODO: faster forms for Square in particular (bit-pack the states!)
export class GeneralEdgeData implements TState<TEdgeData> {

  public readonly edgeStateChangedEmitter = new TinyEmitter<[ TEdge, EdgeState ]>();

  public readonly edgeStateMap: Map<TEdge, EdgeState> = new Map();

  public constructor(
    public readonly board: TBoard,
    getInitialEdgeState: ( edge: TEdge ) => EdgeState,
  ) {
    board.edges.forEach( edge => {
      this.edgeStateMap.set( edge, getInitialEdgeState( edge ) );
    } );
  }

  public getEdgeState( edge: TEdge ): EdgeState {
    assertEnabled() && assert( this.edgeStateMap.has( edge ) );

    return this.edgeStateMap.get( edge )!;
  }

  public setEdgeState( edge: TEdge, state: EdgeState ): void {
    assertEnabled() && assert( this.edgeStateMap.has( edge ) );

    const oldState = this.edgeStateMap.get( edge )!;

    if ( oldState !== state ) {
      this.edgeStateMap.set( edge, state );

      this.edgeStateChangedEmitter.emit( edge, state );
    }
  }

  public clone(): GeneralEdgeData {
    return new GeneralEdgeData( this.board, edge => this.getEdgeState( edge ) );
  }

  public createDelta(): TDelta<TEdgeData> {
    return new GeneralEdgeDelta( this.board, this );
  }
}

// TODO: we have some duplication, ideally factor out the PerElementData/PerElementAction/PerElementDelta

export class GeneralEdgeAction implements TAction<TEdgeData> {
  public constructor(
    public readonly board: TBoard,
    public readonly edgeStateMap: Map<TEdge, EdgeState> = new Map()
  ) {}

  public apply( state: TEdgeData ): void {
    for ( const [ edge, edgeState ] of this.edgeStateMap ) {
      state.setEdgeState( edge, edgeState );
    }
  }

  public getUndo( state: TEdgeData ): TAction<TEdgeData> {
    const edgeStateMap = new Map<TEdge, EdgeState>();

    for ( const [ edge, _edgeState ] of this.edgeStateMap ) {
      edgeStateMap.set( edge, state.getEdgeState( edge ) );
    }

    return new GeneralEdgeAction( this.board, edgeStateMap );
  }

  public isEmpty(): boolean {
    return this.edgeStateMap.size === 0;
  }
}

export class GeneralEdgeDelta extends GeneralEdgeAction implements TDelta<TEdgeData> {

  public readonly edgeStateChangedEmitter = new TinyEmitter<[ TEdge, EdgeState ]>();

  public constructor(
    board: TBoard,
    public readonly parentState: TState<TEdgeData>,
    edgeStateMap: Map<TEdge, EdgeState> = new Map()
  ) {
    super( board, edgeStateMap );
  }

  public getEdgeState( edge: TEdge ): EdgeState {
    if ( this.edgeStateMap.has( edge ) ) {
      return this.edgeStateMap.get( edge )!;
    }
    else {
      return this.parentState.getEdgeState( edge );
    }
  }

  public setEdgeState( edge: TEdge, state: EdgeState ): void {
    const oldState = this.getEdgeState( edge );

    if ( oldState !== state ) {
      this.edgeStateMap.set( edge, state );

      this.edgeStateChangedEmitter.emit( edge, state );
    }
  }

  public clone(): GeneralEdgeDelta {
    return new GeneralEdgeDelta( this.board, this.parentState, new Map( this.edgeStateMap ) );
  }

  public createDelta(): TDelta<TEdgeData> {
    return new GeneralEdgeDelta( this.board, this, new Map() );
  }
}

// TODO: can we do trait/mixin stuff to support a better way of doing this? TS has been picky with traits before
export class CompleteData implements TState<TCompleteData> {
  public constructor(
    public readonly faceData: TState<TFaceData>,
    public readonly edgeData: TState<TEdgeData>,
    public readonly simpleRegionData: TState<TSimpleRegionData>
  ) {}

  public static fromFacesEdges(
    board: TBoard,
    getInitialFaceState: ( face: TFace ) => FaceState,
    getInitialEdgeState: ( edge: TEdge ) => EdgeState
  ): CompleteData {
    return new CompleteData(
      new GeneralFaceData( board, getInitialFaceState ),
      new GeneralEdgeData( board, getInitialEdgeState ),
      new GeneralSimpleRegionData( board )
    );
  }

  public static fromFaces(
    board: TBoard,
    getInitialFaceState: ( face: TFace ) => FaceState
  ): CompleteData {
    return CompleteData.fromFacesEdges( board, getInitialFaceState, () => EdgeState.WHITE );
  }

  public getFaceState( face: TFace ): FaceState {
    return this.faceData.getFaceState( face );
  }

  public setFaceState( face: TFace, state: FaceState ): void {
    this.faceData.setFaceState( face, state );
  }

  public get faceStateChangedEmitter(): TEmitter<[ TFace, FaceState ]> {
    return this.faceData.faceStateChangedEmitter;
  }

  public getEdgeState( edge: TEdge ): EdgeState {
    return this.edgeData.getEdgeState( edge );
  }

  public setEdgeState( edge: TEdge, state: EdgeState ): void {
    this.edgeData.setEdgeState( edge, state );
  }

  public get edgeStateChangedEmitter(): TEmitter<[ TEdge, EdgeState ]> {
    return this.edgeData.edgeStateChangedEmitter;
  }

  public getSimpleRegions(): TSimpleRegion[] {
    return this.simpleRegionData.getSimpleRegions();
  }

  public getSimpleRegionWithVertex( vertex: TVertex ): TSimpleRegion | null {
    return this.simpleRegionData.getSimpleRegionWithVertex( vertex );
  }
  public getSimpleRegionWithEdge( edge: TEdge ): TSimpleRegion | null {
    return this.simpleRegionData.getSimpleRegionWithEdge( edge );
  }

  public getSimpleRegionWithId( id: number ): TSimpleRegion | null {
    return this.simpleRegionData.getSimpleRegionWithId( id );
  }

  public getWeirdEdges(): TEdge[] {
    return this.simpleRegionData.getWeirdEdges();
  }

  public modifyRegions(
    addedRegions: Iterable<TSimpleRegion>,
    removedRegions: Iterable<TSimpleRegion>,
    addedWeirdEdges: Iterable<TEdge>,
    removedWeirdEdges: Iterable<TEdge>
  ): void {
    this.simpleRegionData.modifyRegions( addedRegions, removedRegions, addedWeirdEdges, removedWeirdEdges );
  }

  public get simpleRegionsChangedEmitter(): TEmitter<[
    addedRegions: Iterable<TSimpleRegion>,
    removedRegions: Iterable<TSimpleRegion>,
    addedWeirdEdges: Iterable<TEdge>,
    removedWeirdEdges: Iterable<TEdge>
  ]> {
    return this.simpleRegionData.simpleRegionsChangedEmitter;
  }

  public clone(): CompleteData {
    return new CompleteData( this.faceData.clone(), this.edgeData.clone(), this.simpleRegionData.clone() );
  }

  public createDelta(): TDelta<TCompleteData> {
    return new CompleteDelta(
      this.faceData.createDelta(),
      this.edgeData.createDelta(),
      this.simpleRegionData.createDelta()
    );
  }
}

export class CompleteAction implements TAction<TCompleteData> {
  public constructor(
    public readonly faceAction: TAction<TFaceData>,
    public readonly edgeAction: TAction<TEdgeData>,
    public readonly simpleRegionAction: TAction<TSimpleRegionData>
  ) {}

  public apply( state: TCompleteData ): void {
    this.faceAction.apply( state );
    this.edgeAction.apply( state );
    this.simpleRegionAction.apply( state );
  }

  public getUndo( state: TCompleteData ): TAction<TCompleteData> {
    return new CompleteAction( this.faceAction.getUndo( state ), this.edgeAction.getUndo( state ), this.simpleRegionAction.getUndo( state ) );
  }

  public isEmpty(): boolean {
    return this.faceAction.isEmpty() && this.edgeAction.isEmpty() && this.simpleRegionAction.isEmpty();
  }
}

export class CompleteDelta extends CompleteAction implements TDelta<TCompleteData> {
  public constructor(
    public readonly faceDelta: TDelta<TFaceData>,
    public readonly edgeDelta: TDelta<TEdgeData>,
    public readonly simpleRegionDelta: TDelta<TSimpleRegionData>
  ) {
    super( faceDelta, edgeDelta, simpleRegionDelta );
  }

  public getFaceState( face: TFace ): FaceState {
    return this.faceDelta.getFaceState( face );
  }

  public setFaceState( face: TFace, state: FaceState ): void {
    this.faceDelta.setFaceState( face, state );
  }

  public get faceStateChangedEmitter(): TEmitter<[ TFace, FaceState ]> {
    return this.faceDelta.faceStateChangedEmitter;
  }

  public getEdgeState( edge: TEdge ): EdgeState {
    return this.edgeDelta.getEdgeState( edge );
  }

  public setEdgeState( edge: TEdge, state: EdgeState ): void {
    this.edgeDelta.setEdgeState( edge, state );
  }

  public get edgeStateChangedEmitter(): TEmitter<[ TEdge, EdgeState ]> {
    return this.edgeDelta.edgeStateChangedEmitter;
  }

  public getSimpleRegions(): TSimpleRegion[] {
    return this.simpleRegionDelta.getSimpleRegions();
  }

  public getSimpleRegionWithVertex( vertex: TVertex ): TSimpleRegion | null {
    return this.simpleRegionDelta.getSimpleRegionWithVertex( vertex );
  }
  public getSimpleRegionWithEdge( edge: TEdge ): TSimpleRegion | null {
    return this.simpleRegionDelta.getSimpleRegionWithEdge( edge );
  }

  public getSimpleRegionWithId( id: number ): TSimpleRegion | null {
    return this.simpleRegionDelta.getSimpleRegionWithId( id );
  }

  public getWeirdEdges(): TEdge[] {
    return this.simpleRegionDelta.getWeirdEdges();
  }

  public modifyRegions(
    addedRegions: Iterable<TSimpleRegion>,
    removedRegions: Iterable<TSimpleRegion>,
    addedWeirdEdges: Iterable<TEdge>,
    removedWeirdEdges: Iterable<TEdge>
  ): void {
    this.simpleRegionDelta.modifyRegions( addedRegions, removedRegions, addedWeirdEdges, removedWeirdEdges );
  }

  public get simpleRegionsChangedEmitter(): TEmitter<[
    addedRegions: Iterable<TSimpleRegion>,
    removedRegions: Iterable<TSimpleRegion>,
    addedWeirdEdges: Iterable<TEdge>,
    removedWeirdEdges: Iterable<TEdge>
  ]> {
    return this.simpleRegionDelta.simpleRegionsChangedEmitter;
  }

  public clone(): CompleteDelta {
    return new CompleteDelta( this.faceDelta.clone(), this.edgeDelta.clone(), this.simpleRegionDelta.clone() );
  }

  public createDelta(): TDelta<TCompleteData> {
    return new CompleteDelta( this.faceDelta.createDelta(), this.edgeDelta.createDelta(), this.simpleRegionDelta.createDelta() );
  }
}

export class BasicPuzzle<Data> {

  public readonly stateProperty: TProperty<TState<Data>>;

  public constructor(
    public readonly board: TBoard,
    initialState: TState<Data>
  ) {
    this.stateProperty = new TinyProperty( initialState );
  }
}

export class BasicSquarePuzzle<Data> {

  public readonly stateProperty: TProperty<TState<Data>>;

  public constructor(
    public readonly board: TSquareBoard,
    initialState: TState<Data>
  ) {
    this.stateProperty = new TinyProperty( initialState );
  }

  /**
   * The format is:
   *
   * `${width}x${height} ${faceValues}`
   *
   * where faceValues is a string of length width * height, with 0/1/2/3 for numbers, or `.` for blank faces (for null).
   */
  public static loadFromSimpleString( str: string ): BasicSquarePuzzle<TCompleteData> {
    const [ size, faceValues ] = str.split( ' ' );
    const [ width, height ] = size.split( 'x' ).map( x => parseInt( x ) );

    const board = new SquareBoard( width, height );

    const state = CompleteData.fromFaces( board, face => {
      const index = face.logicalCoordinates.y * width + face.logicalCoordinates.x;
      const value = faceValues[ index ];
      if ( value === '.' ) {
        return null;
      }
      else {
        return parseInt( value );
      }
    } );

    return new BasicSquarePuzzle( board, state );
  }

  public static loadDeprecatedScalaString( str: string ): BasicSquarePuzzle<TCompleteData> {
    if ( !str.includes( '!' ) ) {
      return BasicSquarePuzzle.loadFromSimpleString( str );
    }

    // After each face value, we used to provide two digits: BlackDigit and RedDigit.
    // 0x1 mask is for E, 0x2 mask is for N, 0x4 mask is for W, 0x8 mask is for S.
    const EAST = 0x1;
    const NORTH = 0x2;
    const WEST = 0x4;
    const SOUTH = 0x8;

    // "complex" format from that code
    const [ size, faceValues ] = str.split( ' ' );
    const [ width, height ] = size.split( 'x' ).map( x => parseInt( x ) );

    const board = new SquareBoard( width, height );

    const getFaceIndex = ( face: TFace ) => 3 * ( face.logicalCoordinates.y * width + face.logicalCoordinates.x ) + 1;
    const getEdgeState = ( face: TFace, mask: number ): EdgeState => {
      const index = getFaceIndex( face );

      const blackDigit = parseInt( faceValues[ index + 1 ] );
      const redDigit = parseInt( faceValues[ index + 2 ] );

      if ( blackDigit & mask ) {
        return EdgeState.BLACK;
      }
      else if ( redDigit & mask ) {
        return EdgeState.RED;
      }
      else {
        return EdgeState.WHITE;
      }
    };

    const state = CompleteData.fromFacesEdges( board, face => {
      const value = faceValues[ getFaceIndex( face ) ];
      if ( value === '.' ) {
        return null;
      }
      else {
        return parseInt( value );
      }
    }, edge => {
      const squareEdge = edge as TSquareEdge;

      if ( squareEdge.orientation === Orientation.HORIZONTAL ) {
        if ( squareEdge.southFace ) {
          return getEdgeState( squareEdge.southFace, NORTH );
        }
        else {
          return getEdgeState( squareEdge.northFace!, SOUTH );
        }
      }
      else {
        if ( squareEdge.westFace ) {
          return getEdgeState( squareEdge.westFace, EAST );
        }
        else {
          return getEdgeState( squareEdge.eastFace!, WEST );
        }
      }
    } );

    return new BasicSquarePuzzle( board, state );
  }
}
