import { TAction, TSerializedAction } from '../core/TAction.ts';
import { TCompleteData } from './TCompleteData.ts';
import { TFaceValueData } from '../face-value/TFaceValueData.ts';
import { TEdgeStateData } from '../edge-state/TEdgeStateData.ts';
import { TSimpleRegionData } from '../simple-region/TSimpleRegionData.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TFaceColorData } from '../face-color/TFaceColorData.ts';
import { TSectorStateData } from '../sector-state/TSectorStateData.ts';
import { TVertexStateData } from '../vertex-state/TVertexStateData.ts';
import { TFaceStateData } from '../face-state/TFaceStateData.ts';
import { deserializeAction } from '../core/deserializeAction.ts';

export class CompleteAction implements TAction<TCompleteData> {
  public constructor(
    public readonly faceValueAction: TAction<TFaceValueData>,
    public readonly edgeStateAction: TAction<TEdgeStateData>,
    public readonly simpleRegionAction: TAction<TSimpleRegionData>,
    public readonly faceColorAction: TAction<TFaceColorData>,
    public readonly sectorStateAction: TAction<TSectorStateData>,
    public readonly vertexStateAction: TAction<TVertexStateData>,
    public readonly faceStateAction: TAction<TFaceStateData>
  ) {}

  public apply( state: TCompleteData ): void {
    this.faceValueAction.apply( state );
    this.edgeStateAction.apply( state );
    this.simpleRegionAction.apply( state );
    this.faceColorAction.apply( state );
    this.sectorStateAction.apply( state );
    this.vertexStateAction.apply( state );
    this.faceStateAction.apply( state );
  }

  public getUndo( state: TCompleteData ): TAction<TCompleteData> {
    return new CompleteAction(
      this.faceValueAction.getUndo( state ),
      this.edgeStateAction.getUndo( state ),
      this.simpleRegionAction.getUndo( state ),
      this.faceColorAction.getUndo( state ),
      this.sectorStateAction.getUndo( state ),
      this.vertexStateAction.getUndo( state ),
      this.faceStateAction.getUndo( state )
    );
  }

  public isEmpty(): boolean {
    return this.faceValueAction.isEmpty() &&
           this.edgeStateAction.isEmpty() &&
           this.simpleRegionAction.isEmpty() &&
           this.faceColorAction.isEmpty() &&
           this.sectorStateAction.isEmpty() &&
           this.vertexStateAction.isEmpty() &&
           this.faceStateAction.isEmpty();
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'CompleteAction',
      faceValueAction: this.faceValueAction.serializeAction(),
      edgeStateAction: this.edgeStateAction.serializeAction(),
      simpleRegionAction: this.simpleRegionAction.serializeAction(),
      faceColorAction: this.faceColorAction.serializeAction(),
      sectorStateAction: this.sectorStateAction.serializeAction(),
      vertexStateAction: this.vertexStateAction.serializeAction(),
      faceStateAction: this.faceStateAction.serializeAction()
    };
  }

  public static deserializeAction( board: TBoard, serializedAction: TSerializedAction ): CompleteAction {
    return new CompleteAction(
      deserializeAction( board, serializedAction.faceStateAction ),
      deserializeAction( board, serializedAction.edgeStateAction ),
      deserializeAction( board, serializedAction.simpleRegionAction ),
      deserializeAction( board, serializedAction.faceColorAction ),
      deserializeAction( board, serializedAction.sectorStateAction ),
      deserializeAction( board, serializedAction.vertexStateAction ),
      deserializeAction( board, serializedAction.faceStateAction )
    );
  }
}