import { TBoard } from '../board/core/TBoard.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { AnnotatedAction } from '../data/core/AnnotatedAction.ts';
import { CompositeAction } from '../data/core/CompositeAction.ts';
import { TAnnotatedAction } from '../data/core/TAnnotatedAction.ts';
import { TState } from '../data/core/TState.ts';
import EdgeState from '../data/edge-state/EdgeState.ts';
import { EdgeStateSetAction } from '../data/edge-state/EdgeStateSetAction.ts';
import { TEdgeStateData, TEdgeStateListener } from '../data/edge-state/TEdgeStateData.ts';
import SectorState from '../data/sector-state/SectorState.ts';
import { TSector } from '../data/sector-state/TSector.ts';
import { TSectorStateData, TSectorStateListener } from '../data/sector-state/TSectorStateData.ts';
import { TSolver } from './TSolver.ts';
import { InvalidStateError } from './errors/InvalidStateError.ts';

import { MultiIterable } from '../../workarounds/MultiIterable.ts';

type Data = TEdgeStateData & TSectorStateData;

// sector + edges => edges
export class SimpleSectorSolver implements TSolver<Data, TAnnotatedAction<Data>> {
  private readonly dirtySectors: Set<TSector>;

  private readonly edgeListener: TEdgeStateListener;
  private readonly sectorListener: TSectorStateListener;

  public constructor(
    private readonly board: TBoard,
    private readonly state: TState<Data>,
    dirtySectors?: MultiIterable<TSector>,
  ) {
    if (dirtySectors) {
      this.dirtySectors = new Set(dirtySectors);
    } else {
      this.dirtySectors = new Set(board.halfEdges);
    }

    this.edgeListener = (edge: TEdge, state: EdgeState, oldState: EdgeState) => {
      this.dirtySectors.add(edge.forwardHalf);
      this.dirtySectors.add(edge.forwardHalf.previous);
      this.dirtySectors.add(edge.reversedHalf);
      this.dirtySectors.add(edge.reversedHalf.previous);
    };
    this.state.edgeStateChangedEmitter.addListener(this.edgeListener);

    this.sectorListener = (sector: TSector, state: SectorState, oldState: SectorState) => {
      this.dirtySectors.add(sector);
    };
    this.state.sectorStateChangedEmitter.addListener(this.sectorListener);
  }

  public get dirty(): boolean {
    return this.dirtySectors.size > 0;
  }

  public nextAction(): TAnnotatedAction<Data> | null {
    if (!this.dirty) {
      return null;
    }

    while (this.dirtySectors.size) {
      const sector: TSector = this.dirtySectors.values().next().value;
      this.dirtySectors.delete(sector);

      const edgeA = sector.edge;
      const edgeB = sector.next.edge;

      const sectorState = this.state.getSectorState(sector);
      if (sectorState === SectorState.NONE) {
        throw new InvalidStateError(`invalid sector state: ${sectorState}`);
      }

      const edgeStateA = this.state.getEdgeState(edgeA);
      const edgeStateB = this.state.getEdgeState(edgeB);

      const whiteCount = (edgeStateA === EdgeState.WHITE ? 1 : 0) + (edgeStateB === EdgeState.WHITE ? 1 : 0);
      const blackCount = (edgeStateA === EdgeState.BLACK ? 1 : 0) + (edgeStateB === EdgeState.BLACK ? 1 : 0);

      const getAction = (blackEdges: TEdge[], redEdges: TEdge[]) => {
        return new AnnotatedAction(
          new CompositeAction([
            ...blackEdges.map((edge) => new EdgeStateSetAction(edge, EdgeState.BLACK)),
            ...redEdges.map((edge) => new EdgeStateSetAction(edge, EdgeState.RED)),
          ]),
          {
            type: 'ForcedSector',
            sector: sector,
            sectorState: sectorState,
            toRedEdges: redEdges,
            toBlackEdges: blackEdges,
          },
          this.board,
        );
      };

      if (whiteCount === 0) {
        if (!sectorState.allows(blackCount)) {
          throw new InvalidStateError(`invalid state: ${sectorState} with ${blackCount} black edges with no white`);
        }
      } else if (whiteCount === 1) {
        const allowsRed = sectorState.allows(blackCount);
        const allowsBlack = sectorState.allows(blackCount + 1);

        if (!allowsRed && !allowsBlack) {
          throw new InvalidStateError(`invalid state: ${sectorState} with ${blackCount} black edges and 1 white`);
        } else if (allowsRed && !allowsBlack) {
          return getAction([], [edgeStateA === EdgeState.WHITE ? edgeA : edgeB]);
        } else if (allowsBlack && !allowsRed) {
          return getAction([edgeStateA === EdgeState.WHITE ? edgeA : edgeB], []);
        }
      } else if (whiteCount === 2) {
        if (sectorState === SectorState.ONLY_ZERO) {
          return getAction([], [edgeA, edgeB]);
        } else if (sectorState === SectorState.ONLY_TWO) {
          return getAction([edgeA, edgeB], []);
        }
      } else {
        throw new InvalidStateError(`invalid white count: ${whiteCount}`);
      }
    }

    return null;
  }

  public clone(equivalentState: TState<Data>): SimpleSectorSolver {
    return new SimpleSectorSolver(this.board, equivalentState, this.dirtySectors);
  }

  public dispose(): void {
    this.state.edgeStateChangedEmitter.removeListener(this.edgeListener);
    this.state.sectorStateChangedEmitter.removeListener(this.sectorListener);
  }
}
