import { TPatternBoard } from './TPatternBoard.ts';
import { getStandardDescribedPatternBoard, getStandardNamedPatternBoard } from './patternBoards.ts';
import { deserializePatternBoardDescriptor } from './TPatternBoardDescriptor.ts';
import { BasePatternBoard } from './BasePatternBoard.ts';

export const deserializePatternBoard = ( serialized: string ): TPatternBoard => {
  let board = getStandardNamedPatternBoard( serialized );

  if ( board ) {
    return board;
  }

  const descriptor = deserializePatternBoardDescriptor( serialized );
  board = getStandardDescribedPatternBoard( descriptor );

  if ( board ) {
    return board;
  }
  else {
    return new BasePatternBoard( descriptor );
  }
};