import { TAction } from '../core/TAction.ts';
import { TSimpleRegion, TSimpleRegionData } from './TSimpleRegionData.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TEdge } from '../../board/core/TEdge.ts';

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
}