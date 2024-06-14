import EdgeState from '../data/edge-state/EdgeState.ts';
import { TSolver } from './TSolver.ts';
import { TFace } from '../board/core/TFace.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { TState } from '../data/core/TState.ts';
import { TEdgeStateData } from '../data/edge-state/TEdgeStateData.ts';
import { CompositeAction } from '../data/core/CompositeAction.ts';
import { EdgeStateSetAction } from '../data/edge-state/EdgeStateSetAction.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { AnnotatedAction } from '../data/core/AnnotatedAction.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { InvalidStateError } from './errors/InvalidStateError.ts';
import { TFaceStateData, TFaceStateListener } from '../data/face-state/TFaceStateData.ts';

export type FaceToEdgeSolverOptions = {
  solveToRed: boolean;
  solveToBlack: boolean;
};

type Data = TEdgeStateData & TFaceStateData;

// TODO: share code with VertexToEdgeSolver
export class FaceToEdgeSolver implements TSolver<Data, TAnnotatedAction<Data>> {
  private readonly dirtyFaces: TFace[] = [];

  private readonly vertexListener: TFaceStateListener;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<Data>,
    private readonly options: FaceToEdgeSolverOptions,
    dirtyFaces?: TFace[],
  ) {
    if (dirtyFaces) {
      this.dirtyFaces.push(...dirtyFaces);
    } else {
      this.dirtyFaces.push(...board.faces);
    }

    this.vertexListener = (vertex: TFace) => {
      this.dirtyFaces.push(vertex);
    };
    this.state.faceStateChangedEmitter.addListener(this.vertexListener);
  }

  public get dirty(): boolean {
    return this.dirtyFaces.length > 0;
  }

  public nextAction(): TAnnotatedAction<Data> | null {
    if (!this.dirty) {
      return null;
    }

    while (this.dirtyFaces.length) {
      const face = this.dirtyFaces.pop()!;

      const faceState = this.state.getFaceState(face);

      if (faceState.possibilityCount === 0) {
        throw new InvalidStateError('Face has no possibilities');
      }

      const toRedEdges: TEdge[] = [];
      const toBlackEdges: TEdge[] = [];

      for (const edge of face.edges) {
        const edgeState = this.state.getEdgeState(edge);

        if (edgeState === EdgeState.WHITE) {
          const finalStates = faceState.getFinalStatesOfEdge(edge);

          if (finalStates.size === 1) {
            const finalState = [...finalStates][0];
            if (finalState === EdgeState.RED && this.options.solveToRed) {
              toRedEdges.push(edge);
            }

            if (finalState === EdgeState.BLACK && this.options.solveToBlack) {
              toBlackEdges.push(edge);
            }
          }
        }
      }

      if (toRedEdges.length || toBlackEdges.length) {
        return new AnnotatedAction(
          new CompositeAction([
            ...toRedEdges.map((edge) => new EdgeStateSetAction(edge, EdgeState.RED)),
            ...toBlackEdges.map((edge) => new EdgeStateSetAction(edge, EdgeState.BLACK)),
          ]),
          {
            type: 'FaceStateToEdge',
            face: face,
            toRedEdges: toRedEdges,
            toBlackEdges: toBlackEdges,
          },
          this.board,
        );
      }
    }

    return null;
  }

  public clone(equivalentState: TState<Data>): FaceToEdgeSolver {
    return new FaceToEdgeSolver(this.board, equivalentState, this.options, this.dirtyFaces);
  }

  public dispose(): void {
    this.state.faceStateChangedEmitter.removeListener(this.vertexListener);
  }
}
