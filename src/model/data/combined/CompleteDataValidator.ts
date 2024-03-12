import { TState } from '../core/TState.ts';
import { TCompleteData, TSerializedCompleteData } from './TCompleteData.ts';
import { TFaceData } from '../face/TFaceData.ts';
import { TEdgeData } from '../edge/TEdgeData.ts';
import { TSimpleRegion, TSimpleRegionData } from '../simple-region/TSimpleRegionData.ts';
import { TFace } from '../../board/core/TFace.ts';
import FaceState from '../face/FaceState.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import EdgeState from '../edge/EdgeState.ts';
import { TVertex } from '../../board/core/TVertex.ts';
import { TEmitter, TinyEmitter } from 'phet-lib/axon';
import { TFaceColor, TFaceColorData } from '../face-color/TFaceColorData.ts';
import { EdgeDataValidator } from '../edge/EdgeDataValidator.ts';
import { FaceColorValidator } from '../face-color/FaceColorValidator.ts';
import { SimpleRegionDataValidator } from '../simple-region/SimpleRegionDataValidator.ts';
import { FaceDataValidator } from '../face/FaceDataValidator.ts';
import { TDelta } from '../core/TDelta.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { TSectorData } from '../sector/TSectorData.ts';
import { SectorDataValidator } from '../sector/SectorDataValidator.ts';
import { TSector } from '../sector/TSector.ts';
import SectorState from '../sector/SectorState.ts';
import { MultiIterable } from '../../../workarounds/MultiIterable.ts';

export class CompleteDataValidator implements TState<TCompleteData> {

  public readonly anyStateChangedEmitter: TEmitter = new TinyEmitter();

  private readonly edgeDataValidator: TState<TEdgeData>;
  private readonly faceDataValidator: TState<TFaceData>;
  private readonly simpleRegionDataValidator: TState<TSimpleRegionData>;
  private readonly faceColorValidator: TState<TFaceColorData>;
  private readonly sectorValidator: TState<TSectorData>;

  public constructor(
    board: TBoard,
    currentState: TState<TCompleteData>,
    solvedState: TState<TCompleteData>
  ) {
    assertEnabled() && assert( board );
    assertEnabled() && assert( solvedState );

    this.edgeDataValidator = new EdgeDataValidator( board, currentState, solvedState );
    this.faceDataValidator = new FaceDataValidator( board, currentState, solvedState );
    this.simpleRegionDataValidator = new SimpleRegionDataValidator( board, currentState, solvedState );
    this.faceColorValidator = new FaceColorValidator( board, currentState, solvedState ); // TODO: naming discrepancies
    this.sectorValidator = new SectorDataValidator( board, currentState, solvedState );
  }

  public getFaceState( face: TFace ): FaceState {
    return this.faceDataValidator.getFaceState( face );
  }

  public setFaceState( face: TFace, state: FaceState ): void {
    this.faceDataValidator.setFaceState( face, state );
  }

  public get faceStateChangedEmitter(): TEmitter<[ TFace, FaceState ]> {
    return this.faceDataValidator.faceStateChangedEmitter;
  }

  public getEdgeState( edge: TEdge ): EdgeState {
    return this.edgeDataValidator.getEdgeState( edge );
  }

  public setEdgeState( edge: TEdge, state: EdgeState ): void {
    this.edgeDataValidator.setEdgeState( edge, state );
  }

  public get edgeStateChangedEmitter(): TEmitter<[ edge: TEdge, state: EdgeState, oldState: EdgeState ]> {
    return this.edgeDataValidator.edgeStateChangedEmitter;
  }

  public getSimpleRegions(): TSimpleRegion[] {
    return this.simpleRegionDataValidator.getSimpleRegions();
  }

  public getSimpleRegionWithVertex( vertex: TVertex ): TSimpleRegion | null {
    return this.simpleRegionDataValidator.getSimpleRegionWithVertex( vertex );
  }

  public getSimpleRegionWithEdge( edge: TEdge ): TSimpleRegion | null {
    return this.simpleRegionDataValidator.getSimpleRegionWithEdge( edge );
  }

  public getSimpleRegionWithId( id: number ): TSimpleRegion | null {
    return this.simpleRegionDataValidator.getSimpleRegionWithId( id );
  }

  public getWeirdEdges(): TEdge[] {
    return this.simpleRegionDataValidator.getWeirdEdges();
  }

  public modifyRegions(
    addedRegions: MultiIterable<TSimpleRegion>,
    removedRegions: MultiIterable<TSimpleRegion>,
    addedWeirdEdges: MultiIterable<TEdge>,
    removedWeirdEdges: MultiIterable<TEdge>
  ): void {
    this.simpleRegionDataValidator.modifyRegions( addedRegions, removedRegions, addedWeirdEdges, removedWeirdEdges );
  }

  public get simpleRegionsChangedEmitter(): TEmitter<[
    addedRegions: MultiIterable<TSimpleRegion>,
    removedRegions: MultiIterable<TSimpleRegion>,
    addedWeirdEdges: MultiIterable<TEdge>,
    removedWeirdEdges: MultiIterable<TEdge>
  ]> {
    return this.simpleRegionDataValidator.simpleRegionsChangedEmitter;
  }

  public getFaceColors(): TFaceColor[] {
    return this.faceColorValidator.getFaceColors();
  }

  public getInsideColor(): TFaceColor {
    return this.faceColorValidator.getInsideColor();
  }

  public getOutsideColor(): TFaceColor {
    return this.faceColorValidator.getOutsideColor();
  }

  public getFaceColor( face: TFace ): TFaceColor {
    return this.faceColorValidator.getFaceColor( face );
  }

  public getFacesWithColor( faceColor: TFaceColor ): TFace[] {
    return this.faceColorValidator.getFacesWithColor( faceColor );
  }

  public getFaceColorMap(): Map<TFace, TFaceColor> {
    return this.faceColorValidator.getFaceColorMap();
  }

  public getOppositeFaceColor( faceColor: TFaceColor ): TFaceColor | null {
    return this.faceColorValidator.getOppositeFaceColor( faceColor );
  }

  public hasInvalidFaceColors(): boolean {
    return this.faceColorValidator.hasInvalidFaceColors();
  }

  public modifyFaceColors(
    addedFaceColors: MultiIterable<TFaceColor>,
    removedFaceColors: MultiIterable<TFaceColor>,
    faceChangeMap: Map<TFace, TFaceColor>,
    oppositeChangeMap: Map<TFaceColor, TFaceColor>,
    invalidFaceColor: boolean
  ): void {
    this.faceColorValidator.modifyFaceColors( addedFaceColors, removedFaceColors, faceChangeMap, oppositeChangeMap, invalidFaceColor );
  }

  public get faceColorsChangedEmitter(): TEmitter<[
    addedFaceColors: MultiIterable<TFaceColor>,
    removedFaceColors: MultiIterable<TFaceColor>,
    oppositeChangedFaceColors: MultiIterable<TFaceColor>,
    changedFaces: MultiIterable<TFace>,
  ]> {
    return this.faceColorValidator.faceColorsChangedEmitter;
  }

  public getSectorState( sector: TSector ): SectorState {
    return this.sectorValidator.getSectorState( sector );
  }

  public setSectorState( sector: TSector, state: SectorState ): void {
    this.sectorValidator.setSectorState( sector, state );
  }

  public get sectorChangedEmitter(): TEmitter<[ edge: TSector, state: SectorState, oldState: SectorState ]> {
    return this.sectorValidator.sectorChangedEmitter;
  }

  public clone(): CompleteDataValidator {
    return this;
  }

  public createDelta(): TDelta<TCompleteData> {
    return this as unknown as TDelta<TCompleteData>;
  }

  public serializeState( board: TBoard ): TSerializedCompleteData {
    throw new Error( 'unimplemented' );
  }
}