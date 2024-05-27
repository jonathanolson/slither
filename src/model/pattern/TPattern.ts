import { TPatternBoard } from './pattern-board/TPatternBoard.ts';
import { TFeature } from './feature/TFeature.ts';
import { TPlanarPatternMap } from './TPlanarPatternMap.ts';

export interface TPattern {
  patternBoard: TPatternBoard;
  features: TFeature[];
  planarPatternMap?: TPlanarPatternMap;
};