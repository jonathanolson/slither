import { TSolver } from './TSolver.ts';
import { InvalidStateError } from './errors/InvalidStateError.ts';
import EdgeState from '../data/edge-state/EdgeState.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { TState } from '../data/core/TState.ts';
import { TEdgeStateData } from '../data/edge-state/TEdgeStateData.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { TFaceColor, TFaceColorData, TFaceColorListener } from '../data/face-color/TFaceColorData.ts';
import { TFace } from '../board/core/TFace.ts';
import { EdgeStateSetAction } from '../data/edge-state/EdgeStateSetAction.ts';
import { AnnotatedAction } from '../data/core/AnnotatedAction.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { MultiIterable } from '../../workarounds/MultiIterable.ts';

export type SimpleFaceColorSolverOptions = {
  solveToRed: boolean;
  solveToBlack: boolean;
};

type Data = TEdgeStateData & TFaceColorData;

export class SimpleFaceColorSolver implements TSolver<Data, TAnnotatedAction<Data>> {
  private readonly dirtyEdges: Set<TEdge> = new Set();

  private readonly faceColorListener: TFaceColorListener;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<Data>,
    private readonly options: SimpleFaceColorSolverOptions,
    dirtyEdges?: MultiIterable<TEdge>,
  ) {
    if (dirtyEdges) {
      this.dirtyEdges = new Set(dirtyEdges);
    } else {
      this.dirtyEdges = new Set(board.edges);
    }

    this.faceColorListener = (
      addedFaceColors: MultiIterable<TFaceColor>,
      removedFaceColors: MultiIterable<TFaceColor>,
      oppositeChangedFaceColors: MultiIterable<TFaceColor>,
      changedFaces: MultiIterable<TFace>,
    ) => {
      for (const face of changedFaces) {
        for (const edge of face.edges) {
          this.dirtyEdges.add(edge);
        }
      }

      for (const faceColor of oppositeChangedFaceColors) {
        const faces = this.state.getFacesWithColor(faceColor);
        for (const face of faces) {
          for (const edge of face.edges) {
            this.dirtyEdges.add(edge);
          }
        }
      }
    };

    this.state.faceColorsChangedEmitter.addListener(this.faceColorListener);
  }

  public get dirty(): boolean {
    return this.dirtyEdges.size > 0;
  }

  public nextAction(): TAnnotatedAction<Data> | null {
    if (!this.dirty) {
      return null;
    }

    if (this.state.hasInvalidFaceColors()) {
      throw new InvalidStateError('Has invalid face colors');
    }

    while (this.dirtyEdges.size > 0) {
      const edge: TEdge = this.dirtyEdges.values().next().value;

      const edgeState = this.state.getEdgeState(edge);

      if (edgeState === EdgeState.WHITE) {
        const faceColorA = edge.forwardFace ? this.state.getFaceColor(edge.forwardFace) : this.state.getOutsideColor();
        const faceColorB =
          edge.reversedFace ? this.state.getFaceColor(edge.reversedFace) : this.state.getOutsideColor();

        const isSame = faceColorA === faceColorB;
        const isOpposite = this.state.getOppositeFaceColor(faceColorA) === faceColorB;

        if (this.options.solveToBlack && isOpposite) {
          return new AnnotatedAction(
            new EdgeStateSetAction(edge, EdgeState.BLACK),
            {
              type: 'FaceColorToBlack',
              edge: edge,
            },
            this.board,
          );
        }

        if (this.options.solveToRed && isSame) {
          return new AnnotatedAction(
            new EdgeStateSetAction(edge, EdgeState.RED),
            {
              type: 'FaceColorToRed',
              edge: edge,
            },
            this.board,
          );
        }
      }

      // Only delete it once we've verified it's good (and we haven't errored?)
      this.dirtyEdges.delete(edge);
    }

    return null;
  }

  public clone(equivalentState: TState<Data>): SimpleFaceColorSolver {
    return new SimpleFaceColorSolver(this.board, equivalentState, this.options, this.dirtyEdges);
  }

  public dispose(): void {
    this.state.faceColorsChangedEmitter.removeListener(this.faceColorListener);
  }
}
