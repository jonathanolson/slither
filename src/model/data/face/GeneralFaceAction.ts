import { TAction, TSerializedAction } from '../core/TAction.ts';
import { TFaceData } from './TFaceData.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { deserializeFace, serializeFace, TFace, TSerializedFace } from '../../board/core/TFace.ts';
import FaceValue from './FaceValue.ts';

export class GeneralFaceAction implements TAction<TFaceData> {
  public constructor(
    public readonly board: TBoard,
    public readonly faceValueMap: Map<TFace, FaceValue> = new Map()
  ) {}

  public apply( state: TFaceData ): void {
    for ( const [ face, faceValue ] of this.faceValueMap ) {
      state.setFaceValue( face, faceValue );
    }
  }

  public getUndo( state: TFaceData ): TAction<TFaceData> {
    const faceValueMap = new Map<TFace, FaceValue>();

    for ( const face of this.faceValueMap.keys() ) {
      faceValueMap.set( face, state.getFaceValue( face ) );
    }

    return new GeneralFaceAction( this.board, faceValueMap );
  }

  public isEmpty(): boolean {
    return this.faceValueMap.size === 0;
  }

  public serializeAction(): TSerializedAction {
    return {
      type: 'GeneralFaceAction',
      faces: Array.from( this.faceValueMap.entries() ).map( ( [ face, faceValue ] ) => ( {
        face: serializeFace( face ),
        state: faceValue
      } ) )
    };
  }

  public static deserializeAction( board: TBoard, serializedAction: TSerializedAction ): GeneralFaceAction {
    return new GeneralFaceAction(
      board,
      new Map( serializedAction.faces.map( ( serializedFaceValue: { face: TSerializedFace; state: FaceValue } ) => [
        deserializeFace( board, serializedFaceValue.face ),
        serializedFaceValue.state
      ] ) )
    );
  }
}