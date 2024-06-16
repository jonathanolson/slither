import { TBoard } from '../../board/core/TBoard.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import { TFace } from '../../board/core/TFace.ts';
import { TVertex } from '../../board/core/TVertex.ts';
import { TDelta } from '../core/TDelta.ts';
import { TState } from '../core/TState.ts';
import EdgeState from '../edge-state/EdgeState.ts';
import { EdgeStateValidator } from '../edge-state/EdgeStateValidator.ts';
import { TEdgeStateData } from '../edge-state/TEdgeStateData.ts';
import { FaceColorValidator } from '../face-color/FaceColorValidator.ts';
import { TFaceColor, TFaceColorData } from '../face-color/TFaceColorData.ts';
import { FaceState } from '../face-state/FaceState.ts';
import { FaceStateValidator } from '../face-state/FaceStateValidator.ts';
import { TFaceStateData } from '../face-state/TFaceStateData.ts';
import FaceValue from '../face-value/FaceValue.ts';
import { FaceValueValidator } from '../face-value/FaceValueValidator.ts';
import { TFaceValueData } from '../face-value/TFaceValueData.ts';
import SectorState from '../sector-state/SectorState.ts';
import { SectorStateValidator } from '../sector-state/SectorStateValidator.ts';
import { TSector } from '../sector-state/TSector.ts';
import { TSectorStateData } from '../sector-state/TSectorStateData.ts';
import { SimpleRegionValidator } from '../simple-region/SimpleRegionValidator.ts';
import { TSimpleRegion, TSimpleRegionData } from '../simple-region/TSimpleRegionData.ts';
import { TVertexStateData } from '../vertex-state/TVertexStateData.ts';
import { VertexState } from '../vertex-state/VertexState.ts';
import { VertexStateValidator } from '../vertex-state/VertexStateValidator.ts';
import { TCompleteData, TSerializedCompleteData } from './TCompleteData.ts';

import { TEmitter, TinyEmitter } from 'phet-lib/axon';

import { MultiIterable } from '../../../workarounds/MultiIterable.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export class CompleteValidator implements TState<TCompleteData> {
  public readonly anyStateChangedEmitter: TEmitter = new TinyEmitter();

  private readonly edgeStateValidator: TState<TEdgeStateData>;
  private readonly faceValueValidator: TState<TFaceValueData>;
  private readonly simpleRegionDataValidator: TState<TSimpleRegionData>;
  private readonly faceColorValidator: TState<TFaceColorData>;
  private readonly sectorStateValidator: TState<TSectorStateData>;
  private readonly vertexStateValidator: TState<TVertexStateData>;
  private readonly faceStateValidator: TState<TFaceStateData>;

  public constructor(board: TBoard, currentState: TState<TCompleteData>, solvedState: TState<TCompleteData>) {
    assertEnabled() && assert(board);
    assertEnabled() && assert(solvedState);

    this.edgeStateValidator = new EdgeStateValidator(board, currentState, solvedState);
    this.faceValueValidator = new FaceValueValidator(board, currentState, solvedState);
    this.simpleRegionDataValidator = new SimpleRegionValidator(board, currentState, solvedState);
    this.faceColorValidator = new FaceColorValidator(board, currentState, solvedState); // TODO: naming discrepancies
    this.sectorStateValidator = new SectorStateValidator(board, currentState, solvedState);
    this.vertexStateValidator = new VertexStateValidator(board, currentState, solvedState);
    this.faceStateValidator = new FaceStateValidator(board, currentState, solvedState);
  }

  public getFaceValue(face: TFace): FaceValue {
    return this.faceValueValidator.getFaceValue(face);
  }

  public setFaceValue(face: TFace, state: FaceValue): void {
    this.faceValueValidator.setFaceValue(face, state);
  }

  public get faceValueChangedEmitter(): TEmitter<[TFace, FaceValue]> {
    return this.faceValueValidator.faceValueChangedEmitter;
  }

  public getEdgeState(edge: TEdge): EdgeState {
    return this.edgeStateValidator.getEdgeState(edge);
  }

  public setEdgeState(edge: TEdge, state: EdgeState): void {
    this.edgeStateValidator.setEdgeState(edge, state);
  }

  public get edgeStateChangedEmitter(): TEmitter<[edge: TEdge, state: EdgeState, oldState: EdgeState]> {
    return this.edgeStateValidator.edgeStateChangedEmitter;
  }

  public getSimpleRegions(): TSimpleRegion[] {
    return this.simpleRegionDataValidator.getSimpleRegions();
  }

  public getSimpleRegionWithVertex(vertex: TVertex): TSimpleRegion | null {
    return this.simpleRegionDataValidator.getSimpleRegionWithVertex(vertex);
  }

  public getSimpleRegionWithEdge(edge: TEdge): TSimpleRegion | null {
    return this.simpleRegionDataValidator.getSimpleRegionWithEdge(edge);
  }

  public getSimpleRegionWithId(id: number): TSimpleRegion | null {
    return this.simpleRegionDataValidator.getSimpleRegionWithId(id);
  }

  public getWeirdEdges(): TEdge[] {
    return this.simpleRegionDataValidator.getWeirdEdges();
  }

  public modifyRegions(
    addedRegions: MultiIterable<TSimpleRegion>,
    removedRegions: MultiIterable<TSimpleRegion>,
    addedWeirdEdges: MultiIterable<TEdge>,
    removedWeirdEdges: MultiIterable<TEdge>,
  ): void {
    this.simpleRegionDataValidator.modifyRegions(addedRegions, removedRegions, addedWeirdEdges, removedWeirdEdges);
  }

  public get simpleRegionsChangedEmitter(): TEmitter<
    [
      addedRegions: MultiIterable<TSimpleRegion>,
      removedRegions: MultiIterable<TSimpleRegion>,
      addedWeirdEdges: MultiIterable<TEdge>,
      removedWeirdEdges: MultiIterable<TEdge>,
    ]
  > {
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

  public getFaceColor(face: TFace): TFaceColor {
    return this.faceColorValidator.getFaceColor(face);
  }

  public getFacesWithColor(faceColor: TFaceColor): TFace[] {
    return this.faceColorValidator.getFacesWithColor(faceColor);
  }

  public getFaceColorMap(): Map<TFace, TFaceColor> {
    return this.faceColorValidator.getFaceColorMap();
  }

  public getOppositeFaceColor(faceColor: TFaceColor): TFaceColor | null {
    return this.faceColorValidator.getOppositeFaceColor(faceColor);
  }

  public hasInvalidFaceColors(): boolean {
    return this.faceColorValidator.hasInvalidFaceColors();
  }

  public modifyFaceColors(
    addedFaceColors: MultiIterable<TFaceColor>,
    removedFaceColors: MultiIterable<TFaceColor>,
    faceChangeMap: Map<TFace, TFaceColor>,
    oppositeChangeMap: Map<TFaceColor, TFaceColor>,
    invalidFaceColor: boolean,
  ): void {
    this.faceColorValidator.modifyFaceColors(
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
    return this.faceColorValidator.faceColorsChangedEmitter;
  }

  public getSectorState(sector: TSector): SectorState {
    return this.sectorStateValidator.getSectorState(sector);
  }

  public setSectorState(sector: TSector, state: SectorState): void {
    this.sectorStateValidator.setSectorState(sector, state);
  }

  public get sectorStateChangedEmitter(): TEmitter<[edge: TSector, state: SectorState, oldState: SectorState]> {
    return this.sectorStateValidator.sectorStateChangedEmitter;
  }

  public getVertexState(vertex: TVertex): VertexState {
    return this.vertexStateValidator.getVertexState(vertex);
  }

  public setVertexState(vertex: TVertex, state: VertexState): void {
    this.vertexStateValidator.setVertexState(vertex, state);
  }

  public get vertexStateChangedEmitter(): TEmitter<[vertex: TVertex, state: VertexState, oldState: VertexState]> {
    return this.vertexStateValidator.vertexStateChangedEmitter;
  }

  public getFaceState(face: TFace): FaceState {
    return this.faceStateValidator.getFaceState(face);
  }

  public setFaceState(face: TFace, state: FaceState): void {
    this.faceStateValidator.setFaceState(face, state);
  }

  public get faceStateChangedEmitter(): TEmitter<[face: TFace, state: FaceState, oldState: FaceState]> {
    return this.faceStateValidator.faceStateChangedEmitter;
  }

  public clone(): CompleteValidator {
    return this;
  }

  public createDelta(): TDelta<TCompleteData> {
    return this as unknown as TDelta<TCompleteData>;
  }

  public serializeState(board: TBoard): TSerializedCompleteData {
    throw new Error('unimplemented');
  }
}
