import { TBoard } from '../../board/core/TBoard.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import { TVertex } from '../../board/core/TVertex.ts';
import { deserializeEdge } from '../../board/core/deserializeEdge.ts';
import { TDelta } from '../core/TDelta.ts';
import { TState } from '../core/TState.ts';
import { GeneralSimpleRegion } from './GeneralSimpleRegion.ts';
import { GeneralSimpleRegionDelta } from './GeneralSimpleRegionDelta.ts';
import {
  TSerializedSimpleRegionData,
  TSimpleRegion,
  TSimpleRegionData,
  serializeSimpleRegionData,
} from './TSimpleRegionData.ts';

import { TinyEmitter } from 'phet-lib/axon';

import { MultiIterable } from '../../../workarounds/MultiIterable.ts';

export class GeneralSimpleRegionData implements TState<TSimpleRegionData> {
  public readonly simpleRegionsChangedEmitter = new TinyEmitter<
    [
      addedRegions: MultiIterable<TSimpleRegion>,
      removedRegions: MultiIterable<TSimpleRegion>,
      addedWeirdEdges: MultiIterable<TEdge>,
      removedWeirdEdges: MultiIterable<TEdge>,
    ]
  >();

  public readonly simpleRegions: Set<TSimpleRegion>;
  public readonly weirdEdges: Set<TEdge>;

  public constructor(
    public readonly board: TBoard,
    simpleRegions?: MultiIterable<TSimpleRegion>,
    weirdEdges?: MultiIterable<TEdge>,
  ) {
    this.simpleRegions = new Set(simpleRegions);
    this.weirdEdges = new Set(weirdEdges);
  }

  public getSimpleRegions(): TSimpleRegion[] {
    return [...this.simpleRegions];
  }

  public getSimpleRegionWithVertex(vertex: TVertex): TSimpleRegion | null {
    for (const simpleRegion of this.simpleRegions) {
      if (simpleRegion.a === vertex || simpleRegion.b === vertex) {
        return simpleRegion;
      }
    }
    return null;
  }

  public getSimpleRegionWithEdge(edge: TEdge): TSimpleRegion | null {
    for (const simpleRegion of this.simpleRegions) {
      if (simpleRegion.edges.includes(edge)) {
        return simpleRegion;
      }
    }
    return null;
  }

  public getSimpleRegionWithId(id: number): TSimpleRegion | null {
    for (const simpleRegion of this.simpleRegions) {
      if (simpleRegion.id === id) {
        return simpleRegion;
      }
    }
    return null;
  }

  public getWeirdEdges(): TEdge[] {
    return [...this.weirdEdges];
  }

  public modifyRegions(
    addedRegions: MultiIterable<TSimpleRegion>,
    removedRegions: MultiIterable<TSimpleRegion>,
    addedWeirdEdges: MultiIterable<TEdge>,
    removedWeirdEdges: MultiIterable<TEdge>,
  ): void {
    for (const removedRegion of removedRegions) {
      this.simpleRegions.delete(removedRegion);
    }
    for (const newRegion of addedRegions) {
      this.simpleRegions.add(newRegion);
    }
    for (const removedEdge of removedWeirdEdges) {
      this.weirdEdges.delete(removedEdge);
    }
    for (const newEdge of addedWeirdEdges) {
      this.weirdEdges.add(newEdge);
    }
    this.simpleRegionsChangedEmitter.emit(addedRegions, removedRegions, addedWeirdEdges, removedWeirdEdges);
  }

  public clone(): GeneralSimpleRegionData {
    return new GeneralSimpleRegionData(this.board, this.simpleRegions, this.weirdEdges);
  }

  public createDelta(): TDelta<TSimpleRegionData> {
    return new GeneralSimpleRegionDelta(this.board, this);
  }

  public serializeState(board: TBoard): TSerializedSimpleRegionData {
    return serializeSimpleRegionData(this);
  }

  public static deserializeState(
    board: TBoard,
    serializedSimpleRegionData: TSerializedSimpleRegionData,
  ): GeneralSimpleRegionData {
    return new GeneralSimpleRegionData(
      board,
      serializedSimpleRegionData.simpleRegions.map((serializedSimpleRegion) =>
        GeneralSimpleRegion.deserializeSimpleRegion(board, serializedSimpleRegion),
      ),
      serializedSimpleRegionData.weirdEdges.map((serializedEdge) => deserializeEdge(board, serializedEdge)),
    );
  }
}
