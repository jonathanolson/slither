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

  public static getRules( patternBoard: TDescribedPatternBoard, providedOptions?: GetRulesOptions ): PatternRule[] {

    const options = optionize3<GetRulesOptions, GetRulesSelfOptions, BasicSolveOptions>()( {}, GET_RULES_DEFAULTS, providedOptions );

    // TODO: handle enumeration of all cases
    assertEnabled() && assert( !options?.solveSectors, 'sector solving not yet supported' );
    assertEnabled() && assert( !options?.solveFaceColors, 'face solving not yet supported' );

    const visitedDualShapeMap = new Map<string, FeatureSetDual[]>();

    // Grab a reference for performance
    const automorphisms = getEmbeddings( patternBoard, patternBoard );

    const addToDualShapeMap = ( featureSetDual: FeatureSetDual ): void => {
      const key = featureSetDual.shapeKey;
      let featuresWithShape = visitedDualShapeMap.get( key );
      if ( featuresWithShape ) {
        featuresWithShape.push( featureSetDual );
      }
      else {
        visitedDualShapeMap.set( key, [ featureSetDual ] );
      }
    };

    const isIsomorphicToVisitedDual = ( featureSetDual: FeatureSetDual ): boolean => {
      const key = featureSetDual.shapeKey;
      const featureDualsWithShape = visitedDualShapeMap.get( key );
      if ( featureDualsWithShape ) {
        return featureDualsWithShape.some( otherFeatureSetDual => featureSetDual.isIsomorphicTo( otherFeatureSetDual, automorphisms ) );
      }
      else {
        return false;
      }
    };

    const allowAddedBlankRecur = ( featureSetDual: FeatureSetDual ): boolean => {
      return !isIsomorphicToVisitedDual( featureSetDual );
    };

    const allowAddedFeatureRecur = ( featureSetDual: FeatureSetDual ): boolean => {
      // TODO: remove the hasSolution(!), we're overdoing this
      return !isIsomorphicToVisitedDual( featureSetDual ) && featureSetDual.featureSet.hasSolution( options?.highlander );
    };

    const processedShapeMap = new Map<string, FeatureSet[]>();
    const processedWasSatisfied = new Map<FeatureSet, boolean>();

    const addToShapeMap = ( featureSet: FeatureSet, wasSatisfied: boolean ): void => {
      const key = featureSet.getShapeString();
      let featuresWithShape = processedShapeMap.get( key );
      if ( featuresWithShape ) {
        featuresWithShape.push( featureSet );
      }
      else {
        processedShapeMap.set( key, [ featureSet ] );
      }
      processedWasSatisfied.set( featureSet, wasSatisfied );
    };

    const getIsomorphicProcessed = ( featureSet: FeatureSet ): FeatureSet | null => {
      const key = featureSet.getShapeString();
      const featuresWithShape = processedShapeMap.get( key );
      if ( featuresWithShape ) {
        return featuresWithShape.find( otherFeatureSet => featureSet.isIsomorphicTo( otherFeatureSet ) ) ?? null;
      }
      else {
        return null;
      }
    };

    const forEachPossibleFaceFeatureSet = (
      initialFeatureSetDual: FeatureSetDual,
      callback: ( featureSetDual: FeatureSetDual, numFeatures: number, numEvaluatedFeatures: number ) => boolean,
      numInitialFeatures: number,
      numInitialEvaluatedFeatures: number
    ): boolean => {
      const faces = patternBoard.faces.filter( face => !face.isExit );
      const faceFeatureDualStack = [ initialFeatureSetDual ];

      const faceRecur = ( index: number, numFeatures: number, numEvaluatedFeatures: number ): boolean => {

        if ( index === faces.length ) {
          return true;
        }

        const previousFeatureSetDual = faceFeatureDualStack[ faceFeatureDualStack.length - 1 ];
        if ( numFeatures <= options.featureLimit ) {
          // console.log( `${_.repeat( '  ', numEvaluatedFeatures )}skip face ${index}` );

          const nextDual = new FeatureSetDual(
            previousFeatureSetDual.featureSet,
            new Set( [ ...previousFeatureSetDual.blankFaces, faces[ index ] ] ),
            previousFeatureSetDual.blankEdges
          );

          if ( allowAddedBlankRecur( nextDual ) ) {
            addToDualShapeMap( nextDual );

            faceFeatureDualStack.push( nextDual );
            const success = faceRecur( index + 1, numFeatures, numEvaluatedFeatures + 1 );
            faceFeatureDualStack.pop();

            // TODO: HOW WOULD THIS EVEN HAPPEN?
            if ( !success ) {
              // console.log( `  ${_.repeat( '  ', numEvaluatedFeatures )}faceRecur FALSE, aborting subtree` );
              return false;
            }
          }
        }

        if ( numFeatures >= options.featureLimit ) {
          return true;
        }

        const face = faces[ index ];
        const values: FaceValue[] = _.range( options.includeFaceValueZero ? 0 : 1, face.edges.length );
        if ( options.highlander ) {
          values.push( null );
        }

        for ( const value of values ) {
          // console.log( `${_.repeat( '  ', numEvaluatedFeatures )}face ${index} value ${value}` );
          const faceFeatureSet = previousFeatureSetDual.featureSet.clone();
          faceFeatureSet.addFaceValue( face, value );
          const faceFeatureSetDual = new FeatureSetDual(
            faceFeatureSet,
            previousFeatureSetDual.blankFaces,
            previousFeatureSetDual.blankEdges
          );

          // FOR NOW
          assertEnabled() && assert( faceFeatureSet.size === previousFeatureSetDual.featureSet.size + 1 );

          // TODO: reduce the DOUBLE-LOGIC_SOLVER here
          if ( allowAddedFeatureRecur( faceFeatureSetDual ) ) {
            addToDualShapeMap( faceFeatureSetDual );

            let skipDual = faceFeatureSetDual;
            if ( index + 1 < faces.length ) {
              skipDual = new FeatureSetDual(
                faceFeatureSet,
                new Set( [
                  ...previousFeatureSetDual.blankFaces,
                  ...faces.slice( index + 1 )
                ] ),
                previousFeatureSetDual.blankEdges
              );
            }

            const success = callback( skipDual, numFeatures + 1, numInitialEvaluatedFeatures + 1 );

            if ( success ) {
              // console.log( ` ${_.repeat( '  ', numEvaluatedFeatures )}exploring` );
              faceFeatureDualStack.push( faceFeatureSetDual );
              faceRecur( index + 1, numFeatures + 1, numEvaluatedFeatures + 1 );
              faceFeatureDualStack.pop();
            }
            else {
              // console.log( ` ${_.repeat( '  ', numEvaluatedFeatures )}no feature` );
            }
          }
        }

        return true;
      };
      // console.log( `${_.repeat( '  ', numInitialEvaluatedFeatures )}skip all faces` );
      const skipDual = new FeatureSetDual(
        initialFeatureSetDual.featureSet,
        new Set( [
          ...initialFeatureSetDual.blankFaces,
          ...faces
        ] ),
        initialFeatureSetDual.blankEdges
      );
      const rootSuccess = callback( skipDual, numInitialFeatures, numInitialEvaluatedFeatures + 1 );
      if ( !rootSuccess ) {
        return false;
      }
      return faceRecur( 0, numInitialFeatures, numInitialEvaluatedFeatures );
    };

    // callback returns whether it is successful (and we should explore the subtree)
    const forEachPossibleEdgeFeatureSet = (
      initialFeatureSetDual: FeatureSetDual,
      callback: ( featureSetDual: FeatureSetDual, numFeatures: number, numEvaluatedFeatures: number ) => boolean,
      numInitialFeatures: number,
      numInitialEvaluatedFeatures: number
    ): boolean => {
      const edges = patternBoard.edges;
      const edgeFeatureDualStack = [ initialFeatureSetDual ];

      const edgeRecur = ( index: number, numFeatures: number, numEvaluatedFeatures: number ): boolean => {

        if ( index === edges.length ) {
          return true;
        }

        const previousFeatureSetDual = edgeFeatureDualStack[ edgeFeatureDualStack.length - 1 ];
        if ( numFeatures <= options.featureLimit ) {
          // console.log( `${_.repeat( '  ', numEvaluatedFeatures )}skip edge ${index}` );

          const nextDual = new FeatureSetDual(
            previousFeatureSetDual.featureSet,
            previousFeatureSetDual.blankFaces,
            new Set( [ ...previousFeatureSetDual.blankEdges, edges[ index ] ] ),
          );

          if ( allowAddedBlankRecur( nextDual ) ) {
            addToDualShapeMap( nextDual );

            edgeFeatureDualStack.push( nextDual );
            const success = edgeRecur( index + 1, numFeatures, numEvaluatedFeatures + 1 );
            edgeFeatureDualStack.pop();

            if ( !success ) {
              // console.log( `  ${_.repeat( '  ', numEvaluatedFeatures )}edgeRecur FALSE, aborting subtree` );
              return false;
            }
          }
        }

        if ( numFeatures >= options.featureLimit ) {
          return true;
        }

        const edge = edges[ index ];

        // Black edge
        {
          // Don't apply black to exit edges
          if ( !edge.isExit ) {
            const blackFeatureSet = previousFeatureSetDual.featureSet.clone();
            blackFeatureSet.addBlackEdge( edges[ index ] );
            const blackFeatureSetDual = new FeatureSetDual(
              blackFeatureSet,
              previousFeatureSetDual.blankFaces,
              previousFeatureSetDual.blankEdges
            );

            // FOR NOW:
            assertEnabled() && assert( blackFeatureSet.size === previousFeatureSetDual.featureSet.size + 1 );

            // console.log( `${_.repeat( '  ', numEvaluatedFeatures )}black ${index}` );
            if ( allowAddedFeatureRecur( blackFeatureSetDual ) ) {
              addToDualShapeMap( blackFeatureSetDual );

              let skipDual = blackFeatureSetDual;
              if ( index + 1 < edges.length ) {
                skipDual = new FeatureSetDual(
                  blackFeatureSet,
                  previousFeatureSetDual.blankFaces,
                  new Set( [
                    ...previousFeatureSetDual.blankEdges,
                    ...edges.slice( index + 1 )
                  ] )
                );
              }

              const success = callback( skipDual, numFeatures + 1, numEvaluatedFeatures + 1 );

              if ( success ) {
                // console.log( ` ${_.repeat( '  ', numEvaluatedFeatures )}exploring` );
                edgeFeatureDualStack.push( blackFeatureSetDual );
                edgeRecur( index + 1, numFeatures + 1, numEvaluatedFeatures + 1 );
                edgeFeatureDualStack.pop();
              }
              else {
                // console.log( ` ${_.repeat( '  ', numEvaluatedFeatures )}no feature` );
              }
            }
          }
        }

        // Red edge
        {
          const redFeatureSet = previousFeatureSetDual.featureSet.clone();
          redFeatureSet.addRedEdge( edges[ index ] );
          const redFeatureSetDual = new FeatureSetDual(
            redFeatureSet,
            previousFeatureSetDual.blankFaces,
            previousFeatureSetDual.blankEdges
          );

          // FOR NOW:
          assertEnabled() && assert( redFeatureSet.size === previousFeatureSetDual.featureSet.size + 1 );

          // console.log( `${_.repeat( '  ', numEvaluatedFeatures )}red ${index}` );
          if ( allowAddedFeatureRecur( redFeatureSetDual ) ) {
            addToDualShapeMap( redFeatureSetDual );

            const success = callback( redFeatureSetDual, numFeatures + 1, numEvaluatedFeatures + 1 );

            if ( success ) {
              // console.log( ` ${_.repeat( '  ', numEvaluatedFeatures )}exploring` );
              edgeFeatureDualStack.push( redFeatureSetDual );
              edgeRecur( index + 1, numFeatures + 1, numEvaluatedFeatures + 1 );
              edgeFeatureDualStack.pop();
            }
            else {
              // console.log( ` ${_.repeat( '  ', numEvaluatedFeatures )}no feature` );
            }
          }
        }

        return true;
      };
      // console.log( `${_.repeat( '  ', numInitialEvaluatedFeatures )}skip all edges` );
      const skipDual = new FeatureSetDual(
        initialFeatureSetDual.featureSet,
        initialFeatureSetDual.blankFaces,
        new Set( [
          ...initialFeatureSetDual.blankEdges,
          ...edges
        ] ),
      );
      const rootSuccess = callback( skipDual, numInitialFeatures, numInitialEvaluatedFeatures + 1 );
      if ( !rootSuccess ) {
        return false;
      }
      return edgeRecur( 0, numInitialFeatures, numInitialEvaluatedFeatures );
    };

    const rules: PatternRule[] = [];
    let count = 0;

    let leafCallback = ( featureSetDual: FeatureSetDual, numFeatures: number, numEvaluatedFeatures: number ) => {
      const isomorphicDual = getIsomorphicProcessed( featureSetDual.featureSet );
      if ( isomorphicDual ) {
        const wasSatisfied = processedWasSatisfied.get( isomorphicDual );
        assertEnabled() && assert( wasSatisfied !== undefined );
        return processedWasSatisfied.get( isomorphicDual )!;
      }

      count++;
      if ( count % 10 === 0 ) {
        console.log( count );
      }
      const rule = PatternRule.getBasicRule( patternBoard, featureSetDual.featureSet, options );
      // console.log( `${_.repeat( '  ', numEvaluatedFeatures )}${rule ? `GOOD ${rule.isTrivial() ? '(trivial)' : '(actionable)'}` : 'BAD'} ${featureSetDual.featureSet.toCanonicalString()}${rule ? ` => ${rule.outputFeatureSet.toCanonicalString()}` : ''}` );
      if ( rule && !rule.isTrivial() ) {
        rules.push( rule );
      }

      addToShapeMap( featureSetDual.featureSet, !!rule );

      return !!rule;
    };

    if ( options.solveEdges ) {
      const originalCallback = leafCallback;

      leafCallback = ( featureSet, numFeatures, numEvaluatedFeatures ) => {
        return forEachPossibleEdgeFeatureSet( featureSet, originalCallback, numFeatures, numEvaluatedFeatures );
      };
    }

    forEachPossibleFaceFeatureSet( new FeatureSetDual(
      FeatureSet.empty( patternBoard ),
      new Set<TPatternFace>(),
      new Set<TPatternEdge>()
    ), leafCallback, 0, 0 );

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

    const embeddedPreviousRules = previousRules.flatMap( rule => rule.getEmbeddedRules( embeddings ) );

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