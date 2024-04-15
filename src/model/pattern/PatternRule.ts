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
import { IncompatibleFeatureError } from './feature/IncompatibleFeatureError.ts';
import { TPatternEdge } from './TPatternEdge.ts';
import { SolutionSet } from './SolutionSet.ts';
import { getIndeterminateEdges } from './getIndeterminateEdges.ts';

export class PatternRule {
  public constructor(
    public readonly patternBoard: TDescribedPatternBoard,
    public readonly inputFeatureSet: FeatureSet,
    public readonly outputFeatureSet: FeatureSet
  ) {}

  public getInputDifficultyScoreA(): number {
    return this.inputFeatureSet.getInputDifficultyScoreA();
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

  public static getSolutionEnumeratedRules( patternBoard: TDescribedPatternBoard, providedOptions?: GetRulesOptions ): PatternRule[] {
    const options = optionize3<GetRulesOptions, GetRulesSelfOptions, BasicSolveOptions>()( {}, GET_RULES_DEFAULTS, providedOptions );

    // TODO: handle enumeration of all cases
    assertEnabled() && assert( !options?.solveSectors, 'sector solving not yet supported' );
    assertEnabled() && assert( !options?.solveFaceColors, 'face solving not yet supported' );

    const automorphisms = getEmbeddings( patternBoard, patternBoard );

    // const processedShapeMap = new Map<string, FeatureSet[]>();
    //
    // // TODO: consider using automorphisms to prune earlier? (MEH: PROBABLY NOT WORTH IT)
    //
    // let maxIso = 0;
    //
    // const addToShapeMap = ( featureSet: FeatureSet ): void => {
    //   const key = featureSet.getShapeString();
    //   let featuresWithShape = processedShapeMap.get( key );
    //   if ( featuresWithShape ) {
    //     featuresWithShape.push( featureSet );
    //     if ( featuresWithShape.length > maxIso ) {
    //       maxIso = featuresWithShape.length;
    //       console.log( `maxIso: ${maxIso}` );
    //     }
    //   }
    //   else {
    //     processedShapeMap.set( key, [ featureSet ] );
    //   }
    // };
    //
    // const getIsomorphicProcessed = ( featureSet: FeatureSet ): FeatureSet | null => {
    //   const key = featureSet.getShapeString();
    //   const featuresWithShape = processedShapeMap.get( key );
    //   if ( featuresWithShape ) {
    //     return featuresWithShape.find( otherFeatureSet => featureSet.isIsomorphicTo( otherFeatureSet ) ) ?? null;
    //   }
    //   else {
    //     return null;
    //   }
    // };

    const forEachPossibleFaceFeatureSet = (
      initialSet: SolutionFeatureSet,
      callback: ( set: SolutionFeatureSet, numFeatures: number, numEvaluatedFeatures: number ) => void,
      numInitialFeatures: number,
      numInitialEvaluatedFeatures: number
    ): void => {
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
            callback( faceSet, numFeatures + 1, numEvaluatedFeatures + 1 );

            stack.push( faceSet );
            faceRecur( index + 1, numFeatures + 1, numEvaluatedFeatures + 1 );
            stack.pop();
          }
        }
      };
      // console.log( `${_.repeat( '  ', numInitialEvaluatedFeatures )}skip all faces` );
      callback( initialSet, numInitialFeatures, numInitialEvaluatedFeatures + 1 );
      faceRecur( 0, numInitialFeatures, numInitialEvaluatedFeatures );
    };

    // callback returns whether it is successful (and we should explore the subtree)
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

    const rules: PatternRule[] = [];
    let count = 0;

    let leafCallback = ( set: SolutionFeatureSet, numFeatures: number, numEvaluatedFeatures: number ) => {
      if ( set.featureSet.isCanonicalWith( automorphisms ) ) {
        count++;
        if ( count % 1000 === 0 ) {
          console.log( count );
        }

        let inputFeatureSet = set.featureSet;

        let solutionSet = set.solutionSet;
        if ( options.highlander ) {
          // TODO: don't require a feature array?
          const filteredSet = solutionSet.withFilteredHighlanderSolutions( getIndeterminateEdges( patternBoard, inputFeatureSet.getFeaturesArray() ) );

          if ( filteredSet ) {
            solutionSet = filteredSet;
          }
          else {
            return;
          }
        }

        const outputFeatureSet = solutionSet.addToFeatureSet( inputFeatureSet.clone() );

        const rule = new PatternRule( patternBoard, inputFeatureSet, outputFeatureSet );

        // // TODO: this will be killing performance, get rid of it
        // if ( assertEnabled() ) {
        //   const sanityRule = PatternRule.getBasicRule( patternBoard, inputFeatureSet, options )!;
        //   assert( outputFeatureSet.equals( sanityRule?.outputFeatureSet ), 'sanity check' );
        // }

        if ( !rule.isTrivial() ) {
          rules.push( rule );
        }
      }
    };

    if ( options.solveEdges ) {
      const originalCallback = leafCallback;

      leafCallback = ( featureSet, numFeatures, numEvaluatedFeatures ) => {
        return forEachPossibleEdgeFeatureSet( featureSet, originalCallback, numFeatures, numEvaluatedFeatures );
      };
    }

    const rootFeatureSet = FeatureSet.empty( patternBoard );
    const rootSolutionSet = SolutionSet.fromFeatureSet( rootFeatureSet, options.solveEdges, options.solveSectors, options.solveFaceColors, options.highlander )!;
    assertEnabled() && assert( rootSolutionSet );

    const rootSet = new SolutionFeatureSet( rootSolutionSet, rootFeatureSet );

    forEachPossibleFaceFeatureSet( rootSet, leafCallback, 0, 0 );

    return rules;
  }

  public static filterAndSortRules( rules: PatternRule[], previousRules: PatternRule[] = [] ): PatternRule[] {
    if ( rules.length === 0 ) {
      return rules;
    }

    const mainPatternBoard = rules[ 0 ].patternBoard;

    rules = _.sortBy( rules, rule => rule.getInputDifficultyScoreA() );

    // TODO: use a better way for given the "score" setup
    // TODO: this creates a LOT of potential arrays, and is probably memory-unfriendly

    const solveRuleScores = _.uniq( rules.map( rule => rule.getInputDifficultyScoreA() ) );
    const embeddedRulesLessThanScoreMap = new Map<number, PatternRule[]>( solveRuleScores.map( size => [ size, [] ] ) );

    const embeddings = getEmbeddings( mainPatternBoard, mainPatternBoard );
    for ( const rule of rules ) {
      const embeddedRules = rule.getEmbeddedRules( embeddings );
      const score = rule.getInputDifficultyScoreA();

      for ( const otherScore of solveRuleScores ) {
        if ( score < otherScore ) {
          embeddedRulesLessThanScoreMap.get( otherScore )!.push( ...embeddedRules );
        }
      }
    }

    const embeddedPreviousRules = previousRules.flatMap( rule => rule.getEmbeddedRules( getEmbeddings( rule.patternBoard, mainPatternBoard ) ) );

    return rules.filter( rule => !rule.isRedundant( [
      ...embeddedPreviousRules,
      ...embeddedRulesLessThanScoreMap.get( rule.getInputDifficultyScoreA() )!,
    ] ) );
  }
}

// TODO: OMG, if we have an isomorphic option... we can bail that entire sub-tree no?
type GetRulesSelfOptions = {
  featureLimit?: number; // counts 1 for edge or face, n-1 for each face color duals (e.g. how many linked faces)
  includeFaceValueZero?: boolean;
};

export type GetRulesOptions = BasicSolveOptions & GetRulesSelfOptions;

export const GET_RULES_DEFAULTS = {
  ...BASIC_SOLVE_DEFAULTS,
  featureLimit: Number.POSITIVE_INFINITY,
  includeFaceValueZero: false
} as const;

class SolutionFeatureSet {
  public constructor(
    public readonly solutionSet: SolutionSet,
    public readonly featureSet: FeatureSet,
  ) {}

  public withFaceValue( face: TPatternFace, value: FaceValue ): SolutionFeatureSet | null {
    const solutionSet = this.solutionSet.withFaceValue( face, value );
    if ( solutionSet ) {
      const featureSet = this.featureSet.clone();
      featureSet.addFaceValue( face, value );

      return new SolutionFeatureSet(
        solutionSet,
        featureSet
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

    if ( solutionSets.black ) {
      const blackFeatureSet = this.featureSet.clone();
      blackFeatureSet.addBlackEdge( edge );
      blackSet = new SolutionFeatureSet(
        solutionSets.black,
        blackFeatureSet
      );
    }
    if ( solutionSets.red ) {
      const redFeatureSet = this.featureSet.clone();
      redFeatureSet.addRedEdge( edge );
      redSet = new SolutionFeatureSet(
        solutionSets.red,
        redFeatureSet
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
        featureSet
      );
    }
    else {
      return null;
    }
  }
}

// Also records what we have "NOT" chosen, so we can do intelligent symmetry pruning
class FeatureSetDual {

  public shapeKey: string;

  public constructor(
    public readonly featureSet: FeatureSet,
    public readonly blankFaces: Set<TPatternFace>,
    public readonly blankEdges: Set<TPatternEdge>,
    // public readonly blankSectors: Set<TPatternFace> TODO: add when we do sectors
  ) {
    this.shapeKey = `${this.featureSet.getShapeString()} + ${blankFaces.size} + ${blankEdges.size}`;
  }

  public isIsomorphicTo( other: FeatureSetDual, automorphisms: Embedding[] ): boolean {
    assertEnabled() && assert( this.featureSet.patternBoard === other.featureSet.patternBoard, 'embedding check' );

    assertEnabled() && assert( this.shapeKey === other.shapeKey, 'Should be using hashes to filter' );

    for ( const automorphism of automorphisms ) {
      try {
        const embeddedFeatureSet = this.featureSet.embedded( this.featureSet.patternBoard, automorphism );
        if ( embeddedFeatureSet && embeddedFeatureSet.equals( other.featureSet ) ) {
          let matches = true;

          // Scan blank faces for matches
          for ( const blankFace of this.blankFaces ) {
            const embeddedBlankFace = automorphism.mapFace( blankFace );
            if ( !other.blankFaces.has( embeddedBlankFace ) ) {
              matches = false;
              break;
            }
          }

          if ( !matches ) {
            return false;
          }

          // Scan blank edges for matches
          for ( const blankEdge of this.blankEdges ) {
            if ( blankEdge.isExit ) {
              for ( const exitEdge of automorphism.mapExitEdges( blankEdge ) ) {
                if ( !other.blankEdges.has( exitEdge ) ) {
                  matches = false;
                  break;
                }
              }
              if ( !matches ) {
                break;
              }
            }
            else {
              const embeddedBlankEdge = automorphism.mapNonExitEdge( blankEdge );
              if ( !other.blankEdges.has( embeddedBlankEdge ) ) {
                matches = false;
                break;
              }
            }
          }

          return matches;
        }
      }
      catch ( e ) {
        // ignore incompatible feature embeddings (just in case)
        if ( !( e instanceof IncompatibleFeatureError ) ) {
          throw e;
        }
      }
    }

    return false;
  }
}