import { TState } from '../core/TState.ts';
import { serializeEdgeStateData, TEdgeStateData, TSerializedEdgeStateData } from './TEdgeStateData.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import EdgeState from './EdgeState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { TDelta } from '../core/TDelta.ts';
import { TinyEmitter } from 'phet-lib/axon';
import { GeneralEdgeStateDelta } from './GeneralEdgeStateDelta.ts';
import { deserializeEdge } from '../../board/core/deserializeEdge.ts';
import { TSerializedEdge } from '../../board/core/TSerializedEdge.ts';

// TODO: lots of types like this have duplication, figure out an improvement
export class GeneralEdgeStateData implements TState<TEdgeStateData> {
  public readonly edgeStateChangedEmitter = new TinyEmitter<[edge: TEdge, state: EdgeState, oldState: EdgeState]>();

  public readonly edgeStateMap: Map<TEdge, EdgeState> = new Map();

  public constructor(
    public readonly board: TBoard,
    getInitialEdgeState: (edge: TEdge) => EdgeState,
  ) {
    board.edges.forEach((edge) => {
      this.edgeStateMap.set(edge, getInitialEdgeState(edge));
    });
  }

  public getEdgeState(edge: TEdge): EdgeState {
    assertEnabled() && assert(this.edgeStateMap.has(edge));

    return this.edgeStateMap.get(edge)!;
  }

  public setEdgeState(edge: TEdge, state: EdgeState): void {
    assertEnabled() && assert(this.edgeStateMap.has(edge));

    const oldState = this.edgeStateMap.get(edge)!;

    if (oldState !== state) {
      this.edgeStateMap.set(edge, state);

      this.edgeStateChangedEmitter.emit(edge, state, oldState);
    }
  }

  public clone(): GeneralEdgeStateData {
    return new GeneralEdgeStateData(this.board, (edge) => this.getEdgeState(edge));
  }

  public createDelta(): TDelta<TEdgeStateData> {
    return new GeneralEdgeStateDelta(this.board, this);
  }

  public serializeState(board: TBoard): TSerializedEdgeStateData {
    return serializeEdgeStateData(board, this);
  }

  public static deserializeState(board: TBoard, serializedEdgeData: TSerializedEdgeStateData): GeneralEdgeStateData {
    const map: Map<TEdge, EdgeState> = new Map(
      serializedEdgeData.edges.map((serializedEdgeState: { edge: TSerializedEdge; state: string }) => [
        deserializeEdge(board, serializedEdgeState.edge),
        EdgeState.enumeration.getValue(serializedEdgeState.state),
      ]),
    );

    return new GeneralEdgeStateData(board, (edge) => map.get(edge) ?? EdgeState.WHITE);
  }
}
