import { TPatternBoard } from './TPatternBoard.ts';
import { TPatternBoardDescriptor } from './TPatternBoardDescriptor.ts';

export interface TDescribedPatternBoard extends TPatternBoard {
  descriptor: TPatternBoardDescriptor;
}