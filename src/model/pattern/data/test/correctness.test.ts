import QUnit from 'qunit';
import { PatternRule } from '../../PatternRule.ts';
import { PatternBoardRuleSet } from '../../PatternBoardRuleSet.ts';
import { squareOnlyImpliedEdgeGeneration0RuleSets } from '../squareOnlyImpliedEdgeGeneration0RuleSets.ts';
import { squareOnlyImpliedEdgeGeneration1RuleSets } from '../squareOnlyImpliedEdgeGeneration1RuleSets.ts';
import { squareOnlyImpliedEdgeGeneration2RuleSets } from '../squareOnlyImpliedEdgeGeneration2RuleSets.ts';
import { squareOnlyImpliedEdgeGeneration3RuleSets } from '../squareOnlyImpliedEdgeGeneration3RuleSets.ts';
import { squareOnlyImpliedEdgeGeneration4RuleSets } from '../squareOnlyImpliedEdgeGeneration4RuleSets.ts';
import { PatternBoardSolver } from '../../PatternBoardSolver.ts';
import { TPatternEdge } from '../../TPatternEdge.ts';

QUnit.module( 'pattern rule correctness', () => {
  const getFirstIncorrectRule = ( ruleSet: PatternBoardRuleSet ): PatternRule | null => {

    const allSolutions = PatternBoardSolver.getSolutions( ruleSet.patternBoard, [] );

    const ruleInputFeatures = ruleSet.rules.map( rule => rule.inputFeatureSet.getFeaturesArray() );
    const ruleOutputFeatures = ruleSet.rules.map( rule => rule.outputFeatureSet.getFeaturesArray() );

    for ( const solution of allSolutions ) {
      const isEdgeBlack = ( edge: TPatternEdge ) => {
        return solution.includes( edge );
      };

      for ( let i = 0; i < ruleSet.rules.length; i++ ) {
        const rule = ruleSet.rules[ i ];
        const inputFeatures = ruleInputFeatures[ i ];
        const outputFeatures = ruleOutputFeatures[ i ];

        if ( inputFeatures.every( feature => feature.isPossibleWith( isEdgeBlack ) ) ) {
          if ( !outputFeatures.every( feature => feature.isPossibleWith( isEdgeBlack ) ) ) {
            return rule;
          }
        }
      }
    }

    return null;
  };

  const testRuleSets = ( ruleSets: PatternBoardRuleSet[], name: string ) => {
    QUnit.test( name, assert => {

      ruleSets.forEach( ( ruleSet, i ) => {
        const badRule = getFirstIncorrectRule( ruleSet );

        assert.equal( badRule, null, `${i} ${name} ${badRule?.toCanonicalString()}` );
      } );
    } );
  };

  testRuleSets( squareOnlyImpliedEdgeGeneration0RuleSets, 'squareOnlyImpliedEdgeGeneration0RuleSets' );
  testRuleSets( squareOnlyImpliedEdgeGeneration1RuleSets, 'squareOnlyImpliedEdgeGeneration1RuleSets' );
  testRuleSets( squareOnlyImpliedEdgeGeneration2RuleSets, 'squareOnlyImpliedEdgeGeneration2RuleSets' );
  testRuleSets( squareOnlyImpliedEdgeGeneration3RuleSets, 'squareOnlyImpliedEdgeGeneration3RuleSets' );
  testRuleSets( squareOnlyImpliedEdgeGeneration4RuleSets, 'squareOnlyImpliedEdgeGeneration4RuleSets' );
} );