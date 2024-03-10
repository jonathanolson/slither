import { deserializeAction, TAction, TSerializedAction } from './TAction.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { TCompleteData } from '../combined/TCompleteData.ts';

export class CompositeAction<Data> implements TAction<Data> {

  public constructor(
    public readonly actions: TAction<Data>[]
  ) {}

  public apply( state: Data ): void {
    for ( let i = 0; i < this.actions.length; i++ ) {
      this.actions[ i ].apply( state );
    }
  }

  public getUndo( state: Data ): TAction<Data> {
    return new CompositeAction( this.actions.map( action => action.getUndo( state ) ).reverse() );
  }

  public isEmpty(): boolean {
    return this.actions.some( action => !action.isEmpty() );
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'CompositeAction',
      actions: this.actions.map( action => action.serializeAction() )
    };
  }

  // TODO: are we breaking type here? hmm
  public static deserializeAction( board: TBoard, serializedAction: TSerializedAction ): CompositeAction<TCompleteData> {
    return new CompositeAction( serializedAction.actions.map( ( serializedAction: TSerializedAction ) => deserializeAction( board, serializedAction ) ) );
  }
}