import { CompositeAction, EdgeStateSetAction, TAction, TBoard, TEdge, TEdgeData, TEdgeDataListener, TFace, TFaceData, TFaceDataListener, TState, TVertex } from './structure';
import FaceState from './FaceState.ts';
import EdgeState from './EdgeState.ts';

export class InvalidStateError extends Error {
  // TODO: the ability to "highlight" the invalid state (action?)
  public constructor( message: string ) {
    super( message );
  }
}

export interface TAnnotatedAction<Data, Annotation> extends TAction<Data> {
  annotation: Annotation;
}

// Each solver is specifically hooked to a state
export interface TSolver<Data, Action extends TAction<Data>> {
  // If there is a chance nextAction will return an action
  dirty: boolean;

  // TODO: We could also report out the "difficulty" of the next dirty solver, so we could potentially
  // TODO: backtrack more efficiently by exploring the "easier" parts first in each black/red pair.
  // TODO: --- decide whether this actually just... ADDs to the computational cost of the solver?

  // If this returns null, the solver is "currently exhausted" / "clean", and should be marked as NOT dirty.
  nextAction(): Action | null;

  // Create a copy of this solver, but referring to an equivalent state object (allows branching).
  clone( equivalentState: TState<Data> ): TSolver<Data, Action>;

  dispose(): void;
}

export class CompositeSolver<Data> implements TSolver<Data, TAction<Data>> {

  public constructor(
    private readonly solvers: TSolver<Data, TAction<Data>>[]
  ) {}

  public get dirty(): boolean {
    return this.solvers.some( solver => solver.dirty );
  }

  public nextAction(): TAction<Data> | null {
    for ( const solver of this.solvers ) {
      if ( solver.dirty ) {
        const action = solver.nextAction();
        if ( action ) {
          return action;
        }
      }
    }
    return null;
  }

  public clone( equivalentState: TState<Data> ): CompositeSolver<Data> {
    return new CompositeSolver( this.solvers.map( solver => solver.clone( equivalentState ) ) );
  }

  public dispose(): void {
    this.solvers.forEach( solver => solver.dispose() );
  }
}

export type SimpleFaceSolverOptions = {
  solveToRed: boolean;
  solveToBlack: boolean;
};

export class SimpleFaceSolver implements TSolver<TFaceData & TEdgeData, TAction<TFaceData & TEdgeData>> {

  private readonly dirtyFaces: TFace[] = [];

  private readonly faceListener: TFaceDataListener;
  private readonly edgeListener: TEdgeDataListener;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<TFaceData & TEdgeData>,
    private readonly options: SimpleFaceSolverOptions,
    dirtyFaces?: TFace[]
  ) {
    if ( dirtyFaces ) {
      this.dirtyFaces.push( ...dirtyFaces );
    }
    else {
      this.dirtyFaces.push( ...board.faces.filter( face => state.getFaceState( face ) !== null ) );
    }

    this.faceListener = ( face: TFace, state: FaceState ) => {
      this.dirtyFaces.push( face );
    };
    this.edgeListener = ( edge: TEdge, state: EdgeState ) => {
      // TODO: should we... scan for whether it is already there? (probably no, don't want O(n^2))
      this.dirtyFaces.push( ...edge.faces );
    };

    this.state.faceStateChangedEmitter.addListener( this.faceListener );
    this.state.edgeStateChangedEmitter.addListener( this.edgeListener );
  }

  public get dirty(): boolean {
    return this.dirtyFaces.length > 0;
  }

  public nextAction(): TAction<TFaceData & TEdgeData> | null {
    if ( !this.dirty ) { return null; }

    while ( this.dirtyFaces.length ) {
      const face = this.dirtyFaces.pop()!;

      const faceValue = this.state.getFaceState( face );
      if ( faceValue !== null ) {
        const edges = face.edges;
        let blackCount = 0;
        let redCount = 0;
        let whiteCount = 0;
        // TODO: perhaps we create a map here? We're having to re-access state below
        edges.forEach( edge => {
          const state = this.state.getEdgeState( edge );
          if ( state === EdgeState.BLACK ) {
            blackCount++;
          }
          else if ( state === EdgeState.RED ) {
            redCount++;
          }
          else {
            whiteCount++;
          }
          return state;
        } );

        if ( blackCount > faceValue ) {
          throw new InvalidStateError( 'Too many black edges on face' );
        }
        else if ( redCount > face.edges.length - faceValue ) {
          throw new InvalidStateError( 'Too many red edges on face' );
        }

        if ( whiteCount > 0 ) {
          if ( this.options.solveToRed && blackCount === faceValue ) {
            return new CompositeAction( edges.filter( edge => this.state.getEdgeState( edge ) === EdgeState.WHITE ).map( edge => {
              return new EdgeStateSetAction( edge, EdgeState.RED );
            } ) )
          }
          else if ( this.options.solveToBlack && redCount === face.edges.length - faceValue ) {
            return new CompositeAction( edges.filter( edge => this.state.getEdgeState( edge ) === EdgeState.WHITE ).map( edge => {
              return new EdgeStateSetAction( edge, EdgeState.BLACK );
            } ) )
          }
        }
      }
    }

    return null;
  }

  public clone( equivalentState: TState<TFaceData & TEdgeData> ): SimpleFaceSolver {
    return new SimpleFaceSolver( this.board, equivalentState, this.options, this.dirtyFaces );
  }

  public dispose(): void {
    this.state.faceStateChangedEmitter.removeListener( this.faceListener );
    this.state.edgeStateChangedEmitter.removeListener( this.edgeListener );
  }
}

// TODO: move the SimpleVertexSolver up, since it is... simpler than the other

export type SimpleVertexSolverOptions = {
  solveJointToRed: boolean;
  solveOnlyOptionToBlack: boolean;
  solveAlmostEmptyToRed: boolean;
};

export class SimpleVertexSolver implements TSolver<TEdgeData, TAction<TEdgeData>> {

  private readonly dirtyVertices: TVertex[] = [];

  private readonly edgeListener: TEdgeDataListener;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<TEdgeData>,
    private readonly options: SimpleVertexSolverOptions,
    dirtyVertices?: TVertex[]
  ) {
    if ( dirtyVertices ) {
      this.dirtyVertices.push( ...dirtyVertices );
    }
    else {
      this.dirtyVertices.push( ...board.vertices );
    }

    this.edgeListener = ( edge: TEdge, state: EdgeState ) => {
      // TODO: should we... scan for whether it is already there? (probably no, don't want O(n^2))
      this.dirtyVertices.push( ...edge.vertices );
    };

    this.state.edgeStateChangedEmitter.addListener( this.edgeListener );
  }

  public get dirty(): boolean {
    return this.dirtyVertices.length > 0;
  }

  public nextAction(): TAction<TEdgeData> | null {
    if ( !this.dirty ) { return null; }

    while ( this.dirtyVertices.length ) {
      const vertex = this.dirtyVertices.pop()!;

      const edges = vertex.edges;
      let blackCount = 0;
      let redCount = 0;
      let whiteCount = 0;
      // TODO: perhaps we create a map here? We're having to re-access state below
      edges.forEach( edge => {
        const state = this.state.getEdgeState( edge );
        if ( state === EdgeState.BLACK ) {
          blackCount++;
        }
        else if ( state === EdgeState.RED ) {
          redCount++;
        }
        else {
          whiteCount++;
        }
        return state;
      } );

      if ( blackCount > 2 ) {
        throw new InvalidStateError( 'Too many black edges on vertex' );
      }
      else if ( blackCount === 1 && whiteCount === 0 ) {
        throw new InvalidStateError( 'Nowhere for the single edge to go' );
      }

      if ( whiteCount > 0 ) {
        if ( this.options.solveJointToRed && blackCount === 2 ) {
          // TODO: factor out the "set all white edges to <color>" into a helper?
          return new CompositeAction( edges.filter( edge => this.state.getEdgeState( edge ) === EdgeState.WHITE ).map( edge => {
            return new EdgeStateSetAction( edge, EdgeState.RED );
          } ) );
        }
        else if ( this.options.solveOnlyOptionToBlack && blackCount === 1 && whiteCount === 1 ) {
          return new CompositeAction( edges.filter( edge => this.state.getEdgeState( edge ) === EdgeState.WHITE ).map( edge => {
            return new EdgeStateSetAction( edge, EdgeState.BLACK );
          } ) );
        }
        else if ( this.options.solveAlmostEmptyToRed && blackCount === 0 && whiteCount === 1 ) {
          return new CompositeAction( edges.filter( edge => this.state.getEdgeState( edge ) === EdgeState.WHITE ).map( edge => {
            return new EdgeStateSetAction( edge, EdgeState.RED );
          } ) );
        }
      }
    }

    return null;
  }

  public clone( equivalentState: TState<TEdgeData> ): SimpleVertexSolver {
    return new SimpleVertexSolver( this.board, equivalentState, this.options, this.dirtyVertices );
  }

  public dispose(): void {
    this.state.edgeStateChangedEmitter.removeListener( this.edgeListener );
  }
}
