import { TAction, TSerializedAction } from '../core/TAction.ts';
import { serializedSimpleRegion, TSerializedSimpleRegion, TSimpleRegion, TSimpleRegionData } from './TSimpleRegionData.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import { GeneralSimpleRegion } from './GeneralSimpleRegion.ts';
import { serializeEdge } from '../../board/core/serializeEdge.ts';
import { deserializeEdge } from '../../board/core/deserializeEdge.ts';
import { TSerializedEdge } from '../../board/core/TSerializedEdge.ts';

export class GeneralSimpleRegionAction implements TAction<TSimpleRegionData> {
  public constructor(
    public readonly board: TBoard,
    public readonly addedRegions: Set<TSimpleRegion> = new Set(),
    public readonly removedRegions: Set<TSimpleRegion> = new Set(),
    public readonly addedWeirdEdges: Set<TEdge> = new Set(),
    public readonly removedWeirdEdges: Set<TEdge> = new Set()
  ) {}

  public apply( state: TSimpleRegionData ): void {
    state.modifyRegions( this.addedRegions, this.removedRegions, this.addedWeirdEdges, this.removedWeirdEdges );
  }

  public getUndo( state: TSimpleRegionData ): TAction<TSimpleRegionData> {
    return new GeneralSimpleRegionAction( this.board, this.removedRegions, this.addedRegions, this.removedWeirdEdges, this.addedWeirdEdges );
  }

  public isEmpty(): boolean {
    return this.addedRegions.size === 0 && this.removedRegions.size === 0 && this.addedWeirdEdges.size === 0 && this.removedWeirdEdges.size === 0;
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'GeneralSimpleRegionAction',
      addedRegions: Array.from( this.addedRegions ).map( serializedSimpleRegion ),
      removedRegions: Array.from( this.removedRegions ).map( serializedSimpleRegion ),
      addedWeirdEdges: Array.from( this.addedWeirdEdges ).map( serializeEdge ),
      removedWeirdEdges: Array.from( this.removedWeirdEdges ).map( serializeEdge )
    };
  }

  public static deserializeAction( board: TBoard, serializedAction: TSerializedAction ): GeneralSimpleRegionAction {
    return new GeneralSimpleRegionAction(
      board,
      new Set( serializedAction.addedRegions.map( ( serializedSimpleRegion: TSerializedSimpleRegion ) => GeneralSimpleRegion.deserializeSimpleRegion( board, serializedSimpleRegion ) ) ),
      new Set( serializedAction.removedRegions.map( ( serializedSimpleRegion: TSerializedSimpleRegion ) => GeneralSimpleRegion.deserializeSimpleRegion( board, serializedSimpleRegion ) ) ),
      new Set( serializedAction.addedWeirdEdges.map( ( serializedEdge: TSerializedEdge ) => deserializeEdge( board, serializedEdge ) ) ),
      new Set( serializedAction.removedWeirdEdges.map( ( serializedEdge: TSerializedEdge ) => deserializeEdge( board, serializedEdge ) ) )
    );
  }
}