import { TPatternBoard } from './TPatternBoard.ts';
import { TPlanarPatternMap } from './TPlanarPatternMap.ts';

export interface TPlanarMappedPatternBoard {
  patternBoard: TPatternBoard;
  planarPatternMap: TPlanarPatternMap;
}