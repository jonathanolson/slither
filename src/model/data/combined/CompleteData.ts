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

export class CompleteData implements TState<TCompleteData> {

  public readonly anyStateChangedEmitter: TEmitter = new TinyEmitter();

  // TODO: can we do trait/mixin stuff to support a better way of doing this? TS has been picky with traits before
  public constructor(
    public readonly faceData: TState<TFaceData>,
    public readonly edgeData: TState<TEdgeData>,
    public readonly simpleRegionData: TState<TSimpleRegionData>
  ) {
    const anyChangeListener = () => this.anyStateChangedEmitter.emit();
    faceData.faceStateChangedEmitter.addListener( anyChangeListener );
    edgeData.edgeStateChangedEmitter.addListener( anyChangeListener );
    simpleRegionData.simpleRegionsChangedEmitter.addListener( anyChangeListener );
  }

  public static fromFacesEdges(
    board: TBoard,
    getInitialFaceState: ( face: TFace ) => FaceState,
    getInitialEdgeState: ( edge: TEdge ) => EdgeState
  ): CompleteData {
    return new CompleteData(
      new GeneralFaceData( board, getInitialFaceState ),
      new GeneralEdgeData( board, getInitialEdgeState ),
      new GeneralSimpleRegionData( board )
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

  public get edgeStateChangedEmitter(): TEmitter<[ TEdge, EdgeState ]> {
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
    addedRegions: Iterable<TSimpleRegion>,
    removedRegions: Iterable<TSimpleRegion>,
    addedWeirdEdges: Iterable<TEdge>,
    removedWeirdEdges: Iterable<TEdge>
  ): void {
    this.simpleRegionData.modifyRegions( addedRegions, removedRegions, addedWeirdEdges, removedWeirdEdges );
  }

  public get simpleRegionsChangedEmitter(): TEmitter<[
    addedRegions: Iterable<TSimpleRegion>,
    removedRegions: Iterable<TSimpleRegion>,
    addedWeirdEdges: Iterable<TEdge>,
    removedWeirdEdges: Iterable<TEdge>
  ]> {
    return this.simpleRegionData.simpleRegionsChangedEmitter;
  }

  public clone(): CompleteData {
    return new CompleteData( this.faceData.clone(), this.edgeData.clone(), this.simpleRegionData.clone() );
  }

  public createDelta(): TDelta<TCompleteData> {
    return new CompleteDelta(
      this.faceData.createDelta(),
      this.edgeData.createDelta(),
      this.simpleRegionData.createDelta()
    );
  }

  public serializeState( board: TBoard ): TSerializedCompleteData {
    return serializeCompleteData( board, this );
  }

  public static deserializeState( board: TBoard, serializedCompleteData: TSerializedCompleteData ): CompleteData {
    return new CompleteData(
      GeneralFaceData.deserializeState( board, serializedCompleteData.faceData ),
      GeneralEdgeData.deserializeState( board, serializedCompleteData.edgeData ),
      GeneralSimpleRegionData.deserializeState( board, serializedCompleteData.simpleRegionData )
    );
  }
}