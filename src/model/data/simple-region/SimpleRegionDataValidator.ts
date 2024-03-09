import { TSerializedState, TState } from '../core/TState.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TDelta } from '../core/TDelta.ts';
import { TinyEmitter } from 'phet-lib/axon';
import { TSolvedPuzzle } from '../../generator/TSolvedPuzzle.ts';
import { TStructure } from '../../board/core/TStructure.ts';
import { TFaceData } from '../face/TFaceData.ts';
import { TSimpleRegion, TSimpleRegionData } from './TSimpleRegionData.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import { TVertex } from '../../board/core/TVertex.ts';
import { InvalidStateError } from '../../solver/InvalidStateError.ts';

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
    private readonly solvedPuzzle: TSolvedPuzzle<TStructure, TFaceData & TSimpleRegionData>
  ) {}

  public getSimpleRegions(): TSimpleRegion[] {
    throw new Error( 'unimplemented' );
  }

  public getSimpleRegionWithVertex( vertex: TVertex ): TSimpleRegion | null {
    throw new Error( 'unimplemented' );
  }

  public getSimpleRegionWithEdge( edge: TEdge ): TSimpleRegion | null {
    throw new Error( 'unimplemented' );
  }

  public getSimpleRegionWithId( id: number ): TSimpleRegion | null {
    throw new Error( 'unimplemented' );
  }

  public getWeirdEdges(): TEdge[] {
    throw new Error( 'unimplemented' );
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