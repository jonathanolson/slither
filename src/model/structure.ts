import { Vector2 } from "phet-lib/dot";
import { CardinalDirection, OrdinalDirection } from './Direction.ts';
import { Orientation } from "phet-lib/phet-core";
import EdgeState from "./EdgeState.ts";
import FaceState from "./FaceState.ts";
import assert from "../workarounds/assert.ts";

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
  northIncidentHalfEdge: TSquareHalfEdge;
  eastIncidentHalfEdge: TSquareHalfEdge;
  southIncidentHalfEdge: TSquareHalfEdge;
  westIncidentHalfEdge: TSquareHalfEdge;
  northReflectedHalfEdge: TSquareHalfEdge;
  eastReflectedHalfEdge: TSquareHalfEdge;
  southReflectedHalfEdge: TSquareHalfEdge;
  westReflectedHalfEdge: TSquareHalfEdge;
  northEdge: TSquareEdge;
  eastEdge: TSquareEdge;
  southEdge: TSquareEdge;
  westEdge: TSquareEdge;
  northeastFace: TSquareFace;
  southeastFace: TSquareFace;
  southwestFace: TSquareFace;
  northwestFace: TSquareFace;
  getHalfEdge( direction: CardinalDirection ): TSquareHalfEdge;
  getEdge( direction: CardinalDirection ): TSquareEdge;
  getFace( direction: OrdinalDirection ): TSquareFace;
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

export class BaseVertex<Structure extends TStructure> {

  // Half-edges with this vertex as their end vertex, in CCW order
  public readonly incidentHalfEdges: Structure[ 'HalfEdge' ][] = [];

  // Half-edges with this vertex as their start vertex, in CCW order
  public readonly reflectedHalfEdges: Structure[ 'HalfEdge' ][] = [];

  // Edges, in CCW order
  public readonly edges: Structure[ 'Edge' ][] = [];

  // Faces, in CCW order (TODO: how to relate the order of edges/faces? Do we... link them?)
  public readonly faces: Structure[ 'Face' ][] = [];

  public constructor(
    // 2d coordinates (for hex, we'll want logical/view coordinate separation)
    public readonly logicalCoordinates: Vector2,
    public readonly viewCoordinates: Vector2
  ) {
    // TODO: initialize all the things
  }

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

export class BaseHalfEdge<Structure extends TStructure> {

  public edge!: Structure[ 'Edge' ];

  public reversed!: Structure[ 'HalfEdge' ];

  public next!: Structure[ 'HalfEdge' ];
  public previous!: Structure[ 'HalfEdge' ];

  // The face to the "left" of the directed half-edge
  public face!: Structure[ 'Face' ] | null;

  public constructor(
    public readonly start: Structure[ 'Vertex' ],
    public readonly end: Structure[ 'Vertex' ],
    public readonly isReversed: boolean
  ) {
    // TODO: initialize all the things
  }
}

export class BaseEdge<Structure extends TStructure> {

  public forwardHalf!: Structure[ 'HalfEdge' ];
  public reversedHalf!: Structure[ 'HalfEdge' ];

  public forwardFace!: Structure[ 'Face' ] | null;
  public reversedFace!: Structure[ 'Face' ] | null;

  public constructor(
    public readonly start: Structure[ 'Vertex' ],
    public readonly end: Structure[ 'Vertex' ]
  ) {
    // TODO: initialize all the things
  }

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

export class BaseFace<Structure extends TStructure> {

  // Half-edges, in CCW order
  public readonly halfEdges: Structure[ 'HalfEdge' ][] = [];

  // Edges, in CCW order
  public readonly edges: Structure[ 'Edge' ][] = [];

  // Vertices, in CCW order (TODO: how to relate the order of edges/faces? Do we... link them?)
  public readonly vertices: Structure[ 'Vertex' ][] = [];

  public constructor(
    // 2d coordinates (for hex, we'll want logical/view coordinate separation)
    public readonly logicalCoordinates: Vector2,
    public readonly viewCoordinates: Vector2 // NOTE: We may tweak the center for better "text" feel, so this might not be the centroid?
  ) {
    // TODO: initialize all the things
  }
}

export class SquareVertex extends BaseVertex<TSquareStructure> implements TSquareVertex {
  public northIncidentHalfEdge!: TSquareHalfEdge;
  public eastIncidentHalfEdge!: TSquareHalfEdge;
  public southIncidentHalfEdge!: TSquareHalfEdge;
  public westIncidentHalfEdge!: TSquareHalfEdge;
  public northReflectedHalfEdge!: TSquareHalfEdge;
  public eastReflectedHalfEdge!: TSquareHalfEdge;
  public southReflectedHalfEdge!: TSquareHalfEdge;
  public westReflectedHalfEdge!: TSquareHalfEdge;
  public northEdge!: TSquareEdge;
  public eastEdge!: TSquareEdge;
  public southEdge!: TSquareEdge;
  public westEdge!: TSquareEdge;
  public northeastFace!: TSquareFace;
  public southeastFace!: TSquareFace;
  public southwestFace!: TSquareFace;
  public northwestFace!: TSquareFace;

  getHalfEdge( direction: CardinalDirection ): TSquareHalfEdge {
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

  getEdge( direction: CardinalDirection ): TSquareEdge {
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

  getFace( direction: OrdinalDirection ): TSquareFace {
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

