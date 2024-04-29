import QUnit from 'qunit';
import { PatternRule } from '../../PatternRule.ts';
import { PatternBoardRuleSet } from '../../PatternBoardRuleSet.ts';
import { PatternBoardSolver } from '../../PatternBoardSolver.ts';
import { TPatternEdge } from '../../TPatternEdge.ts';
import { dualEdgeColorRuleSet } from '../dualEdgeColorRuleSet.ts';
import { basicEdgeRuleSets } from '../basicEdgeRuleSets.ts';
import { basicSectorImpliedRuleSets } from '../basicSectorImpliedRuleSets.ts';
import { basicColorRuleSets } from '../basicColorRuleSets.ts';
import { basicColorOnly4RuleSet } from '../basicColorOnly4RuleSet.ts';
import { basicColorOnly5RuleSet } from '../basicColorOnly5RuleSet.ts';
import { basicColorOnly6RuleSet } from '../basicColorOnly6RuleSet.ts';

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

  testRuleSets( [ dualEdgeColorRuleSet ], 'dualEdgeColorRuleSet' );

  testRuleSets( basicEdgeRuleSets, 'basicEdgeRuleSets' );

  testRuleSets( basicSectorImpliedRuleSets, 'basicSectorImpliedRuleSets' );

  testRuleSets( basicColorRuleSets, 'basicColorRuleSets' );
  testRuleSets( [ basicColorOnly4RuleSet ], 'basicColorOnly4RuleSet' );
  testRuleSets( [ basicColorOnly5RuleSet ], 'basicColorOnly5RuleSet' );
  testRuleSets( [ basicColorOnly6RuleSet ], 'basicColorOnly6RuleSet' );

  // testRuleSets( squareEdgeOnlyImplied0RuleSets, 'squareEdgeOnlyImplied0RuleSets' );
  // testRuleSets( squareEdgeOnlyImplied1RuleSets, 'squareEdgeOnlyImplied1RuleSets' );
  // testRuleSets( squareEdgeOnlyImplied2RuleSets, 'squareEdgeOnlyImplied2RuleSets' );
  // testRuleSets( squareEdgeOnlyImplied3RuleSets, 'squareEdgeOnlyImplied3RuleSets' );
  // testRuleSets( squareEdgeOnlyImplied4RuleSets, 'squareEdgeOnlyImplied4RuleSets' );
  //
  // testRuleSets( squareSectorOnlyImplied0RuleSets, 'squareSectorOnlyImplied0RuleSets' );
  // testRuleSets( squareSectorOnlyImplied1RuleSets, 'squareSectorOnlyImplied1RuleSets' );
  // testRuleSets( squareSectorOnlyImplied2RuleSets, 'squareSectorOnlyImplied2RuleSets' );
  //
  // testRuleSets( squareColorImplied0RuleSets, 'squareColorImplied0RuleSets' );
  // testRuleSets( squareColorImplied1RuleSets, 'squareColorImplied1RuleSets' );
  // testRuleSets( squareColorImplied2RuleSets, 'squareColorImplied2RuleSets' );
  //
  // testRuleSets( hexagonalEdgeOnlyImplied0RuleSets, 'hexagonalEdgeOnlyImplied0RuleSets' );
  // testRuleSets( hexagonalEdgeOnlyImplied1RuleSets, 'hexagonalEdgeOnlyImplied1RuleSets' );
  // testRuleSets( hexagonalEdgeOnlyImplied2RuleSets, 'hexagonalEdgeOnlyImplied2RuleSets' );
  //
  // testRuleSets( hexagonalSectorOnlyImplied0RuleSets, 'hexagonalSectorOnlyImplied0RuleSets' );
  //
  // testRuleSets( hexagonalColorImplied0RuleSets, 'hexagonalColorImplied0RuleSets' );
  //
  // testRuleSets( generalEdgeImplied0RuleSets, 'generalEdgeImplied0RuleSets' );
  // testRuleSets( generalEdgeImplied1RuleSets, 'generalEdgeImplied1RuleSets' );
  //
  // testRuleSets( generalSectorImplied0RuleSets, 'generalSectorImplied0RuleSets' );
  //
  // testRuleSets( generalColorImplied0RuleSets, 'generalColorImplied0RuleSets' );
} );