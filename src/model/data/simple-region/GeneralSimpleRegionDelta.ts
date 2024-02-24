import { GeneralSimpleRegionAction } from './GeneralSimpleRegionAction.ts';
import { TDelta } from '../core/TDelta.ts';
import { serializeSimpleRegionData, TSerializedSimpleRegionData, TSimpleRegion, TSimpleRegionData } from './TSimpleRegionData.ts';
import { TinyEmitter } from 'phet-lib/axon';
import { TEdge } from '../../board/core/TEdge.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TState } from '../core/TState.ts';
import { TVertex } from '../../board/core/TVertex.ts';

export class GeneralSimpleRegionDelta extends GeneralSimpleRegionAction implements TDelta<TSimpleRegionData> {

  public readonly simpleRegionsChangedEmitter = new TinyEmitter<[ addedRegions: Iterable<TSimpleRegion>, removedRegions: Iterable<TSimpleRegion>, addedWeirdEdges: Iterable<TEdge>, removedWeirdEdges: Iterable<TEdge> ]>;

  public constructor(
    board: TBoard,
    public readonly parentState: TState<TSimpleRegionData>,
    addedRegions: Set<TSimpleRegion> = new Set(),
    removedRegions: Set<TSimpleRegion> = new Set(),
    addedWeirdEdges: Set<TEdge> = new Set(),
    removedWeirdEdges: Set<TEdge> = new Set()
  ) {
    super( board, addedRegions, removedRegions, addedWeirdEdges, removedWeirdEdges );
  }

  public getSimpleRegions(): TSimpleRegion[] {
    return [
      ...this.parentState.getSimpleRegions().filter( simpleRegion => !this.removedRegions.has( simpleRegion ) ),
      ...this.addedRegions
    ];
  }

  // TODO: make more efficient
  public getSimpleRegionWithVertex( vertex: TVertex ): TSimpleRegion | null {
    for ( const simpleRegion of this.getSimpleRegions() ) {
      if ( simpleRegion.a === vertex || simpleRegion.b === vertex ) {
        return simpleRegion;
      }
    }
    return null;
  }

  public getSimpleRegionWithEdge( edge: TEdge ): TSimpleRegion | null {
    for ( const simpleRegion of this.getSimpleRegions() ) {
      if ( simpleRegion.edges.includes( edge ) ) {
        return simpleRegion;
      }
    }
    return null;
  }

  public getSimpleRegionWithId( id: number ): TSimpleRegion | null {
    for ( const simpleRegion of this.getSimpleRegions() ) {
      if ( simpleRegion.id === id ) {
        return simpleRegion;
      }
    }
    return null;
  }

  public getWeirdEdges(): TEdge[] {
    return [
      ...this.parentState.getWeirdEdges().filter( edge => !this.removedWeirdEdges.has( edge ) ),
      ...this.addedWeirdEdges
    ];
  }

  public modifyRegions(
    addedRegions: Iterable<TSimpleRegion>,
    removedRegions: Iterable<TSimpleRegion>,
    addedWeirdEdges: Iterable<TEdge>,
    removedWeirdEdges: Iterable<TEdge>
  ): void {
    for ( const removedRegion of removedRegions ) {
      if ( this.addedRegions.has( removedRegion ) ) {
        this.addedRegions.delete( removedRegion );
      }
      else {
        this.removedRegions.add( removedRegion );
      }
    }
    for ( const newRegion of addedRegions ) {
      this.addedRegions.add( newRegion );
    }
    for ( const removedEdge of removedWeirdEdges ) {
      if ( this.addedWeirdEdges.has( removedEdge ) ) {
        this.addedWeirdEdges.delete( removedEdge );
      }
      else {
        this.removedWeirdEdges.add( removedEdge );
      }
    }
    for ( const newEdge of addedWeirdEdges ) {
      this.addedWeirdEdges.add( newEdge );
    }
    this.simpleRegionsChangedEmitter.emit( addedRegions, removedRegions, addedWeirdEdges, removedWeirdEdges );
  }

  public clone(): GeneralSimpleRegionDelta {
    return new GeneralSimpleRegionDelta( this.board, this.parentState, new Set( this.addedRegions ), new Set( this.removedRegions ), new Set( this.addedWeirdEdges ), new Set( this.removedWeirdEdges ) );
  }

  public createDelta(): TDelta<TSimpleRegionData> {
    return new GeneralSimpleRegionDelta( this.board, this );
  }

  public serializeState( board: TBoard ): TSerializedSimpleRegionData {
    return serializeSimpleRegionData( this );
  }
}