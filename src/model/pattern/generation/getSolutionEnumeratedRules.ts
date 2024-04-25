import { TPatternBoard } from '../TPatternBoard.ts';
import { GET_RULES_DEFAULTS, GetRulesOptions, GetRulesSelfOptions } from './GetRulesOptions.ts';
import { PatternRule } from '../PatternRule.ts';
import { optionize3 } from 'phet-lib/phet-core';
import { BasicSolveOptions, FeatureSet } from '../feature/FeatureSet.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { getEmbeddings } from '../getEmbeddings.ts';
import { getFaceFeatureCombinations } from '../feature/getFaceFeatureCombinations.ts';
import { FaceColorDualFeature } from '../feature/FaceColorDualFeature.ts';
import { SolutionFeatureSet } from './SolutionFeatureSet.ts';
import FaceValue from '../../data/face-value/FaceValue.ts';
import { filterAndSortRules } from './filterAndSortRules.ts';
import { SolutionSet } from '../SolutionSet.ts';
import _ from '../../../workarounds/_.ts';
import { getCollapsedRules } from './getCollapsedRules.ts';

export const getSolutionEnumeratedRules = ( patternBoard: TPatternBoard, providedOptions?: GetRulesOptions ): PatternRule[] => {
  const options = optionize3<GetRulesOptions, GetRulesSelfOptions, BasicSolveOptions>()( {}, GET_RULES_DEFAULTS, providedOptions );

  // TODO: handle enumeration of all cases
  assertEnabled() && assert( !options?.solveSectors, 'sector solving not yet supported' );

  const automorphisms = getEmbeddings( patternBoard, patternBoard );

  // TODO: perhaps we can reduce the isomorphisms here? [probably not]
  const embeddedPrefilterRules = options.prefilterRules ? getCollapsedRules( options.prefilterRules.flatMap( rule => {
    return rule.getEmbeddedRules( getEmbeddings( rule.patternBoard, patternBoard ) );
  } ) ) : [];

  // TODO: if we start pruning based on isomorphisms, change this
  const canFaceColorDualsBeSymmetryFiltered = true;

  // Get a list of unique face feature combinations
  const faceColorDualCombinations = options.solveFaceColors ? getFaceFeatureCombinations( patternBoard ).filter( features => {
    return canFaceColorDualsBeSymmetryFiltered ? FaceColorDualFeature.areCanonicalWith( features, automorphisms ) : true;
  } ) : null;

  const faceColorDualCombinationFeatureCounts = faceColorDualCombinations ? faceColorDualCombinations.map( features => {
    let count = 0;
    for ( const feature of features ) {
      count += feature.primaryFaces.length + feature.secondaryFaces.length - 1;
    }
    return count;
  } ) : null;

  const forEachPossibleFaceFeatureSet = (
    initialSet: SolutionFeatureSet,
    callback: ( set: SolutionFeatureSet, numFeatures: number, numEvaluatedFeatures: number ) => void,
    numInitialFeatures: number,
    numInitialEvaluatedFeatures: number
  ): void => {
    // TODO: refactor this, especially if this isn't run first(!) we don't want to run this unnecessarily
    const faces = patternBoard.faces.filter( face => !face.isExit );
    const stack = [ initialSet ];

    // TODO: get rid of numEvaluatedFeatures
    const faceRecur = ( index: number, numFeatures: number, numEvaluatedFeatures: number ): void => {

      if ( index === faces.length ) {
        return;
      }

      const previousSet = stack[ stack.length - 1 ];
      if ( numFeatures <= options.featureLimit ) {
        // console.log( `${_.repeat( '  ', numEvaluatedFeatures )}skip face ${index}` );

        faceRecur( index + 1, numFeatures, numEvaluatedFeatures + 1 );
      }

      if ( numFeatures >= options.featureLimit ) {
        options.hitFeatureLimitCallback && options.hitFeatureLimitCallback();
        return;
      }

      const face = faces[ index ];
      const values: FaceValue[] = _.range( options.includeFaceValueZero ? 0 : 1, face.edges.length );
      if ( options.highlander ) {
        values.push( null );
      }

      for ( const value of values ) {
        // console.log( `${_.repeat( '  ', numEvaluatedFeatures )}face ${index} value ${value}` );

        const faceSet = previousSet.withFaceValue( face, value );
        if ( faceSet ) {
          callback( faceSet.withCompletedFaceValues(), numFeatures + 1, numEvaluatedFeatures + 1 );

          stack.push( faceSet );
          faceRecur( index + 1, numFeatures + 1, numEvaluatedFeatures + 1 );
          stack.pop();
        }
      }
    };
    // console.log( `${_.repeat( '  ', numInitialEvaluatedFeatures )}skip all faces` );
    callback( initialSet.withCompletedFaceValues(), numInitialFeatures, numInitialEvaluatedFeatures + 1 );
    faceRecur( 0, numInitialFeatures, numInitialEvaluatedFeatures );
  };

  const forEachPossibleEdgeFeatureSet = (
    initialSet: SolutionFeatureSet,
    callback: ( set: SolutionFeatureSet, numFeatures: number, numEvaluatedFeatures: number ) => void,
    numInitialFeatures: number,
    numInitialEvaluatedFeatures: number
  ): void => {
    const edges = patternBoard.edges;
    const stack = [ initialSet ];

    const edgeRecur = ( index: number, numFeatures: number, numEvaluatedFeatures: number ): void => {

      if ( index === edges.length ) {
        return;
      }

      const previousSet = stack[ stack.length - 1 ];
      if ( numFeatures <= options.featureLimit ) {
        // console.log( `${_.repeat( '  ', numEvaluatedFeatures )}skip edge ${index}` );

        edgeRecur( index + 1, numFeatures, numEvaluatedFeatures + 1 );
      }

      if ( numFeatures >= options.featureLimit ) {
        options.hitFeatureLimitCallback && options.hitFeatureLimitCallback();
        return;
      }

      const edge = edges[ index ];

      let edgeSets: SolutionFeatureSet[] = [];
      if ( edge.isExit ) {
        const redExitSet = previousSet.withExitEdgeRed( edge );
        redExitSet && edgeSets.push( redExitSet );
      }
      else {
        const partition = previousSet.nonExitEdgePartitioned( edge );
        partition.black && edgeSets.push( partition.black );
        partition.red && edgeSets.push( partition.red );
      }

      for ( const edgeSet of edgeSets ) {
        callback( edgeSet, numFeatures + 1, numEvaluatedFeatures + 1 );

        stack.push( edgeSet );
        edgeRecur( index + 1, numFeatures + 1, numEvaluatedFeatures + 1 );
        stack.pop();
      }
    };
    // console.log( `${_.repeat( '  ', numInitialEvaluatedFeatures )}skip all edges` );
    callback( initialSet, numInitialFeatures, numInitialEvaluatedFeatures + 1 );
    edgeRecur( 0, numInitialFeatures, numInitialEvaluatedFeatures );
  };


  const forEachPossibleFaceColorDualFeatureSet = (
    initialSet: SolutionFeatureSet,
    callback: ( set: SolutionFeatureSet, numFeatures: number, numEvaluatedFeatures: number ) => void,
    numFeatures: number,
    numEvaluatedFeatures: number
  ): void => {
    const combinations = faceColorDualCombinations!;
    const combinationCounts = faceColorDualCombinationFeatureCounts!;
    assertEnabled() && assert( combinations );

    // TODO: ditch numEvaluatedFeatures!

    if ( numFeatures < options.featureLimit ) {
      // TODO: pre-measure this (if we are ever not the almost-final bit)
      for ( let i = 0; i < combinations.length; i++ ) {
        const features = combinations[ i ];
        const featureCount = combinationCounts[ i ];

        // console.log( 'before' );
        // console.log( initialSet.solutionSet.toString() );

        // console.log( 'features' );
        // console.log( features );

        if ( numFeatures + featureCount <= options.featureLimit ) {
          const faceColorSet = features.length ? initialSet.withFaceColorDuals( features ) : initialSet;
          if ( faceColorSet ) {
            // console.log( 'after' );
            // console.log( faceColorSet.solutionSet.toString() );
            callback( faceColorSet, numFeatures + featureCount, numEvaluatedFeatures + 1 );
          }
        }
        else {
          options.hitFeatureLimitCallback && options.hitFeatureLimitCallback();
        }
      }
    }
    else {
      options.hitFeatureLimitCallback && options.hitFeatureLimitCallback();

      // NOTE: Lets double-check this, but our combinations should include the empty set FOR us.
      // We just do this here INSTEAD for efficiency, so we don't need an iteration
      callback( initialSet, numFeatures, numEvaluatedFeatures + 1 );
    }
  };


  let count = 0;

  let ruleAddedCounter = 0;
  let rules: PatternRule[] = [];
  let embeddedFilterRules: PatternRule[] = [
    ...embeddedPrefilterRules
  ];

  const compactRules = () => {
    rules = filterAndSortRules( rules, options.prefilterRules || [] );
    embeddedFilterRules = [
      ...embeddedPrefilterRules,
      ...rules.flatMap( rule => rule.getEmbeddedRules( automorphisms ) ),
    ];
  };

  let lastScannedFeatureSet: FeatureSet | null = null;
  const addRule = ( rule: PatternRule ) => {
    rules.push( rule );
    embeddedFilterRules.push( ...rule.getEmbeddedRules( automorphisms ) );
    ruleAddedCounter++;
    if ( ruleAddedCounter % 100 === 0 ) {
      compactRules();
    }
  };

  let leafCallback = ( set: SolutionFeatureSet, numFeatures: number, numEvaluatedFeatures: number ): void => {

    lastScannedFeatureSet = set.featureSet;

    if ( set.featureSet.isCanonicalWith( automorphisms ) ) {
      const inputFeatureSet = set.featureSet;
      const outputFeatureSet = set.getOutputFeatureSet();

      if ( !outputFeatureSet ) {
        return;
      }

      count++;
      if ( count % options.logModulo === 0 ) {
        compactRules();
        console.log( count.toString().replace( /\B(?=(\d{3})+(?!\d))/g, ',' ), rules.length, JSON.stringify( lastScannedFeatureSet?.serialize() ) );
      }

      const rule = new PatternRule( patternBoard, inputFeatureSet, outputFeatureSet );

      // See if it is guaranteed redundant!
      if ( !rule.isTrivial() ) {
        // See if it is redundant based on our prefilterRules + the previous "rule"
        if ( set.previousSet ) {
          const previousOutputFeatureSet = set.previousSet.getOutputFeatureSet();

          if ( previousOutputFeatureSet ) {
            if ( previousOutputFeatureSet.union( inputFeatureSet )!.equals( outputFeatureSet ) ) {
              return;
            }

            if ( set.previousRules.length ) {
              // TODO: ... how can we not make another huge array here?
              if ( rule.isRedundant( [
                new PatternRule( patternBoard, set.previousSet.featureSet, previousOutputFeatureSet! ),
                ...set.previousRules
              ] ) ) {
                return;
              }
            }
          }
        }

        if ( rule.isRedundant( embeddedFilterRules ) ) {
          return;
        }

        addRule( rule );
      }
    }
  };

  if ( options.solveFaceColors ) {
    const originalCallback = leafCallback;

    leafCallback = ( featureSet, numFeatures, numEvaluatedFeatures ) => {
      return forEachPossibleFaceColorDualFeatureSet( featureSet, originalCallback, numFeatures, numEvaluatedFeatures );
    };
  }

  if ( options.solveEdges ) {
    const originalCallback = leafCallback;

    leafCallback = ( featureSet, numFeatures, numEvaluatedFeatures ) => {
      return forEachPossibleEdgeFeatureSet( featureSet, originalCallback, numFeatures, numEvaluatedFeatures );
    };
  }

  const rootFeatureSet = options.vertexOrderLimit === null ? FeatureSet.empty( patternBoard ) : FeatureSet.emptyWithVertexOrderLimit( patternBoard, options.vertexOrderLimit );
  const rootSolutionSet = SolutionSet.fromFeatureSet( rootFeatureSet, options.solveEdges, options.solveSectors, options.solveFaceColors, options.highlander )!;
  assertEnabled() && assert( rootSolutionSet );

  const rootSet = new SolutionFeatureSet( rootSolutionSet, rootFeatureSet, null, embeddedPrefilterRules, options.highlander );

  forEachPossibleFaceFeatureSet( rootSet, leafCallback, 0, 0 );

  compactRules();

  return rules;
};
