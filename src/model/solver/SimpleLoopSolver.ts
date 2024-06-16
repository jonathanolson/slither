import { TBoard } from '../board/core/TBoard.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { TVertex } from '../board/core/TVertex.ts';
import { AnnotatedAction } from '../data/core/AnnotatedAction.ts';
import { CompositeAction } from '../data/core/CompositeAction.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { TState } from '../data/core/TState.ts';
import EdgeState from '../data/edge-state/EdgeState.ts';
import { EdgeStateSetAction } from '../data/edge-state/EdgeStateSetAction.ts';
import { TEdgeStateData, TEdgeStateListener } from '../data/edge-state/TEdgeStateData.ts';
import { TFaceValueData } from '../data/face-value/TFaceValueData.ts';
import { TSimpleRegion, TSimpleRegionData, TSimpleRegionListener } from '../data/simple-region/TSimpleRegionData.ts';
import { TSolver } from './TSolver.ts';
import { InvalidStateError } from './errors/InvalidStateError.ts';

import { MultiIterable } from '../../workarounds/MultiIterable.ts';

export type SimpleLoopSolverOptions = {
  solveToRed: boolean;
  solveToBlack: boolean;
  resolveAllRegions: boolean;
};

export class SimpleLoopSolver
  implements
    TSolver<
      TFaceValueData & TEdgeStateData & TSimpleRegionData,
      TAnnotatedAction<TFaceValueData & TEdgeStateData & TSimpleRegionData>
    >
{
  private readonly dirtySimpleRegions: Set<TSimpleRegion>;
  private hasDirtyWeirdEdges: boolean = false;

  private readonly simpleRegionListener: TSimpleRegionListener;
  private readonly edgeListener: TEdgeStateListener;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<TFaceValueData & TEdgeStateData & TSimpleRegionData>,
    private readonly options: SimpleLoopSolverOptions,
    dirtySimpleRegions?: MultiIterable<TSimpleRegion>,
  ) {
    if (dirtySimpleRegions) {
      this.dirtySimpleRegions = new Set(dirtySimpleRegions);
    } else {
      this.dirtySimpleRegions = new Set(state.getSimpleRegions());
    }

    this.simpleRegionListener = (
      addedRegions: MultiIterable<TSimpleRegion>,
      removedRegions: MultiIterable<TSimpleRegion>,
      addedWeirdEdges: MultiIterable<TEdge>,
      removedWeirdEdges: MultiIterable<TEdge>,
    ) => {
      for (const region of removedRegions) {
        this.dirtySimpleRegions.delete(region);
      }
      for (const region of addedRegions) {
        this.dirtySimpleRegions.add(region);
      }
      this.hasDirtyWeirdEdges = state.getWeirdEdges().length > 0;
    };
    this.state.simpleRegionsChangedEmitter.addListener(this.simpleRegionListener);

    this.edgeListener = (edge: TEdge, state: EdgeState, oldState: EdgeState) => {
      // We need to see if red edges created a forced connection(!)
      // We'll start scanning from each endpoint of the red edge. If it has the proper conditions (2 white edges, 0 black),
      // we'll start venturing down one of those directions. If it starts on (or hits) a black edge, we'll identify the
      // region and mark it as dirty.
      if (state === EdgeState.RED) {
        const simpleRegions = this.state.getSimpleRegions();

        const walkVertex = (startingVertex: TVertex): void => {
          let vertex = startingVertex;
          let lastVertex: TVertex | null = null;

          let bailCount = 0;

          do {
            if (bailCount++ > 10000) {
              throw new Error('infinite loop detected');
            }

            // If it has a black edge, do a region check (make it dirty)
            const blackEdges = vertex.edges.filter((edge) => this.state.getEdgeState(edge) === EdgeState.BLACK);
            if (blackEdges.length === 1) {
              for (const simpleRegion of simpleRegions) {
                if (simpleRegion.a === vertex || simpleRegion.b === vertex) {
                  this.dirtySimpleRegions.add(simpleRegion);
                }
              }
              break;
            }

            // If we're not forced, bail
            if (blackEdges.length !== 0) {
              break;
            }
            const whiteEdges = vertex.edges.filter((edge) => this.state.getEdgeState(edge) === EdgeState.WHITE);
            if (whiteEdges.length !== 2) {
              break;
            }

            const nextEdge = whiteEdges[0].getOtherVertex(vertex) === lastVertex ? whiteEdges[1] : whiteEdges[0];

            // Move on, JUST in one direction (if this is our first call, we only need to inspect in one direction
            lastVertex = vertex;
            vertex = nextEdge.getOtherVertex(vertex);
          } while (vertex !== startingVertex);
        };
        walkVertex(edge.start);
        walkVertex(edge.end);
      }
    };
    this.state.edgeStateChangedEmitter.addListener(this.edgeListener);
  }

  public get dirty(): boolean {
    return this.dirtySimpleRegions.size > 0 || this.hasDirtyWeirdEdges;
  }

  public nextAction(): TAnnotatedAction<TFaceValueData & TEdgeStateData & TSimpleRegionData> | null {
    if (!this.dirty) {
      return null;
    }

    if (this.state.getWeirdEdges().length) {
      throw new InvalidStateError('has weird edges');
    }

    const dirtySet = this.options.resolveAllRegions ? new Set(this.state.getSimpleRegions()) : this.dirtySimpleRegions;

    while (dirtySet.size > 0) {
      const region = dirtySet.values().next().value;

      if (!region.isSolved) {
        const startVertex = region.a;
        const endVertex = region.b;
        const startEdge = region.halfEdges[0].edge;

        // TODO: create more primitives for tracing these forced paths in the future

        // Look at all potential candidate edges (to see if we can rule something out)
        for (const candidateEdge of startVertex.edges) {
          if (candidateEdge === startEdge || this.state.getEdgeState(candidateEdge) === EdgeState.RED) {
            continue;
          }

          const edges = [candidateEdge];
          let currentEdge = candidateEdge;
          let currentVertex: TVertex = candidateEdge.getOtherVertex(startVertex);

          while (currentVertex !== endVertex) {
            let hasBlack = false;
            const forcedEdges = currentVertex.edges.filter((edge) => {
              if (edge === currentEdge) {
                return false;
              }

              const state = this.state.getEdgeState(edge);

              if (state === EdgeState.BLACK) {
                hasBlack = true;
              }

              return state === EdgeState.WHITE;
            });

            // If we have a black edge OR we aren't forced into one white edge, we can't continue
            if (forcedEdges.length !== 1 || hasBlack) {
              break;
            }

            currentEdge = forcedEdges[0];
            edges.push(currentEdge);
            currentVertex = currentEdge.getOtherVertex(currentVertex);
          }

          // We have a forced loop around!
          if (currentVertex === endVertex) {
            if (this.isSolvedWithAddedEdges(region, edges)) {
              if (this.options.solveToBlack) {
                return new AnnotatedAction(
                  new CompositeAction(edges.map((edge) => new EdgeStateSetAction(edge, EdgeState.BLACK))),
                  {
                    type: 'ForcedSolveLoop',
                    a: startVertex,
                    b: endVertex,
                    regionEdges: region.edges,
                    pathEdges: edges,
                  },
                  this.board,
                );
              }
            } else {
              if (this.options.solveToRed) {
                return new AnnotatedAction(
                  new CompositeAction(edges.map((edge) => new EdgeStateSetAction(edge, EdgeState.RED))),
                  {
                    type: 'PrematureForcedLoop',
                    a: startVertex,
                    b: endVertex,
                    regionEdges: region.edges,
                    pathEdges: edges,
                  },
                  this.board,
                );
              }
            }
          }
        }
      }

      // Only delete it once we've verified it's good (it's possible to construct regions that can have multiple cut branches
      dirtySet.delete(region);
    }

    return null;
  }

  private isSolvedWithAddedEdges(region: TSimpleRegion, edges: TEdge[]): boolean {
    const edgeSet = new Set(region.edges);
    for (const edge of edges) {
      edgeSet.add(edge);
    }

    for (const face of this.board.faces) {
      const faceValue = this.state.getFaceValue(face);
      if (faceValue !== null) {
        const count = face.edges.filter((faceEdge) => edgeSet.has(faceEdge)).length;
        if (count !== faceValue) {
          return false;
        }
      }
    }

    return true;
  }

  public clone(equivalentState: TState<TFaceValueData & TEdgeStateData & TSimpleRegionData>): SimpleLoopSolver {
    return new SimpleLoopSolver(this.board, equivalentState, this.options, this.dirtySimpleRegions);
  }

  public dispose(): void {
    this.state.simpleRegionsChangedEmitter.removeListener(this.simpleRegionListener);
    this.state.edgeStateChangedEmitter.removeListener(this.edgeListener);
  }
}
