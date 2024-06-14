import { TState } from '../core/TState.ts';
import { serializeCompleteData, TCompleteData, TSerializedCompleteData } from './TCompleteData.ts';
import { TFaceValueData } from '../face-value/TFaceValueData.ts';
import { TEdgeStateData } from '../edge-state/TEdgeStateData.ts';
import { TSimpleRegion, TSimpleRegionData } from '../simple-region/TSimpleRegionData.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TFace } from '../../board/core/TFace.ts';
import FaceValue from '../face-value/FaceValue.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import EdgeState from '../edge-state/EdgeState.ts';
import { GeneralFaceValueData } from '../face-value/GeneralFaceValueData.ts';
import { GeneralEdgeStateData } from '../edge-state/GeneralEdgeStateData.ts';
import { TVertex } from '../../board/core/TVertex.ts';
import { TDelta } from '../core/TDelta.ts';
import { Vector2 } from 'phet-lib/dot';
import { TEmitter, TinyEmitter } from 'phet-lib/axon';
import { CompleteDelta } from './CompleteDelta.ts';
import { GeneralSimpleRegionData } from '../simple-region/GeneralSimpleRegionData.ts';
import { TFaceColor, TFaceColorData } from '../face-color/TFaceColorData.ts';
import { GeneralFaceColorData } from '../face-color/GeneralFaceColorData.ts';
import { TSectorStateData } from '../sector-state/TSectorStateData.ts';
import { GeneralSectorStateData } from '../sector-state/GeneralSectorStateData.ts';
import { TSector } from '../sector-state/TSector.ts';
import SectorState from '../sector-state/SectorState.ts';
import { MultiIterable } from '../../../workarounds/MultiIterable.ts';
import { TVertexStateData } from '../vertex-state/TVertexStateData.ts';
import { GeneralVertexStateData } from '../vertex-state/GeneralVertexStateData.ts';
import { VertexState } from '../vertex-state/VertexState.ts';
import { TFaceStateData } from '../face-state/TFaceStateData.ts';
import { GeneralFaceStateData } from '../face-state/GeneralFaceStateData.ts';
import { FaceState } from '../face-state/FaceState.ts';

export class CompleteData implements TState<TCompleteData> {
  public readonly anyStateChangedEmitter: TEmitter = new TinyEmitter();

  // TODO: can we do trait/mixin stuff to support a better way of doing this? TS has been picky with traits before
  public constructor(
    public readonly faceValueData: TState<TFaceValueData>,
    public readonly edgeStateData: TState<TEdgeStateData>,
    public readonly simpleRegionData: TState<TSimpleRegionData>,
    public readonly faceColorData: TState<TFaceColorData>,
    public readonly sectorStateData: TState<TSectorStateData>,
    public readonly vertexStateData: TState<TVertexStateData>,
    public readonly faceStateData: TState<TFaceStateData>,
  ) {
    const anyChangeListener = () => this.anyStateChangedEmitter.emit();
    faceValueData.faceValueChangedEmitter.addListener(anyChangeListener);
    edgeStateData.edgeStateChangedEmitter.addListener(anyChangeListener);
    simpleRegionData.simpleRegionsChangedEmitter.addListener(anyChangeListener);
    faceColorData.faceColorsChangedEmitter.addListener(anyChangeListener);
    sectorStateData.sectorStateChangedEmitter.addListener(anyChangeListener);
    vertexStateData.vertexStateChangedEmitter.addListener(anyChangeListener);
    faceStateData.faceStateChangedEmitter.addListener(anyChangeListener);
  }

  public static fromFacesEdges(
    board: TBoard,
    getInitialFaceValue: (face: TFace) => FaceValue,
    getInitialEdgeState: (edge: TEdge) => EdgeState,
  ): CompleteData {
    const faceValueData = new GeneralFaceValueData(board, getInitialFaceValue);

    return new CompleteData(
      faceValueData,
      new GeneralEdgeStateData(board, getInitialEdgeState),
      new GeneralSimpleRegionData(board),
      new GeneralFaceColorData(board),
      new GeneralSectorStateData(board),
      new GeneralVertexStateData(board),
      new GeneralFaceStateData(board, (face) => FaceState.any(face, faceValueData.getFaceValue(face))),
    );
  }

  public static fromFaces(board: TBoard, getInitialFaceValue: (face: TFace) => FaceValue): CompleteData {
    return CompleteData.fromFacesEdges(board, getInitialFaceValue, () => EdgeState.WHITE);
  }

  public static fromFaceValueData(board: TBoard, faceData: TFaceValueData): CompleteData {
    return CompleteData.fromFaces(board, (face) => faceData.getFaceValue(face));
  }

  public static empty(board: TBoard): CompleteData {
    return CompleteData.fromFaces(board, () => null);
  }

  public static faceMapLookup(faceMap: Map<Vector2, FaceValue>): (face: TFace) => FaceValue {
    const stringMap = new Map(Array.from(faceMap.entries()).map(([key, value]) => [`${key.x},${key.y}`, value]));
    return (face: TFace) => {
      const value = stringMap.get(`${face.logicalCoordinates.x},${face.logicalCoordinates.y}`);
      return value !== undefined ? value : null;
    };
  }

  public getFaceValue(face: TFace): FaceValue {
    return this.faceValueData.getFaceValue(face);
  }

  public setFaceValue(face: TFace, state: FaceValue): void {
    this.faceValueData.setFaceValue(face, state);
  }

  public get faceValueChangedEmitter(): TEmitter<[TFace, FaceValue]> {
    return this.faceValueData.faceValueChangedEmitter;
  }

  public getEdgeState(edge: TEdge): EdgeState {
    return this.edgeStateData.getEdgeState(edge);
  }

  public setEdgeState(edge: TEdge, state: EdgeState): void {
    this.edgeStateData.setEdgeState(edge, state);
  }

  public get edgeStateChangedEmitter(): TEmitter<[edge: TEdge, state: EdgeState, oldState: EdgeState]> {
    return this.edgeStateData.edgeStateChangedEmitter;
  }

  public getSimpleRegions(): TSimpleRegion[] {
    return this.simpleRegionData.getSimpleRegions();
  }

  public getSimpleRegionWithVertex(vertex: TVertex): TSimpleRegion | null {
    return this.simpleRegionData.getSimpleRegionWithVertex(vertex);
  }

  public getSimpleRegionWithEdge(edge: TEdge): TSimpleRegion | null {
    return this.simpleRegionData.getSimpleRegionWithEdge(edge);
  }

  public getSimpleRegionWithId(id: number): TSimpleRegion | null {
    return this.simpleRegionData.getSimpleRegionWithId(id);
  }

  public getWeirdEdges(): TEdge[] {
    return this.simpleRegionData.getWeirdEdges();
  }

  public modifyRegions(
    addedRegions: MultiIterable<TSimpleRegion>,
    removedRegions: MultiIterable<TSimpleRegion>,
    addedWeirdEdges: MultiIterable<TEdge>,
    removedWeirdEdges: MultiIterable<TEdge>,
  ): void {
    this.simpleRegionData.modifyRegions(addedRegions, removedRegions, addedWeirdEdges, removedWeirdEdges);
  }

  public get simpleRegionsChangedEmitter(): TEmitter<
    [
      addedRegions: MultiIterable<TSimpleRegion>,
      removedRegions: MultiIterable<TSimpleRegion>,
      addedWeirdEdges: MultiIterable<TEdge>,
      removedWeirdEdges: MultiIterable<TEdge>,
    ]
  > {
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

  public getFaceColor(face: TFace): TFaceColor {
    return this.faceColorData.getFaceColor(face);
  }

  public getFacesWithColor(faceColor: TFaceColor): TFace[] {
    return this.faceColorData.getFacesWithColor(faceColor);
  }

  public getFaceColorMap(): Map<TFace, TFaceColor> {
    return this.faceColorData.getFaceColorMap();
  }

  public getOppositeFaceColor(faceColor: TFaceColor): TFaceColor | null {
    return this.faceColorData.getOppositeFaceColor(faceColor);
  }

  public hasInvalidFaceColors(): boolean {
    return this.faceColorData.hasInvalidFaceColors();
  }

  public modifyFaceColors(
    addedFaceColors: MultiIterable<TFaceColor>,
    removedFaceColors: MultiIterable<TFaceColor>,
    faceChangeMap: Map<TFace, TFaceColor>,
    oppositeChangeMap: Map<TFaceColor, TFaceColor>,
    invalidFaceColor: boolean,
  ): void {
    this.faceColorData.modifyFaceColors(
      addedFaceColors,
      removedFaceColors,
      faceChangeMap,
      oppositeChangeMap,
      invalidFaceColor,
    );
  }

  public get faceColorsChangedEmitter(): TEmitter<
    [
      addedFaceColors: MultiIterable<TFaceColor>,
      removedFaceColors: MultiIterable<TFaceColor>,
      oppositeChangedFaceColors: MultiIterable<TFaceColor>,
      changedFaces: MultiIterable<TFace>,
    ]
  > {
    return this.faceColorData.faceColorsChangedEmitter;
  }

  public getSectorState(sector: TSector): SectorState {
    return this.sectorStateData.getSectorState(sector);
  }

  public setSectorState(sector: TSector, state: SectorState): void {
    this.sectorStateData.setSectorState(sector, state);
  }

  public get sectorStateChangedEmitter(): TEmitter<[edge: TSector, state: SectorState, oldState: SectorState]> {
    return this.sectorStateData.sectorStateChangedEmitter;
  }

  public getVertexState(vertex: TVertex): VertexState {
    return this.vertexStateData.getVertexState(vertex);
  }

  public setVertexState(vertex: TVertex, state: VertexState): void {
    this.vertexStateData.setVertexState(vertex, state);
  }

  public get vertexStateChangedEmitter(): TEmitter<[vertex: TVertex, state: VertexState, oldState: VertexState]> {
    return this.vertexStateData.vertexStateChangedEmitter;
  }

  public getFaceState(face: TFace): FaceState {
    return this.faceStateData.getFaceState(face);
  }

  public setFaceState(face: TFace, state: FaceState): void {
    this.faceStateData.setFaceState(face, state);
  }

  public get faceStateChangedEmitter(): TEmitter<[face: TFace, state: FaceState, oldState: FaceState]> {
    return this.faceStateData.faceStateChangedEmitter;
  }

  public clone(): CompleteData {
    return new CompleteData(
      this.faceValueData.clone(),
      this.edgeStateData.clone(),
      this.simpleRegionData.clone(),
      this.faceColorData.clone(),
      this.sectorStateData.clone(),
      this.vertexStateData.clone(),
      this.faceStateData.clone(),
    );
  }

  public createDelta(): TDelta<TCompleteData> {
    return new CompleteDelta(
      this.faceValueData.createDelta(),
      this.edgeStateData.createDelta(),
      this.simpleRegionData.createDelta(),
      this.faceColorData.createDelta(),
      this.sectorStateData.createDelta(),
      this.vertexStateData.createDelta(),
      this.faceStateData.createDelta(),
    );
  }

  public serializeState(board: TBoard): TSerializedCompleteData {
    return serializeCompleteData(board, this);
  }

  public static deserializeState(board: TBoard, serializedCompleteData: TSerializedCompleteData): CompleteData {
    const faceValueData = GeneralFaceValueData.deserializeState(board, serializedCompleteData.faceValueData);
    return new CompleteData(
      faceValueData,
      GeneralEdgeStateData.deserializeState(board, serializedCompleteData.edgeStateData),
      // TODO: get a setup so we can avoid shipping this data
      serializedCompleteData.simpleRegionData ?
        GeneralSimpleRegionData.deserializeState(board, serializedCompleteData.simpleRegionData)
      : new GeneralSimpleRegionData(board),
      // TODO: get a setup so we can avoid shipping this data
      serializedCompleteData.faceColorData ?
        GeneralFaceColorData.deserializeState(board, serializedCompleteData.faceColorData)
      : new GeneralFaceColorData(board),
      serializedCompleteData.sectorStateData ?
        GeneralSectorStateData.deserializeState(board, serializedCompleteData.sectorStateData)
      : new GeneralSectorStateData(board),
      serializedCompleteData.vertexStateData ?
        GeneralVertexStateData.deserializeState(board, serializedCompleteData.vertexStateData)
      : new GeneralVertexStateData(board),
      serializedCompleteData.faceStateData ?
        GeneralFaceStateData.deserializeState(board, serializedCompleteData.faceStateData)
      : new GeneralFaceStateData(board, (face) => {
          return FaceState.any(face, faceValueData.getFaceValue(face));
        }),
    );
  }
}
