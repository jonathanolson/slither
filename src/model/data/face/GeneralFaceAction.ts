import { TAction, TSerializedAction } from '../core/TAction.ts';
import { TFaceData } from './TFaceData.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { deserializeFace, serializeFace, TFace, TSerializedFace } from '../../board/core/TFace.ts';
import FaceState from './FaceState.ts';

export class GeneralFaceAction implements TAction<TFaceData> {
  public constructor(
    public readonly board: TBoard,
    public readonly faceStateMap: Map<TFace, FaceState> = new Map()
  ) {}

  public apply( state: TFaceData ): void {
    for ( const [ face, faceState ] of this.faceStateMap ) {
      state.setFaceState( face, faceState );
    }
  }

  public getUndo( state: TFaceData ): TAction<TFaceData> {
    const faceStateMap = new Map<TFace, FaceState>();

    for ( const face of this.faceStateMap.keys() ) {
      faceStateMap.set( face, state.getFaceState( face ) );
    }

    return new GeneralFaceAction( this.board, faceStateMap );
  }

  public isEmpty(): boolean {
    return this.faceStateMap.size === 0;
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'GeneralFaceAction',
      faces: Array.from( this.faceStateMap.entries() ).map( ( [ face, faceState ] ) => ( {
        face: serializeFace( face ),
        state: faceState
      } ) )
    };
  }

  public static deserializeAction( board: TBoard, serializedAction: TSerializedAction ): GeneralFaceAction {
    return new GeneralFaceAction(
      board,
      new Map( serializedAction.faces.map( ( serializedFaceState: { face: TSerializedFace; state: FaceState } ) => [
        deserializeFace( board, serializedFaceState.face ),
        serializedFaceState.state
      ] ) )
    );
  }
}