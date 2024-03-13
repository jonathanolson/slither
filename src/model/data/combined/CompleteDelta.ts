import { CompleteAction } from './CompleteAction.ts';
import { TDelta } from '../core/TDelta.ts';
import { serializeCompleteData, TCompleteData, TSerializedCompleteData } from './TCompleteData.ts';
import { TFaceValueData } from '../face-value/TFaceValueData.ts';
import { TEdgeStateData } from '../edge-state/TEdgeStateData.ts';
import { TSimpleRegion, TSimpleRegionData } from '../simple-region/TSimpleRegionData.ts';
import { TFace } from '../../board/core/TFace.ts';
import FaceValue from '../face-value/FaceValue.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import EdgeState from '../edge-state/EdgeState.ts';
import { TVertex } from '../../board/core/TVertex.ts';
import { TEmitter, TinyEmitter } from 'phet-lib/axon';
import { TBoard } from '../../board/core/TBoard.ts';
import { TFaceColor, TFaceColorData } from '../face-color/TFaceColorData.ts';
import { TSectorStateData } from '../sector-state/TSectorStateData.ts';
import { TSector } from '../sector-state/TSector.ts';
import SectorState from '../sector-state/SectorState.ts';
import { MultiIterable } from '../../../workarounds/MultiIterable.ts';
import { TVertexStateData } from '../vertex-state/TVertexStateData.ts';
import { VertexState } from '../vertex-state/VertexState.ts';

export class CompleteDelta extends CompleteAction implements TDelta<TCompleteData> {

  public readonly anyStateChangedEmitter: TEmitter = new TinyEmitter();

  public constructor(
    public readonly faceValueDelta: TDelta<TFaceValueData>,
    public readonly edgeStateDelta: TDelta<TEdgeStateData>,
    public readonly simpleRegionDelta: TDelta<TSimpleRegionData>,
    public readonly faceColorDelta: TDelta<TFaceColorData>,
    public readonly sectorStateDelta: TDelta<TSectorStateData>,
    public readonly vertexStateDelta: TDelta<TVertexStateData>
  ) {
    super( faceValueDelta, edgeStateDelta, simpleRegionDelta, faceColorDelta, sectorStateDelta, vertexStateDelta );

    const anyChangeListener = () => this.anyStateChangedEmitter.emit();
    faceValueDelta.faceValueChangedEmitter.addListener( anyChangeListener );
    edgeStateDelta.edgeStateChangedEmitter.addListener( anyChangeListener );
    simpleRegionDelta.simpleRegionsChangedEmitter.addListener( anyChangeListener );
    faceColorDelta.faceColorsChangedEmitter.addListener( anyChangeListener );
    sectorStateDelta.sectorStateChangedEmitter.addListener( anyChangeListener );
    vertexStateDelta.vertexStateChangedEmitter.addListener( anyChangeListener );
  }

  public getFaceValue( face: TFace ): FaceValue {
    return this.faceValueDelta.getFaceValue( face );
  }

  public setFaceValue( face: TFace, state: FaceValue ): void {
    this.faceValueDelta.setFaceValue( face, state );
  }

  public get faceValueChangedEmitter(): TEmitter<[ TFace, FaceValue ]> {
    return this.faceValueDelta.faceValueChangedEmitter;
  }

  public getEdgeState( edge: TEdge ): EdgeState {
    return this.edgeStateDelta.getEdgeState( edge );
  }

  public setEdgeState( edge: TEdge, state: EdgeState ): void {
    this.edgeStateDelta.setEdgeState( edge, state );
  }

  public get edgeStateChangedEmitter(): TEmitter<[ edge: TEdge, state: EdgeState, oldState: EdgeState ]> {
    return this.edgeStateDelta.edgeStateChangedEmitter;
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
    return this.sectorStateDelta.getSectorState( sector );
  }

  public setSectorState( sector: TSector, state: SectorState ): void {
    this.sectorStateDelta.setSectorState( sector, state );
  }

  public get sectorStateChangedEmitter(): TEmitter<[ edge: TSector, state: SectorState, oldState: SectorState ]> {
    return this.sectorStateDelta.sectorStateChangedEmitter;
  }

  public getVertexState( vertex: TVertex ): VertexState {
    return this.vertexStateDelta.getVertexState( vertex );
  }

  public setVertexState( vertex: TVertex, state: VertexState ): void {
    this.vertexStateDelta.setVertexState( vertex, state );
  }

  public get vertexStateChangedEmitter(): TEmitter<[ vertex: TVertex, state: VertexState, oldState: VertexState ]> {
    return this.vertexStateDelta.vertexStateChangedEmitter;
  }

  public clone(): CompleteDelta {
    return new CompleteDelta(
      this.faceValueDelta.clone(),
      this.edgeStateDelta.clone(),
      this.simpleRegionDelta.clone(),
      this.faceColorDelta.clone(),
      this.sectorStateDelta.clone(),
      this.vertexStateDelta.clone()
    );
  }

  public createDelta(): TDelta<TCompleteData> {
    return new CompleteDelta(
      this.faceValueDelta.createDelta(),
      this.edgeStateDelta.createDelta(),
      this.simpleRegionDelta.createDelta(),
      this.faceColorDelta.createDelta(),
      this.sectorStateDelta.createDelta(),
      this.vertexStateDelta.createDelta()
    );
  }

  public serializeState( board: TBoard ): TSerializedCompleteData {
    return serializeCompleteData( board, this );
  }
}