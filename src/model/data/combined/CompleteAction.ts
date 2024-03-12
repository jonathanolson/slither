import { deserializeAction, TAction, TSerializedAction } from '../core/TAction.ts';
import { TCompleteData } from './TCompleteData.ts';
import { TFaceData } from '../face/TFaceData.ts';
import { TEdgeData } from '../edge/TEdgeData.ts';
import { TSimpleRegionData } from '../simple-region/TSimpleRegionData.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TFaceColorData } from '../face-color/TFaceColorData.ts';
import { TSectorData } from '../sector/TSectorData.ts';
import { TVertexData } from '../vertex/TVertexData.ts';

export class CompleteAction implements TAction<TCompleteData> {
  public constructor(
    public readonly faceAction: TAction<TFaceData>,
    public readonly edgeAction: TAction<TEdgeData>,
    public readonly simpleRegionAction: TAction<TSimpleRegionData>,
    public readonly faceColorAction: TAction<TFaceColorData>,
    public readonly sectorAction: TAction<TSectorData>,
    public readonly vertexAction: TAction<TVertexData>
  ) {}

  public apply( state: TCompleteData ): void {
    this.faceAction.apply( state );
    this.edgeAction.apply( state );
    this.simpleRegionAction.apply( state );
    this.faceColorAction.apply( state );
    this.sectorAction.apply( state );
    this.vertexAction.apply( state );
  }

  public getUndo( state: TCompleteData ): TAction<TCompleteData> {
    return new CompleteAction(
      this.faceAction.getUndo( state ),
      this.edgeAction.getUndo( state ),
      this.simpleRegionAction.getUndo( state ),
      this.faceColorAction.getUndo( state ),
      this.sectorAction.getUndo( state ),
      this.vertexAction.getUndo( state )
    );
  }

  public isEmpty(): boolean {
    return this.faceAction.isEmpty() &&
      this.edgeAction.isEmpty() &&
      this.simpleRegionAction.isEmpty() &&
      this.faceColorAction.isEmpty() &&
      this.sectorAction.isEmpty() &&
      this.vertexAction.isEmpty();
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'CompleteAction',
      faceAction: this.faceAction.serializeAction(),
      edgeAction: this.edgeAction.serializeAction(),
      simpleRegionAction: this.simpleRegionAction.serializeAction(),
      faceColorAction: this.faceColorAction.serializeAction(),
      sectorAction: this.sectorAction.serializeAction(),
      vertexAction: this.vertexAction.serializeAction()
    };
  }

  public static deserializeAction( board: TBoard, serializedAction: TSerializedAction ): CompleteAction {
    return new CompleteAction(
      deserializeAction( board, serializedAction.faceAction ),
      deserializeAction( board, serializedAction.edgeAction ),
      deserializeAction( board, serializedAction.simpleRegionAction ),
      deserializeAction( board, serializedAction.faceColorAction ),
      deserializeAction( board, serializedAction.sectorAction ),
      deserializeAction( board, serializedAction.vertexAction )
    );
  }
}