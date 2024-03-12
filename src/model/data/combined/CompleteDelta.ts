import { CompleteAction } from './CompleteAction.ts';
import { TDelta } from '../core/TDelta.ts';
import { serializeCompleteData, TCompleteData, TSerializedCompleteData } from './TCompleteData.ts';
import { TFaceData } from '../face/TFaceData.ts';
import { TEdgeData } from '../edge/TEdgeData.ts';
import { TSimpleRegion, TSimpleRegionData } from '../simple-region/TSimpleRegionData.ts';
import { TFace } from '../../board/core/TFace.ts';
import FaceState from '../face/FaceState.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import EdgeState from '../edge/EdgeState.ts';
import { TVertex } from '../../board/core/TVertex.ts';
import { TEmitter, TinyEmitter } from 'phet-lib/axon';
import { TBoard } from '../../board/core/TBoard.ts';
import { TFaceColor, TFaceColorData } from '../face-color/TFaceColorData.ts';
import { TSectorData } from '../sector/TSectorData.ts';
import { TSector } from '../sector/TSector.ts';
import SectorState from '../sector/SectorState.ts';
import { MultiIterable } from '../../../workarounds/MultiIterable.ts';

export class CompleteDelta extends CompleteAction implements TDelta<TCompleteData> {

  public readonly anyStateChangedEmitter: TEmitter = new TinyEmitter();

  public constructor(
    public readonly faceDelta: TDelta<TFaceData>,
    public readonly edgeDelta: TDelta<TEdgeData>,
    public readonly simpleRegionDelta: TDelta<TSimpleRegionData>,
    public readonly faceColorDelta: TDelta<TFaceColorData>,
    public readonly sectorDelta: TDelta<TSectorData>
  ) {
    super( faceDelta, edgeDelta, simpleRegionDelta, faceColorDelta, sectorDelta );

    const anyChangeListener = () => this.anyStateChangedEmitter.emit();
    faceDelta.faceStateChangedEmitter.addListener( anyChangeListener );
    edgeDelta.edgeStateChangedEmitter.addListener( anyChangeListener );
    simpleRegionDelta.simpleRegionsChangedEmitter.addListener( anyChangeListener );
    faceColorDelta.faceColorsChangedEmitter.addListener( anyChangeListener );
    sectorDelta.sectorChangedEmitter.addListener( anyChangeListener );
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

  public get edgeStateChangedEmitter(): TEmitter<[ edge: TEdge, state: EdgeState, oldState: EdgeState ]> {
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
    addedRegions: MultiIterable<TSimpleRegion>,
    removedRegions: MultiIterable<TSimpleRegion>,
    addedWeirdEdges: MultiIterable<TEdge>,
    removedWeirdEdges: MultiIterable<TEdge>
  ): void {
    this.simpleRegionDelta.modifyRegions( addedRegions, removedRegions, addedWeirdEdges, removedWeirdEdges );
  }

  public get simpleRegionsChangedEmitter(): TEmitter<[
    addedRegions: MultiIterable<TSimpleRegion>,
    removedRegions: MultiIterable<TSimpleRegion>,
    addedWeirdEdges: MultiIterable<TEdge>,
    removedWeirdEdges: MultiIterable<TEdge>
  ]> {
    return this.simpleRegionDelta.simpleRegionsChangedEmitter;
  }

  public getFaceColors(): TFaceColor[] {
    return this.faceColorDelta.getFaceColors();
  }

  public getInsideColor(): TFaceColor {
    return this.faceColorDelta.getInsideColor();
  }

  public getOutsideColor(): TFaceColor {
    return this.faceColorDelta.getOutsideColor();
  }

  public getFaceColor( face: TFace ): TFaceColor {
    return this.faceColorDelta.getFaceColor( face );
  }

  public getFacesWithColor( faceColor: TFaceColor ): TFace[] {
    return this.faceColorDelta.getFacesWithColor( faceColor );
  }

  public getFaceColorMap(): Map<TFace, TFaceColor> {
    return this.faceColorDelta.getFaceColorMap();
  }

  public getOppositeFaceColor( faceColor: TFaceColor ): TFaceColor | null {
    return this.faceColorDelta.getOppositeFaceColor( faceColor );
  }

  public hasInvalidFaceColors(): boolean {
    return this.faceColorDelta.hasInvalidFaceColors();
  }

  public modifyFaceColors(
    addedFaceColors: MultiIterable<TFaceColor>,
    removedFaceColors: MultiIterable<TFaceColor>,
    faceChangeMap: Map<TFace, TFaceColor>,
    oppositeChangeMap: Map<TFaceColor, TFaceColor>,
    invalidFaceColor: boolean
  ): void {
    this.faceColorDelta.modifyFaceColors( addedFaceColors, removedFaceColors, faceChangeMap, oppositeChangeMap, invalidFaceColor );
  }

  public get faceColorsChangedEmitter(): TEmitter<[
    addedFaceColors: MultiIterable<TFaceColor>,
    removedFaceColors: MultiIterable<TFaceColor>,
    oppositeChangedFaceColors: MultiIterable<TFaceColor>,
    changedFaces: MultiIterable<TFace>,
  ]> {
    return this.faceColorDelta.faceColorsChangedEmitter;
  }

  public getSectorState( sector: TSector ): SectorState {
    return this.sectorDelta.getSectorState( sector );
  }

  public setSectorState( sector: TSector, state: SectorState ): void {
    this.sectorDelta.setSectorState( sector, state );
  }

  public get sectorChangedEmitter(): TEmitter<[ edge: TSector, state: SectorState, oldState: SectorState ]> {
    return this.sectorDelta.sectorChangedEmitter;
  }

  public clone(): CompleteDelta {
    return new CompleteDelta( this.faceDelta.clone(), this.edgeDelta.clone(), this.simpleRegionDelta.clone(), this.faceColorDelta.clone(), this.sectorDelta.clone() );
  }

  public createDelta(): TDelta<TCompleteData> {
    return new CompleteDelta( this.faceDelta.createDelta(), this.edgeDelta.createDelta(), this.simpleRegionDelta.createDelta(), this.faceColorDelta.createDelta(), this.sectorDelta.createDelta() );
  }

  public serializeState( board: TBoard ): TSerializedCompleteData {
    return serializeCompleteData( board, this );
  }
}