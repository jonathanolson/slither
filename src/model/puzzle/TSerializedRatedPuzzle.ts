import { TSerializedBoard } from '../board/core/TSerializedBoard.ts';
import { TRating } from './TRating.ts';
import { TSerializedFaceData } from './TSerializedFaceData.ts';

// TODO: note that rating infinity values might be null
export type TSerializedRatedPuzzle = {
  board: TSerializedBoard;
  faceData: TSerializedFaceData;
} & TRating;
