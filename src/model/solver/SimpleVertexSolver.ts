import EdgeState from '../data/edge-state/EdgeState.ts';
import { InvalidStateError } from './errors/InvalidStateError.ts';
import { TSolver } from './TSolver.ts';
import { TVertex } from '../board/core/TVertex.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { TState } from '../data/core/TState.ts';
import { TEdgeStateData, TEdgeStateListener } from '../data/edge-state/TEdgeStateData.ts';
import { CompositeAction } from '../data/core/CompositeAction.ts';
import { EdgeStateSetAction } from '../data/edge-state/EdgeStateSetAction.ts';
import { TBoard } from '../board/core/TBoard.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { AnnotatedAction } from '../data/core/AnnotatedAction.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';

export type SimpleVertexSolverOptions = {
  solveJointToRed: boolean;
  solveForcedLineToBlack: boolean;
  solveAlmostEmptyToRed: boolean;
};

export class SimpleVertexSolver implements TSolver<TEdgeStateData, TAnnotatedAction<TEdgeStateData>> {
  private readonly dirtyVertices: TVertex[] = [];

  private readonly edgeListener: TEdgeStateListener;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<TEdgeStateData>,
    private readonly options: SimpleVertexSolverOptions,
    dirtyVertices?: TVertex[],
  ) {
    if (dirtyVertices) {
      this.dirtyVertices.push(...dirtyVertices);
    } else {
      this.dirtyVertices.push(...board.vertices);
    }

    this.edgeListener = (edge: TEdge, state: EdgeState) => {
      // TODO: should we... scan for whether it is already there? (probably no, don't want O(n^2))
      this.dirtyVertices.push(...edge.vertices);
    };

    this.state.edgeStateChangedEmitter.addListener(this.edgeListener);
  }

  public get dirty(): boolean {
    return this.dirtyVertices.length > 0;
  }

  public nextAction(): TAnnotatedAction<TEdgeStateData> | null {
    if (!this.dirty) {
      return null;
    }

    while (this.dirtyVertices.length) {
      const vertex = this.dirtyVertices.pop()!;

      const edges = vertex.edges;
      let blackCount = 0;
      let whiteCount = 0;
      // TODO: perhaps we create a map here? We're having to re-access state below
      edges.forEach((edge) => {
        const state = this.state.getEdgeState(edge);
        if (state === EdgeState.BLACK) {
          blackCount++;
        } else if (state === EdgeState.WHITE) {
          whiteCount++;
        }
        return state;
      });

      if (blackCount > 2) {
        throw new InvalidStateError('Too many black edges on vertex');
      } else if (blackCount === 1 && whiteCount === 0) {
        throw new InvalidStateError('Nowhere for the single edge to go');
      }

      if (whiteCount > 0) {
        if (this.options.solveJointToRed && blackCount === 2) {
          const whiteEdges = edges.filter((edge) => this.state.getEdgeState(edge) === EdgeState.WHITE);
          const blackEdges = edges.filter((edge) => this.state.getEdgeState(edge) === EdgeState.BLACK);
          assertEnabled() && assert(blackEdges.length === 2);

          return new AnnotatedAction(
            new CompositeAction(whiteEdges.map((edge) => new EdgeStateSetAction(edge, EdgeState.RED))),
            {
              type: 'JointToRed',
              vertex: vertex,
              whiteEdges: whiteEdges,
              blackEdges: blackEdges as [TEdge, TEdge], // we checked earlier
            },
            this.board,
          );
        } else if (this.options.solveForcedLineToBlack && blackCount === 1 && whiteCount === 1) {
          const whiteEdge = edges.find((edge) => this.state.getEdgeState(edge) === EdgeState.WHITE)!;
          const blackEdge = edges.find((edge) => this.state.getEdgeState(edge) === EdgeState.BLACK)!;
          assertEnabled() && assert(whiteEdge);
          assertEnabled() && assert(blackEdge);

          return new AnnotatedAction(
            new EdgeStateSetAction(whiteEdge, EdgeState.BLACK),
            {
              type: 'ForcedLine',
              vertex: vertex,
              blackEdge: blackEdge,
              whiteEdge: whiteEdge,
              redEdges: edges.filter((edge) => this.state.getEdgeState(edge) === EdgeState.RED),
            },
            this.board,
          );
        } else if (this.options.solveAlmostEmptyToRed && blackCount === 0 && whiteCount === 1) {
          const whiteEdge = edges.find((edge) => this.state.getEdgeState(edge) === EdgeState.WHITE)!;
          assertEnabled() && assert(whiteEdge);

          return new AnnotatedAction(
            new EdgeStateSetAction(whiteEdge, EdgeState.RED),
            {
              type: 'AlmostEmptyToRed',
              vertex: vertex,
              whiteEdge: whiteEdge,
              redEdges: edges.filter((edge) => this.state.getEdgeState(edge) === EdgeState.RED),
            },
            this.board,
          );
        }
      }
    }

    return null;
  }

  public clone(equivalentState: TState<TEdgeStateData>): SimpleVertexSolver {
    return new SimpleVertexSolver(this.board, equivalentState, this.options, this.dirtyVertices);
  }

  public dispose(): void {
    this.state.edgeStateChangedEmitter.removeListener(this.edgeListener);
  }
}
