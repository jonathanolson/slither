import { PatternRule } from '../pattern-rule/PatternRule.ts';
import { getEmbeddings } from '../embedding/getEmbeddings.ts';
import _ from '../../../workarounds/_.ts';

export const filterAndSortRules = ( rules: PatternRule[], previousRules: PatternRule[] = [] ): PatternRule[] => {
  if ( rules.length === 0 ) {
    return rules;
  }

  const mainPatternBoard = rules[ 0 ].patternBoard;

  // Sort rules
  rules = _.sortBy( rules, rule => rule.getInputDifficultyScoreA() );

  // We will append to this list as we go
  const embeddedRules = previousRules.flatMap( rule => rule.getEmbeddedRules( getEmbeddings( rule.patternBoard, mainPatternBoard ) ) );

  const automorphisms = getEmbeddings( mainPatternBoard, mainPatternBoard );

  let lastScore = 0;
  let lastScoreIndex = 0;
  const filteredRules: PatternRule[] = [];

  for ( let i = 0; i < rules.length; i++ ) {
    const rule = rules[ i ];
    const score = rule.getInputDifficultyScoreA();

    if ( score !== lastScore ) {
      embeddedRules.push( ...filteredRules.slice( lastScoreIndex, i ).flatMap( rule => {
        return rule.getEmbeddedRules( automorphisms );
      } ) );

      lastScore = score;
      lastScoreIndex = filteredRules.length;
    }

    if ( !rule.isRedundant( embeddedRules ) ) {
      filteredRules.push( rule );
    }
  }

  return filteredRules;
};