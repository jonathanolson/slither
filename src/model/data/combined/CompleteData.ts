import { TState } from '../core/TState.ts';
import { serializeCompleteData, TCompleteData, TSerializedCompleteData } from './TCompleteData.ts';
import { TFaceData } from '../face/TFaceData.ts';
import { TEdgeData } from '../edge/TEdgeData.ts';
import { TSimpleRegion, TSimpleRegionData } from '../simple-region/TSimpleRegionData.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TFace } from '../../board/core/TFace.ts';
import FaceState from '../face/FaceState.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import EdgeState from '../edge/EdgeState.ts';
import { GeneralFaceData } from '../face/GeneralFaceData.ts';
import { GeneralEdgeData } from '../edge/GeneralEdgeData.ts';
import { TVertex } from '../../board/core/TVertex.ts';
import { TDelta } from '../core/TDelta.ts';
import { Vector2 } from 'phet-lib/dot';
import { TEmitter, TinyEmitter } from 'phet-lib/axon';
import { CompleteDelta } from './CompleteDelta.ts';
import { GeneralSimpleRegionData } from '../simple-region/GeneralSimpleRegionData.ts';
import { TFaceColor, TFaceColorData } from '../face-color/TFaceColorData.ts';
import { GeneralFaceColorData } from '../face-color/GeneralFaceColorData.ts';
import { TSectorData } from '../sector/TSectorData.ts';
import { GeneralSectorData } from '../sector/GeneralSectorData.ts';
import { TSector } from '../sector/TSector.ts';
import SectorState from '../sector/SectorState.ts';
import { MultiIterable } from '../../../workarounds/MultiIterable.ts';

export class CompleteData implements TState<TCompleteData> {

  public readonly anyStateChangedEmitter: TEmitter = new TinyEmitter();

  // TODO: can we do trait/mixin stuff to support a better way of doing this? TS has been picky with traits before
  public constructor(
    public readonly faceData: TState<TFaceData>,
    public readonly edgeData: TState<TEdgeData>,
    public readonly simpleRegionData: TState<TSimpleRegionData>,
    public readonly faceColorData: TState<TFaceColorData>,
    public readonly sectorData: TState<TSectorData>
  ) {
    const anyChangeListener = () => this.anyStateChangedEmitter.emit();
    faceData.faceStateChangedEmitter.addListener( anyChangeListener );
    edgeData.edgeStateChangedEmitter.addListener( anyChangeListener );
    simpleRegionData.simpleRegionsChangedEmitter.addListener( anyChangeListener );
    faceColorData.faceColorsChangedEmitter.addListener( anyChangeListener );
    sectorData.sectorChangedEmitter.addListener( anyChangeListener );
  }

  public static fromFacesEdges(
    board: TBoard,
    getInitialFaceState: ( face: TFace ) => FaceState,
    getInitialEdgeState: ( edge: TEdge ) => EdgeState
  ): CompleteData {
    return new CompleteData(
      new GeneralFaceData( board, getInitialFaceState ),
      new GeneralEdgeData( board, getInitialEdgeState ),
      new GeneralSimpleRegionData( board ),
      new GeneralFaceColorData( board ),
      new GeneralSectorData( board )
    );
  }

  public static fromFaces(
    board: TBoard,
    getInitialFaceState: ( face: TFace ) => FaceState
  ): CompleteData {
    return CompleteData.fromFacesEdges( board, getInitialFaceState, () => EdgeState.WHITE );
  }

  public static fromFaceData(
    board: TBoard,
    faceData: TFaceData
  ): CompleteData {
    return CompleteData.fromFaces( board, face => faceData.getFaceState( face ) );
  }

  public static empty(
    board: TBoard
  ): CompleteData {
    return CompleteData.fromFaces( board, () => null );
  }

  public static faceMapLookup( faceMap: Map<Vector2, FaceState> ): ( ( face: TFace ) => FaceState ) {
    const stringMap = new Map( Array.from( faceMap.entries() ).map( ( [ key, value ] ) => [ `${key.x},${key.y}`, value ] ) );
    return ( face: TFace ) => {
      const value = stringMap.get( `${face.logicalCoordinates.x},${face.logicalCoordinates.y}` );
      return value !== undefined ? value : null;
    };
  }

  public getFaceState( face: TFace ): FaceState {
    return this.faceData.getFaceState( face );
  }

  public setFaceState( face: TFace, state: FaceState ): void {
    this.faceData.setFaceState( face, state );
  }

  public get faceStateChangedEmitter(): TEmitter<[ TFace, FaceState ]> {
    return this.faceData.faceStateChangedEmitter;
  }

  public getEdgeState( edge: TEdge ): EdgeState {
    return this.edgeData.getEdgeState( edge );
  }

  public setEdgeState( edge: TEdge, state: EdgeState ): void {
    this.edgeData.setEdgeState( edge, state );
  }

  public get edgeStateChangedEmitter(): TEmitter<[ edge: TEdge, state: EdgeState, oldState: EdgeState ]> {
    return this.edgeData.edgeStateChangedEmitter;
  }

  public getSimpleRegions(): TSimpleRegion[] {
    return this.simpleRegionData.getSimpleRegions();
  }

  public getSimpleRegionWithVertex( vertex: TVertex ): TSimpleRegion | null {
    return this.simpleRegionData.getSimpleRegionWithVertex( vertex );
  }

  public getSimpleRegionWithEdge( edge: TEdge ): TSimpleRegion | null {
    return this.simpleRegionData.getSimpleRegionWithEdge( edge );
  }

  public getSimpleRegionWithId( id: number ): TSimpleRegion | null {
    return this.simpleRegionData.getSimpleRegionWithId( id );
  }

  public getWeirdEdges(): TEdge[] {
    return this.simpleRegionData.getWeirdEdges();
  }

  public modifyRegions(
    addedRegions: MultiIterable<TSimpleRegion>,
    removedRegions: MultiIterable<TSimpleRegion>,
    addedWeirdEdges: MultiIterable<TEdge>,
    removedWeirdEdges: MultiIterable<TEdge>
  ): void {
    this.simpleRegionData.modifyRegions( addedRegions, removedRegions, addedWeirdEdges, removedWeirdEdges );
  }

  public get simpleRegionsChangedEmitter(): TEmitter<[
    addedRegions: MultiIterable<TSimpleRegion>,
    removedRegions: MultiIterable<TSimpleRegion>,
    addedWeirdEdges: MultiIterable<TEdge>,
    removedWeirdEdges: MultiIterable<TEdge>
  ]> {
    return this.simpleRegionData.simpleRegionsChangedEmitter;
  }

  public getFaceColors(): TFaceColor[] {
    return this.faceColorData.getFaceColors();
  }
  
  public getInsideColor(): TFaceColor {
    return this.faceColorData.getInsideColor();
  }
  
  public getOutsideColor(): TFaceColor {
    return this.faceColorData.getOutsideColor();
  }

  public getFaceColor( face: TFace ): TFaceColor {
    return this.faceColorData.getFaceColor( face );
  }
  
  public getFacesWithColor( faceColor: TFaceColor ): TFace[] {
    return this.faceColorData.getFacesWithColor( faceColor );
  }
  
  public getFaceColorMap(): Map<TFace, TFaceColor> {
    return this.faceColorData.getFaceColorMap();
  }
  
  public getOppositeFaceColor( faceColor: TFaceColor ): TFaceColor | null {
    return this.faceColorData.getOppositeFaceColor( faceColor );
  }

  public hasInvalidFaceColors(): boolean {
    return this.faceColorData.hasInvalidFaceColors();
  }

  public modifyFaceColors(
    addedFaceColors: MultiIterable<TFaceColor>,
    removedFaceColors: MultiIterable<TFaceColor>,
    faceChangeMap: Map<TFace, TFaceColor>,
    oppositeChangeMap: Map<TFaceColor, TFaceColor>,
    invalidFaceColor: boolean
  ): void {
    this.faceColorData.modifyFaceColors( addedFaceColors, removedFaceColors, faceChangeMap, oppositeChangeMap, invalidFaceColor );
  }

  public get faceColorsChangedEmitter(): TEmitter<[
    addedFaceColors: MultiIterable<TFaceColor>,
    removedFaceColors: MultiIterable<TFaceColor>,
    oppositeChangedFaceColors: MultiIterable<TFaceColor>,
    changedFaces: MultiIterable<TFace>,
  ]> {
    return this.faceColorData.faceColorsChangedEmitter;
  }

  public getSectorState( sector: TSector ): SectorState {
    return this.sectorData.getSectorState( sector );
  }

  public setSectorState( sector: TSector, state: SectorState ): void {
    this.sectorData.setSectorState( sector, state );
  }

  public get sectorChangedEmitter(): TEmitter<[ edge: TSector, state: SectorState, oldState: SectorState ]> {
    return this.sectorData.sectorChangedEmitter;
  }

  public clone(): CompleteData {
    return new CompleteData( this.faceData.clone(), this.edgeData.clone(), this.simpleRegionData.clone(), this.faceColorData.clone(), this.sectorData.clone() );
  }

  public createDelta(): TDelta<TCompleteData> {
    return new CompleteDelta(
      this.faceData.createDelta(),
      this.edgeData.createDelta(),
      this.simpleRegionData.createDelta(),
      this.faceColorData.createDelta(),
      this.sectorData.createDelta()
    );
  }

  public serializeState( board: TBoard ): TSerializedCompleteData {
    return serializeCompleteData( board, this );
  }

  public static deserializeState( board: TBoard, serializedCompleteData: TSerializedCompleteData ): CompleteData {
    return new CompleteData(
      GeneralFaceData.deserializeState( board, serializedCompleteData.faceData ),
      GeneralEdgeData.deserializeState( board, serializedCompleteData.edgeData ),
      // TODO: get a setup so we can avoid shipping this data
      serializedCompleteData.simpleRegionData ? GeneralSimpleRegionData.deserializeState( board, serializedCompleteData.simpleRegionData ) : new GeneralSimpleRegionData( board ),
      // TODO: get a setup so we can avoid shipping this data
      serializedCompleteData.faceColorData ? GeneralFaceColorData.deserializeState( board, serializedCompleteData.faceColorData ) : new GeneralFaceColorData( board ),
      serializedCompleteData.sectorData ? GeneralSectorData.deserializeState( board, serializedCompleteData.sectorData ) : new GeneralSectorData( board )
    );
  }
}