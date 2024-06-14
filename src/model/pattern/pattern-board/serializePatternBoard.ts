import { TPatternBoard } from './TPatternBoard.ts';
import { serializePatternBoardDescriptor } from './TPatternBoardDescriptor.ts';

export const serializePatternBoard = (board: TPatternBoard): string => {
  if (board.name) {
    return board.name;
  } else {
    return serializePatternBoardDescriptor(board.descriptor);
  }
};
