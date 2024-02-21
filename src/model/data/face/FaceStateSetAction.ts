import { TAction } from '../core/TAction.ts';
import { TFaceData } from './TFaceData.ts';
import { TFace } from '../../board/core/TFace.ts';
import FaceState from './FaceState.ts';

export class FaceStateSetAction implements TAction<TFaceData> {

  public constructor(
    public readonly face: TFace,
    public readonly state: FaceState
  ) {}

  public apply( state: TFaceData ): void {
    state.setFaceState( this.face, this.state );
  }

  public getUndo( state: TFaceData ): TAction<TFaceData> {
    const previousState = state.getFaceState( this.face );
    return new FaceStateSetAction( this.face, previousState );
  }

  public isEmpty(): boolean {
    return false;
  }
}