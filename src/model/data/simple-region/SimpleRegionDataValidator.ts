import { TSerializedState, TState } from '../core/TState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TDelta } from '../core/TDelta.ts';
import { TinyEmitter } from 'phet-lib/axon';
import { TSimpleRegion, TSimpleRegionData } from './TSimpleRegionData.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import { TVertex } from '../../board/core/TVertex.ts';
import { InvalidStateError } from '../../solver/errors/InvalidStateError.ts';

// TODO: can we... ditch the TState part of this? In a way it is useful though
export class SimpleRegionDataValidator implements TState<TSimpleRegionData> {

  public readonly simpleRegionsChangedEmitter = new TinyEmitter<[
    addedRegions: Iterable<TSimpleRegion>,
    removedRegions: Iterable<TSimpleRegion>,
    addedWeirdEdges: Iterable<TEdge>,
    removedWeirdEdges: Iterable<TEdge>
  ]>();

  public constructor(
    // @ts-expect-error
    private readonly board: TBoard,
    private readonly currentState: TState<TSimpleRegionData>,
    // @ts-expect-error
    private readonly solvedState: TState<TSimpleRegionData>
  ) {}

  public getSimpleRegions(): TSimpleRegion[] {
    return this.currentState.getSimpleRegions();
  }

  public getSimpleRegionWithVertex( vertex: TVertex ): TSimpleRegion | null {
    return this.currentState.getSimpleRegionWithVertex( vertex );
  }

  public getSimpleRegionWithEdge( edge: TEdge ): TSimpleRegion | null {
    return this.currentState.getSimpleRegionWithEdge( edge );
  }

  public getSimpleRegionWithId( id: number ): TSimpleRegion | null {
    return this.currentState.getSimpleRegionWithId( id );
  }

  public getWeirdEdges(): TEdge[] {
    return this.currentState.getWeirdEdges();
  }

  public modifyRegions(
    addedRegions: Iterable<TSimpleRegion>,
    removedRegions: Iterable<TSimpleRegion>,
    addedWeirdEdges: Iterable<TEdge>,
    removedWeirdEdges: Iterable<TEdge>
  ): void {
    if ( [ ...addedWeirdEdges ].length ) {
      throw new InvalidStateError( 'weird edges added' );
    }

    // NOTE: we rely on the edge validator
  }

  public clone(): SimpleRegionDataValidator {
    return this;
  }

  public createDelta(): TDelta<TSimpleRegionData> {
    return this as unknown as TDelta<TSimpleRegionData>;
  }

  public serializeState( board: TBoard ): TSerializedState {
    throw new Error( 'unimplemented' );
  }
}