import { CompleteAction } from './CompleteAction.ts';
import { TDelta } from '../core/TDelta.ts';
import { TCompleteData } from './TCompleteData.ts';
import { TFaceData } from '../face/TFaceData.ts';
import { TEdgeData } from '../edge/TEdgeData.ts';
import { TSimpleRegion, TSimpleRegionData } from '../simple-region/TSimpleRegionData.ts';
import { TFace } from '../../board/core/TFace.ts';
import FaceState from '../face/FaceState.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import EdgeState from '../edge/EdgeState.ts';
import { TVertex } from '../../board/core/TVertex.ts';
import { TEmitter } from 'phet-lib/axon';

export class CompleteDelta extends CompleteAction implements TDelta<TCompleteData> {
  public constructor(
    public readonly faceDelta: TDelta<TFaceData>,
    public readonly edgeDelta: TDelta<TEdgeData>,
    public readonly simpleRegionDelta: TDelta<TSimpleRegionData>
  ) {
    super( faceDelta, edgeDelta, simpleRegionDelta );
  }

  public getFaceState( face: TFace ): FaceState {
    return this.faceDelta.getFaceState( face );
  }

  public setFaceState( face: TFace, state: FaceState ): void {
    this.faceDelta.setFaceState( face, state );
  }

  public get faceStateChangedEmitter(): TEmitter<[ TFace, FaceState ]> {
    return this.faceDelta.faceStateChangedEmitter;
  }

  public getEdgeState( edge: TEdge ): EdgeState {
    return this.edgeDelta.getEdgeState( edge );
  }

  public setEdgeState( edge: TEdge, state: EdgeState ): void {
    this.edgeDelta.setEdgeState( edge, state );
  }

  public get edgeStateChangedEmitter(): TEmitter<[ TEdge, EdgeState ]> {
    return this.edgeDelta.edgeStateChangedEmitter;
  }

  public getSimpleRegions(): TSimpleRegion[] {
    return this.simpleRegionDelta.getSimpleRegions();
  }

  public getSimpleRegionWithVertex( vertex: TVertex ): TSimpleRegion | null {
    return this.simpleRegionDelta.getSimpleRegionWithVertex( vertex );
  }

  public getSimpleRegionWithEdge( edge: TEdge ): TSimpleRegion | null {
    return this.simpleRegionDelta.getSimpleRegionWithEdge( edge );
  }

  public getSimpleRegionWithId( id: number ): TSimpleRegion | null {
    return this.simpleRegionDelta.getSimpleRegionWithId( id );
  }

  public getWeirdEdges(): TEdge[] {
    return this.simpleRegionDelta.getWeirdEdges();
  }

  public modifyRegions(
    addedRegions: Iterable<TSimpleRegion>,
    removedRegions: Iterable<TSimpleRegion>,
    addedWeirdEdges: Iterable<TEdge>,
    removedWeirdEdges: Iterable<TEdge>
  ): void {
    this.simpleRegionDelta.modifyRegions( addedRegions, removedRegions, addedWeirdEdges, removedWeirdEdges );
  }

  public get simpleRegionsChangedEmitter(): TEmitter<[
    addedRegions: Iterable<TSimpleRegion>,
    removedRegions: Iterable<TSimpleRegion>,
    addedWeirdEdges: Iterable<TEdge>,
    removedWeirdEdges: Iterable<TEdge>
  ]> {
    return this.simpleRegionDelta.simpleRegionsChangedEmitter;
  }

  public clone(): CompleteDelta {
    return new CompleteDelta( this.faceDelta.clone(), this.edgeDelta.clone(), this.simpleRegionDelta.clone() );
  }

  public createDelta(): TDelta<TCompleteData> {
    return new CompleteDelta( this.faceDelta.createDelta(), this.edgeDelta.createDelta(), this.simpleRegionDelta.createDelta() );
  }
}