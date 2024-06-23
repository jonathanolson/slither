import { TBoard } from '../board/core/TBoard.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { TFace } from '../board/core/TFace.ts';
import { hasNonzeroSeparateFace } from '../board/core/hasNonzeroSeparateFace.ts';
import { edgeHasVertex } from '../board/util/edgeHasVertex.ts';
import { faceAdjacentFaces } from '../board/util/faceAdjacentFaces.ts';
import { AnnotatedAction } from '../data/core/AnnotatedAction.ts';
import { CompositeAction } from '../data/core/CompositeAction.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { TState } from '../data/core/TState.ts';
import EdgeState from '../data/edge-state/EdgeState.ts';
import { EdgeStateSetAction } from '../data/edge-state/EdgeStateSetAction.ts';
import { TEdgeStateData } from '../data/edge-state/TEdgeStateData.ts';
import FaceValue from '../data/face-value/FaceValue.ts';
import { TFaceValueData, TFaceValueListener } from '../data/face-value/TFaceValueData.ts';
import { TSolver } from './TSolver.ts';

import { MultiIterable } from '../../workarounds/MultiIterable.ts';

type Data = TFaceValueData & TEdgeStateData;

export class StaticDoubleMinusOneFacesSolver implements TSolver<Data, TAnnotatedAction<Data>> {
  private readonly dirtyFaces: Set<TFace>;

  private readonly faceListener: TFaceValueListener;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<Data>,
    dirtyFaces?: MultiIterable<TFace>,
  ) {
    if (dirtyFaces) {
      this.dirtyFaces = new Set(dirtyFaces);
    } else {
      this.dirtyFaces = new Set(board.faces);
    }

    this.faceListener = (face: TFace, state: FaceValue) => {
      this.dirtyFaces.add(face);
      for (const otherFace of faceAdjacentFaces(face)) {
        this.dirtyFaces.add(otherFace);
      }
    };
    this.state.faceValueChangedEmitter.addListener(this.faceListener);
  }

  public get dirty(): boolean {
    return this.dirtyFaces.size > 0;
  }

  public nextAction(): TAnnotatedAction<Data> | null {
    if (!this.dirty) {
      return null;
    }

    // NOTE: we're unfortunately doing a bit of double-checking here. Could be improved in the future. (each pair of faces is checked twice)

    while (this.dirtyFaces.size) {
      const mainFace: TFace = this.dirtyFaces.values().next().value;

      const mainFaceValue = this.state.getFaceValue(mainFace);
      const mainEdgeCount = mainFace.edges.length;

      if (mainFaceValue === mainEdgeCount - 1) {
        for (const connectingEdge of mainFace.edges) {
          const otherFace = connectingEdge.getOtherFace(mainFace);
          if (otherFace) {
            const otherFaceValue = this.state.getFaceValue(otherFace);
            const otherEdgeCount = otherFace.edges.length;

            if (otherFaceValue === otherEdgeCount - 1) {
              const adjacentFaces = new Set([...faceAdjacentFaces(mainFace), ...faceAdjacentFaces(otherFace)]);

              // Ensure there is a third face that wouldn't be touched by a loop around these two faces
              // TODO: consider skipping this check if the edges are already set? (or if we have more than the needed number of non-zero non-black faces)
              if (
                this.board.faces.some(
                  (thirdFace) => (this.state.getFaceValue(thirdFace) ?? 0) > 0 && !adjacentFaces.has(thirdFace),
                )
              ) {
                // Surrounding edges (that don't touch the connecting edge at an endpoint at all) - will be black
                const isSurroundingFilter = (edge: TEdge): boolean =>
                  !edgeHasVertex(edge, connectingEdge.start) && !edgeHasVertex(edge, connectingEdge.end);
                const surroundingMainEdges = mainFace.edges.filter(isSurroundingFilter);
                const surroundingOtherEdges = otherFace.edges.filter(isSurroundingFilter);

                // Exterior edges (that connect to the vertex of our connecting edge, but neither face) - will be red
                const isExteriorFilter = (edge: TEdge): boolean =>
                  !edge.faces.some((face) => face === mainFace || face === otherFace);
                const exteriorEdges = [
                  ...connectingEdge.start.edges.filter(isExteriorFilter),
                  ...connectingEdge.end.edges.filter(isExteriorFilter),
                ];

                const blackEdges = [connectingEdge, ...surroundingMainEdges, ...surroundingOtherEdges].filter(
                  (edge) => this.state.getEdgeState(edge) !== EdgeState.BLACK,
                );

                const redEdges = exteriorEdges.filter((edge) => this.state.getEdgeState(edge) !== EdgeState.RED);

                if (
                  (blackEdges.length || redEdges.length) &&
                  // Solver loop prevention should only happen if there are disconnected faces
                  hasNonzeroSeparateFace(this.board, this.state, new Set([mainFace, otherFace]))
                ) {
                  return new AnnotatedAction(
                    new CompositeAction([
                      ...blackEdges.map((edge) => new EdgeStateSetAction(edge, EdgeState.BLACK)),
                      ...redEdges.map((edge) => new EdgeStateSetAction(edge, EdgeState.RED)),
                    ]),
                    {
                      type: 'DoubleMinusOneFaces',
                      faces: [mainFace, otherFace],
                      toBlackEdges: blackEdges,
                      toRedEdges: redEdges,
                    },
                    this.board,
                  );
                }
              }
            }
          }
        }
      }

      this.dirtyFaces.delete(mainFace);
    }

    return null;
  }

  public clone(equivalentState: TState<Data>): StaticDoubleMinusOneFacesSolver {
    return new StaticDoubleMinusOneFacesSolver(this.board, equivalentState, this.dirtyFaces);
  }

  public dispose(): void {
    this.state.faceValueChangedEmitter.removeListener(this.faceListener);
  }
}
