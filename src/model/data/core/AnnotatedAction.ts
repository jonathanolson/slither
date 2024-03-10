import { TAction, TSerializedAction } from './TAction.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TCompleteData } from '../combined/TCompleteData.ts';
import { TAnnotation } from './TAnnotation.ts';

export class AnnotatedAction<Data> implements TAction<Data> {

  public constructor(
    public readonly action: TAction<Data>,
    public readonly annotation: TAnnotation
  ) {}

  public apply( state: Data ): void {
    this.action.apply( state );
  }

  public getUndo( state: Data ): TAction<Data> {
    return new AnnotatedAction( this.action.getUndo( state ), this.annotation );
  }

  public isEmpty(): boolean {
    return this.action.isEmpty();
  }

  public serializeAction(): TSerializedAction {
    throw new Error( 'unimplemented' );
  }

  public static deserializeAction( board: TBoard, serializedAction: TSerializedAction ): AnnotatedAction<TCompleteData> {
    throw new Error( 'unimplemented' );
  }
}