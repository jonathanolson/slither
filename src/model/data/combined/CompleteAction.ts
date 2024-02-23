import { deserializeAction, TAction, TSerializedAction } from '../core/TAction.ts';
import { TCompleteData } from './TCompleteData.ts';
import { TFaceData } from '../face/TFaceData.ts';
import { TEdgeData } from '../edge/TEdgeData.ts';
import { TSimpleRegionData } from '../simple-region/TSimpleRegionData.ts';
import { TBoard } from '../../board/core/TBoard.ts';

export class CompleteAction implements TAction<TCompleteData> {
  public constructor(
    public readonly faceAction: TAction<TFaceData>,
    public readonly edgeAction: TAction<TEdgeData>,
    public readonly simpleRegionAction: TAction<TSimpleRegionData>
  ) {}

  public apply( state: TCompleteData ): void {
    this.faceAction.apply( state );
    this.edgeAction.apply( state );
    this.simpleRegionAction.apply( state );
  }

  public getUndo( state: TCompleteData ): TAction<TCompleteData> {
    return new CompleteAction( this.faceAction.getUndo( state ), this.edgeAction.getUndo( state ), this.simpleRegionAction.getUndo( state ) );
  }

  public isEmpty(): boolean {
    return this.faceAction.isEmpty() && this.edgeAction.isEmpty() && this.simpleRegionAction.isEmpty();
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'CompleteAction',
      faceAction: this.faceAction.serializeAction(),
      edgeAction: this.edgeAction.serializeAction(),
      simpleRegionAction: this.simpleRegionAction.serializeAction()
    };
  }

  public static deserializeAction( board: TBoard, serializedAction: TSerializedAction ): CompleteAction<TCompleteData> {
    return new CompleteAction(
      deserializeAction( board, serializedAction.faceAction ),
      deserializeAction( board, serializedAction.edgeAction ),
      deserializeAction( board, serializedAction.simpleRegionAction
    ) );
  }
}