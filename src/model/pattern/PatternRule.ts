import { BASIC_SOLVE_DEFAULTS, BasicSolveOptions, FeatureSet } from './feature/FeatureSet.ts';
import { TDescribedPatternBoard } from './TDescribedPatternBoard.ts';
import { Embedding } from './Embedding.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { getEmbeddings } from './getEmbeddings.ts';
import PatternRuleMatchState from './PatternRuleMatchState.ts';
import FeatureCompatibility from './feature/FeatureCompatibility.ts';
import { TPatternBoard } from './TPatternBoard.ts';
import { optionize3 } from 'phet-lib/phet-core';
import FaceValue from '../data/face-value/FaceValue.ts';
import _ from '../../workarounds/_.ts';
import { TPatternFace } from './TPatternFace.ts';
import { TPatternEdge } from './TPatternEdge.ts';
import { SolutionSet } from './SolutionSet.ts';
import { getIndeterminateEdges } from './getIndeterminateEdges.ts';
import { getFaceFeatureCombinations } from './feature/getFaceFeatureCombinations.ts';
import { FaceColorDualFeature } from './feature/FaceColorDualFeature.ts';

export class PatternRule {
  public constructor(
    public readonly patternBoard: TDescribedPatternBoard,
    public readonly inputFeatureSet: FeatureSet,
    public readonly outputFeatureSet: FeatureSet
  ) {}

  public getInputDifficultyScoreA(): number {
    return this.inputFeatureSet.getInputDifficultyScoreA() + 0.75 * this.patternBoard.vertices.length;
  }

  // TODO: now that we have input/output targets, the patternBoard here is redundant
  public embedded( patternBoard: TDescribedPatternBoard, embedding: Embedding ): PatternRule | null {
    const inputFeatureSet = this.inputFeatureSet.embedded( patternBoard, embedding );
    if ( inputFeatureSet === null ) {
      return null;
    }

    const outputFeatureSet = this.outputFeatureSet.embedded( patternBoard, embedding )!;
    if ( outputFeatureSet === null ) {
      return null;
    }

    return new PatternRule( patternBoard, inputFeatureSet, outputFeatureSet );
  }

  public getEmbeddedRules( embeddings: Embedding[] ): PatternRule[] {
    // TODO: integrate the description, then remove the cast!
    return embeddings.map( embedding => this.embedded( embedding.targetPatternBoard as TDescribedPatternBoard, embedding ) ).filter( rule => rule !== null ) as PatternRule[];
  }

  public isIsomorphicTo( other: PatternRule ): boolean {
    if ( this.patternBoard !== other.patternBoard ) {
      return false;
    }

    if ( !this.inputFeatureSet.hasSameShapeAs( other.inputFeatureSet ) || !this.outputFeatureSet.hasSameShapeAs( other.outputFeatureSet ) ) {
      return false;
    }

    const automorphisms = getEmbeddings( this.patternBoard, this.patternBoard );

    for ( const automorphism of automorphisms ) {
      const embeddedRule = this.embedded( this.patternBoard, automorphism );
      if ( embeddedRule ) {
        // TODO: can we ditch the "output feature set equals"? Hmm, probably not yet?
        if ( embeddedRule.inputFeatureSet.equals( other.inputFeatureSet ) && embeddedRule.outputFeatureSet.equals( other.outputFeatureSet ) ) {
          return true;
        }
      }
    }

    return false;
  }

  public isSubsetOf( other: PatternRule ): boolean {
    return this.inputFeatureSet.isSubsetOf( other.inputFeatureSet ) && this.outputFeatureSet.isSubsetOf( other.outputFeatureSet );
  }

  public matches( featureSet: FeatureSet ): boolean {
    return this.inputFeatureSet.isSubsetOf( featureSet );
  }

  public getMatchState( featureSet: FeatureSet ): PatternRuleMatchState {
    const inputCompatibility = this.inputFeatureSet.getQuickCompatibilityWith( featureSet );

    if ( inputCompatibility === FeatureCompatibility.INCOMPATIBLE || inputCompatibility === FeatureCompatibility.NO_MATCH_NEEDS_FACE_VALUES ) {
      return PatternRuleMatchState.INCOMPATIBLE;
    }

    // TODO: consider saying "incompatible" if our end-resut won't be compatible?
    if ( this.outputFeatureSet.isSubsetOf( featureSet ) ) {
      return PatternRuleMatchState.INCONSEQUENTIAL;
    }

    if ( inputCompatibility === FeatureCompatibility.NO_MATCH_NEEDS_STATE ) {
      return PatternRuleMatchState.DORMANT;
    }
    else {
      return PatternRuleMatchState.ACTIONABLE;
    }
  }

  public isRedundant( embeddedRules: PatternRule[] ): boolean {
    if ( this.isTrivial() ) {
      return true;
    }

    return this.outputFeatureSet.isSubsetOf( PatternRule.withRulesApplied( this.patternBoard, this.inputFeatureSet, embeddedRules ) );
  }

  public hasApplication( featureSet: FeatureSet ): boolean {
    return this.matches( featureSet ) && !this.outputFeatureSet.isSubsetOf( featureSet );
  }

  // Note: can throw IncompatibleFeatureError
  public apply( featureSet: FeatureSet ): void {
    assertEnabled() && assert( this.hasApplication( featureSet ) );

    // TODO TODO: FeatureSet.difference, so we can more accurately specify the delta(!)
    // TODO: this is effectively "re-applying" things in the input pattern(!)
    featureSet.applyFeaturesFrom( this.outputFeatureSet );
  }

  // TODO: create immutable forms of expression (for use when we're not... trying to squeeze out performance).

  public isTrivial(): boolean {
    return this.outputFeatureSet.isSubsetOf( this.inputFeatureSet );
  }

  public toCanonicalString(): string {
    return `rule:${this.inputFeatureSet.toCanonicalString()}->${this.outputFeatureSet.toCanonicalString()}`;
  }

  // TODO: TDescribedPatternBoard should be integrated into TPatternBoard!
  public static getBasicRule( patternBoard: TDescribedPatternBoard, inputFeatureSet: FeatureSet, options?: BasicSolveOptions ): PatternRule | null {
    const outputFeatureSet = inputFeatureSet.solved( options );

    if ( outputFeatureSet ) {
      return new PatternRule( patternBoard, inputFeatureSet, outputFeatureSet );
    }
    else {
      return null;
    }
  }

  public static withRulesApplied( patternBoard: TPatternBoard, initialFeatureSet: FeatureSet, embeddedRules: PatternRule[] ): FeatureSet {
    assertEnabled() && assert( embeddedRules.every( otherRule => otherRule.patternBoard === patternBoard ), 'embedding check' );

    let currentRuleList = embeddedRules;
    let nextRuleList: PatternRule[] = [];
    const featureState = initialFeatureSet.clone();

    let changed = true;

    // TODO: try to prune things based on whether a rule's "input set" of edges/faces has changed since it was last evaluated?
    // TODO: how to get that computation to be LESS than what we have now?

    while ( changed ) {
      changed = false;

      for ( const rule of currentRuleList ) {

        const matchState = rule.getMatchState( featureState );

        if ( matchState === PatternRuleMatchState.ACTIONABLE ) {
          rule.apply( featureState );
          changed = true;
        }
        else if ( matchState === PatternRuleMatchState.DORMANT ) {
          nextRuleList.push( rule );
        }
      }

      currentRuleList = nextRuleList;
      nextRuleList = [];
    }

    return featureState;
  }

  // Find rules with the same input feature set and collapse them (union)
  public static collapseRules( rules: PatternRule[] ): PatternRule[] {
    if ( rules.length === 0 ) {
      return rules;
    }

    const patternBoard = rules[ 0 ].patternBoard;
    assertEnabled() && assert( rules.every( rule => rule.patternBoard === patternBoard ), 'pattern board check' );

    const map = new Map<string, PatternRule>();

    for ( const rule of rules ) {
      const key = rule.inputFeatureSet.toCanonicalString();

      const existingRule = map.get( key );
      if ( existingRule ) {
        if ( existingRule.outputFeatureSet.isSubsetOf( rule.outputFeatureSet ) ) {
          map.set( key, rule );
        }
        else if ( !rule.outputFeatureSet.isSubsetOf( existingRule.outputFeatureSet ) ) {
          const union = rule.outputFeatureSet.union( existingRule.outputFeatureSet )!;
          assertEnabled() && assert( union );
          map.set( key, new PatternRule( patternBoard, rule.inputFeatureSet, union ) );
        }
      }
      else {
        map.set( key, rule );
      }
    }

    return [ ...map.values() ];
  }

  public static getSolutionEnumeratedRules( patternBoard: TDescribedPatternBoard, providedOptions?: GetRulesOptions ): PatternRule[] {
    const options = optionize3<GetRulesOptions, GetRulesSelfOptions, BasicSolveOptions>()( {}, GET_RULES_DEFAULTS, providedOptions );

    // TODO: handle enumeration of all cases
    assertEnabled() && assert( !options?.solveSectors, 'sector solving not yet supported' );

    const automorphisms = getEmbeddings( patternBoard, patternBoard );

    // TODO: perhaps we can reduce the isomorphisms here? [probably not]
    const embeddedPrefilterRules = options.prefilterRules ? PatternRule.collapseRules( options.prefilterRules.flatMap( rule => {
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

          if ( numFeatures + featureCount <= options.featureLimit ) {
            const faceColorSet = initialSet.withFaceColorDuals( features );
            if ( faceColorSet ) {
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


    const rules: PatternRule[] = [];
    let count = 0;

    let leafCallback = ( set: SolutionFeatureSet, numFeatures: number, numEvaluatedFeatures: number ): void => {

      if ( set.featureSet.isCanonicalWith( automorphisms ) ) {
        const inputFeatureSet = set.featureSet;
        const outputFeatureSet = set.getOutputFeatureSet();

        if ( !outputFeatureSet ) {
          return;
        }

        count++;
        if ( count % 10000000 === 0 ) {
          console.log( count );
        }

        const rule = new PatternRule( patternBoard, inputFeatureSet, outputFeatureSet );

        // See if it is guaranteed redundant!
        if ( !rule.isTrivial() ) {
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

          rules.push( rule );
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

    const rootFeatureSet = FeatureSet.empty( patternBoard );
    const rootSolutionSet = SolutionSet.fromFeatureSet( rootFeatureSet, options.solveEdges, options.solveSectors, options.solveFaceColors, options.highlander )!;
    assertEnabled() && assert( rootSolutionSet );

    const rootSet = new SolutionFeatureSet( rootSolutionSet, rootFeatureSet, null, embeddedPrefilterRules, options.highlander );

    forEachPossibleFaceFeatureSet( rootSet, leafCallback, 0, 0 );

    return rules;
  }

  public static filterAndSortRules( rules: PatternRule[], previousRules: PatternRule[] = [] ): PatternRule[] {
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
  }

  public static computeFilteredRules( patternBoard: TDescribedPatternBoard, options?: GetRulesOptions ): PatternRule[] {
    const rawRules = PatternRule.getSolutionEnumeratedRules( patternBoard, options );

    return PatternRule.filterAndSortRules( rawRules, options?.prefilterRules || [] );
  }
}

// TODO: OMG, if we have an isomorphic option... we can bail that entire sub-tree no?
type GetRulesSelfOptions = {
  featureLimit?: number; // counts 1 for edge or face, n-1 for each face color duals (e.g. how many linked faces)
  hitFeatureLimitCallback?: ( () => void ) | null;
  includeFaceValueZero?: boolean;
  prefilterRules?: PatternRule[] | null;
};

export type GetRulesOptions = BasicSolveOptions & GetRulesSelfOptions;

export const GET_RULES_DEFAULTS = {
  ...BASIC_SOLVE_DEFAULTS,
  featureLimit: Number.POSITIVE_INFINITY,
  hitFeatureLimitCallback: null,
  includeFaceValueZero: false,
  prefilterRules: null,
} as const;

class SolutionFeatureSet {

  private outputFeatureSet: FeatureSet | null = null;
  private computedOutputFeatureSet = false;

  public constructor(
    public readonly solutionSet: SolutionSet,
    public readonly featureSet: FeatureSet,
    public readonly previousSet: SolutionFeatureSet | null,

    // rules that we will use to filter out redundancies, stored here so we can prune it during the search
    public readonly previousRules: PatternRule[],
    public readonly highlander: boolean,
  ) {}

  public withFaceValue( face: TPatternFace, value: FaceValue ): SolutionFeatureSet | null {
    const solutionSet = this.solutionSet.withFaceValue( face, value );
    if ( solutionSet ) {
      const featureSet = this.featureSet.clone();
      featureSet.addFaceValue( face, value );

      return new SolutionFeatureSet(
        solutionSet,
        featureSet,
        this,
        this.previousRules.filter( rule => {
          const ruleFaceValue = rule.inputFeatureSet.getFaceValue( face );

          return ruleFaceValue === undefined || ruleFaceValue === value;
        } ),
        this.highlander
      );
    }
    else {
      return null;
    }
  }

  // Only filters out rules that will need MORE face values to match. Signals we are DONE adding face values
  public withCompletedFaceValues(): SolutionFeatureSet {
    const faces = this.featureSet.patternBoard.faces;

    return new SolutionFeatureSet(
      this.solutionSet,
      this.featureSet,
      this.previousSet, // NOTE: copying the previous set, because we didn't actually "change" our features
      this.previousRules.filter( rule => {
        for ( const face of faces ) {
          const ruleFaceValue = rule.inputFeatureSet.getFaceValue( face );
          if ( ruleFaceValue !== undefined && ruleFaceValue !== this.featureSet.getFaceValue( face ) ) {
            return false;
          }
        }
        return true;
      } ),
      this.highlander
    );
  }

  public withFaceColorDuals( features: FaceColorDualFeature[] ): SolutionFeatureSet | null {
    const solutionSet = this.solutionSet.withFaceColorDuals( features );
    if ( solutionSet ) {
      const featureSet = this.featureSet.clone();
      for ( const feature of features ) {
        featureSet.addFaceColorDual( feature );
      }

      return new SolutionFeatureSet(
        solutionSet,
        featureSet,
        this,
        // TODO IS THERE A WAY WE CAN improve the filtering of rules here?
        this.previousRules,
        this.highlander
      );
    }
    else {
      return null;
    }
  }

  public nonExitEdgePartitioned( edge: TPatternEdge ): { black: SolutionFeatureSet | null; red: SolutionFeatureSet | null } {
    const solutionSets = this.solutionSet.nonExitEdgePartitioned( edge );

    let blackSet: SolutionFeatureSet | null = null;
    let redSet: SolutionFeatureSet | null = null;

    const blackPreviousRules: PatternRule[] = [];
    const redPreviousRules: PatternRule[] = [];

    // TODO: ignore previous rules IF our output feature set is a superset of the previous rule output.
    for ( const rule of this.previousRules ) {
      if ( rule.inputFeatureSet.impliesBlackEdge( edge ) ) {
        blackPreviousRules.push( rule );
      }
      else if ( rule.inputFeatureSet.impliesRedEdge( edge ) ) {
        redPreviousRules.push( rule );
      }
      else {
        blackPreviousRules.push( rule );
        redPreviousRules.push( rule );
      }
    }

    if ( solutionSets.black ) {
      const blackFeatureSet = this.featureSet.clone();
      blackFeatureSet.addBlackEdge( edge );
      blackSet = new SolutionFeatureSet(
        solutionSets.black,
        blackFeatureSet,
        this,
        blackPreviousRules,
        this.highlander
      );
    }
    if ( solutionSets.red ) {
      const redFeatureSet = this.featureSet.clone();
      redFeatureSet.addRedEdge( edge );
      redSet = new SolutionFeatureSet(
        solutionSets.red,
        redFeatureSet,
        this,
        redPreviousRules,
        this.highlander
      );
    }

    return { black: blackSet, red: redSet };
  }

  public withExitEdgeRed( edge: TPatternEdge ): SolutionFeatureSet | null {
    const solutionSet = this.solutionSet.withExitEdgeRed( edge );
    if ( solutionSet ) {
      const featureSet = this.featureSet.clone();
      featureSet.addRedEdge( edge );

      return new SolutionFeatureSet(
        solutionSet,
        featureSet,
        this,
        this.previousRules,
        this.highlander
      );
    }
    else {
      return null;
    }
  }

  // lazy computation
  public getOutputFeatureSet(): FeatureSet | null {
    if ( !this.computedOutputFeatureSet ) {
      this.computedOutputFeatureSet = true;

      let inputFeatureSet = this.featureSet;

      let solutionSet = this.solutionSet;

      // TODO: We should probably BAIL from the subtree if we detect a bad highlander rule(!)
      if ( this.highlander ) {
        // TODO: don't require a feature array?
        const filteredSet = solutionSet.withFilteredHighlanderSolutions( getIndeterminateEdges( this.featureSet.patternBoard, inputFeatureSet.getFeaturesArray() ) );

        if ( filteredSet ) {
          solutionSet = filteredSet;
        }
        else {
          return null;
        }
      }

      this.outputFeatureSet = solutionSet.addToFeatureSet( inputFeatureSet.clone() );
    }

    return this.outputFeatureSet;
  }
}
