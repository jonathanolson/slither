import EdgeState from '../data/edge/EdgeState.ts';
import { TSolver } from './TSolver.ts';
import { TVertex } from '../board/core/TVertex.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { TState } from '../data/core/TState.ts';
import { TEdgeData } from '../data/edge/TEdgeData.ts';
import { CompositeAction } from '../data/core/CompositeAction.ts';
import { EdgeStateSetAction } from '../data/edge/EdgeStateSetAction.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { AnnotatedAction } from '../data/core/AnnotatedAction.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { TVertexData, TVertexDataListener } from '../data/vertex/TVertexData.ts';

export type VertexToEdgeSolverOptions = {
  solveToRed: boolean;
  solveToBlack: boolean;
};

type Data = TEdgeData & TVertexData;

export class VertexToEdgeSolver implements TSolver<Data, TAnnotatedAction<Data>> {

  private readonly dirtyVertices: TVertex[] = [];

  private readonly vertexListener: TVertexDataListener;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<Data>,
    private readonly options: VertexToEdgeSolverOptions,
    dirtyVertices?: TVertex[]
  ) {
    if ( dirtyVertices ) {
      this.dirtyVertices.push( ...dirtyVertices );
    }
    else {
      this.dirtyVertices.push( ...board.vertices );
    }

    this.vertexListener = ( vertex: TVertex ) => {
      this.dirtyVertices.push( vertex );
    };
    this.state.vertexChangedEmitter.addListener( this.vertexListener );
  }

  public get dirty(): boolean {
    return this.dirtyVertices.length > 0;
  }

  public nextAction(): TAnnotatedAction<Data> | null {
    if ( !this.dirty ) { return null; }

    while ( this.dirtyVertices.length ) {
      const vertex = this.dirtyVertices.pop()!;

      const vertexState = this.state.getVertexState( vertex );

      const toRedEdges: TEdge[] = [];
      const toBlackEdges: TEdge[] = [];

      for ( const edge of vertex.edges ) {
        const edgeState = this.state.getEdgeState( edge );

        if ( edgeState === EdgeState.WHITE ) {
          const finalStates = vertexState.getFinalStatesOfEdge( edge );

          if ( finalStates.size === 1 ) {
            const finalState = [ ...finalStates ][ 0 ];
            if ( finalState === EdgeState.RED && this.options.solveToRed ) {
              toRedEdges.push( edge );
            }

            if ( finalState === EdgeState.BLACK && this.options.solveToBlack ) {
              toBlackEdges.push( edge );
            }
          }
        }
      }

      if ( toRedEdges.length || toBlackEdges.length ) {
        return new AnnotatedAction( new CompositeAction( [
          ...toRedEdges.map( edge => new EdgeStateSetAction( edge, EdgeState.RED ) ),
          ...toBlackEdges.map( edge => new EdgeStateSetAction( edge, EdgeState.BLACK ) )
        ] ), {
          type: 'VertexStateToEdge',
          vertex: vertex,
          toRedEdges: toRedEdges,
          toBlackEdges: toBlackEdges,
        } );
      }
    }

    return null;
  }

  public clone( equivalentState: TState<Data> ): VertexToEdgeSolver {
    return new VertexToEdgeSolver( this.board, equivalentState, this.options, this.dirtyVertices );
  }

  public dispose(): void {
    this.state.vertexChangedEmitter.removeListener( this.vertexListener );
  }
}
