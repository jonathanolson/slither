import { CompositeAction, EdgeStateSetAction, TAction, TBoard, TEdge, TEdgeData, TEdgeDataListener, TState, TVertex } from "../structure";
import EdgeState from '../EdgeState.ts';
import { InvalidStateError } from './InvalidStateError.ts';
import { TSolver } from './TSolver.ts';

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
