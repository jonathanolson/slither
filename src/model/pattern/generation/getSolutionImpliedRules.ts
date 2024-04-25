import { optionize3 } from 'phet-lib/phet-core';
import { TPatternBoard } from '../TPatternBoard.ts';
import { GET_RULES_DEFAULTS, GetRulesOptions, GetRulesSelfOptions } from './GetRulesOptions.ts';
import { PatternRule } from '../PatternRule.ts';
import { BasicSolveOptions, FeatureSet } from '../feature/FeatureSet.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import FaceValue from '../../data/face-value/FaceValue.ts';
import { getEmbeddings } from '../getEmbeddings.ts';
import { SolutionSet } from '../SolutionSet.ts';
import _ from '../../../workarounds/_.ts';

export const getSolutionImpliedRules = ( patternBoard: TPatternBoard, providedOptions?: GetRulesOptions ): PatternRule[] => {

  const options = optionize3<GetRulesOptions, GetRulesSelfOptions, BasicSolveOptions>()( {}, GET_RULES_DEFAULTS, providedOptions );

  assertEnabled() && assert( !options.highlander );
  assertEnabled() && assert( !isFinite( options.featureLimit ) );

  // enumerate all face value features (up to isomorphism)
  const faceValueFeatures: FeatureSet[] = [];
  const valuedFaces = patternBoard.faces.filter( face => !face.isExit );
  const faceValueRecur = ( featureSet: FeatureSet, index: number ): void => {
    if ( index === valuedFaces.length ) {
      if ( faceValueFeatures.every( otherFeatureSet => !featureSet.isIsomorphicTo( otherFeatureSet ) ) ) {
        faceValueFeatures.push( featureSet );
      }
    }
    else {
      const face = valuedFaces[ index ];

      const values: FaceValue[] = _.range( options.includeFaceValueZero ? 0 : 1, face.edges.length );

      // blank
      faceValueRecur( featureSet, index + 1 );

      for ( const value of values ) {
        const faceFeatureSet = featureSet.clone();
        faceFeatureSet.addFaceValue( face, value );
        faceValueRecur( faceFeatureSet, index + 1 );
      }
    }
  };
  const rootFeatureSet = options.vertexOrderLimit === null ? FeatureSet.empty( patternBoard ) : FeatureSet.emptyWithVertexOrderLimit( patternBoard, options.vertexOrderLimit );
  faceValueRecur( rootFeatureSet, 0 );

  // TODO: logModulo


  // We will append to this list as we go
  const embeddedRules = ( options.prefilterRules ?? [] ).flatMap( rule => rule.getEmbeddedRules( getEmbeddings( rule.patternBoard, patternBoard ) ) );

  const automorphisms = getEmbeddings( patternBoard, patternBoard );

  const filteredRules: PatternRule[] = [];
  for ( const featureSet of faceValueFeatures ) {
    console.log( featureSet.toCanonicalString() );

    const impliedRules = SolutionSet.getImpliedRules(
      featureSet,
      options.solveEdges,
      options.solveSectors,
      options.solveFaceColors
    );

    for ( const rule of impliedRules ) {
      if ( !rule.isRedundant( embeddedRules ) ) {
        filteredRules.push( rule );
        embeddedRules.push( ...rule.getEmbeddedRules( automorphisms ) );
      }
    }
  }

  return _.sortBy( filteredRules, rule => rule.inputFeatureSet.getInputDifficultyScoreA() );
};
