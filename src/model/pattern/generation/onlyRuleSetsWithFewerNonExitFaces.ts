import { PatternBoardRuleSet } from '../PatternBoardRuleSet.ts';

export const onlyRuleSetsWithFewerNonExitFaces = ( numNonExitFaces: number ) => {
  return ( ruleSet: PatternBoardRuleSet ) => {
    return ruleSet.patternBoard.faces.filter( face => !face.isExit ).length < numNonExitFaces;
  };
};