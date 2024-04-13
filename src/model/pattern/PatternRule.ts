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

export class PatternRule {
  public constructor(
    public readonly patternBoard: TDescribedPatternBoard,
    public readonly inputFeatureSet: FeatureSet,
    public readonly outputFeatureSet: FeatureSet
  ) {}

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

    const visitedShapeMap = new Map<string, FeatureSet[]>();

    const addToShapeMap = ( featureSet: FeatureSet ): void => {
      const key = featureSet.getShapeString();
      let featuresWithShape = visitedShapeMap.get( key );
      if ( featuresWithShape ) {
        featuresWithShape.push( featureSet );
      }
      else {
        visitedShapeMap.set( key, [ featureSet ] );
      }
    };

    const isIsomorphicToVisited = ( featureSet: FeatureSet ): boolean => {
      const key = featureSet.getShapeString();
      const featuresWithShape = visitedShapeMap.get( key );
      if ( featuresWithShape ) {
        return featuresWithShape.some( otherFeatureSet => featureSet.isIsomorphicTo( otherFeatureSet ) );
      }
      else {
        return false;
      }
    };

    const allowRecur = ( featureSet: FeatureSet ): boolean => {
      // TODO: remove the hasSolution(!), we're overdoing this
      return !isIsomorphicToVisited( featureSet ) && featureSet.hasSolution( options?.highlander );
    };

    const forEachPossibleFaceFeatureSet = (
      initialFeatureSet: FeatureSet,
      callback: ( featureSet: FeatureSet, numFeatures: number, numEvaluatedFeatures: number ) => boolean,
      numInitialFeatures: number,
      numInitialEvaluatedFeatures: number
    ): boolean => {
      const faces = patternBoard.faces.filter( face => !face.isExit );
      const faceFeatureStack = [ initialFeatureSet ];

      const faceRecur = ( index: number, numFeatures: number, numEvaluatedFeatures: number ): boolean => {

        if ( index === faces.length ) {
          return true;
        }

        const previousFeatureSet = faceFeatureStack[ faceFeatureStack.length - 1 ];
        if ( numFeatures <= options.featureLimit ) {
          console.log( `${_.repeat( '  ', numEvaluatedFeatures )}skip face ${index}` );
          const success = faceRecur( index + 1, numFeatures, numEvaluatedFeatures + 1 );
          if ( !success ) {
            return false;
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
          console.log( `${_.repeat( '  ', numEvaluatedFeatures )}face ${index} value ${value}` );
          const faceFeatureSet = previousFeatureSet.clone();
          faceFeatureSet.addFaceValue( face, value );

          // FOR NOW
          assertEnabled() && assert( faceFeatureSet.size === previousFeatureSet.size + 1 );

          // TODO: reduce the DOUBLE-LOGIC_SOLVER here
          if ( allowRecur( faceFeatureSet ) ) {
            addToShapeMap( faceFeatureSet );

            const success = callback( faceFeatureSet, numFeatures + 1, numInitialEvaluatedFeatures + 1 );

            if ( success ) {
              console.log( ` ${_.repeat( '  ', numEvaluatedFeatures )}exploring` );
              faceFeatureStack.push( faceFeatureSet );
              faceRecur( index + 1, numFeatures + 1, numEvaluatedFeatures + 1 );
              faceFeatureStack.pop();
            }
          }
        }

        return true;
      };
      console.log( `${_.repeat( '  ', numInitialEvaluatedFeatures )}skip all faces` );
      const rootSuccess = callback( initialFeatureSet, numInitialFeatures, numInitialEvaluatedFeatures + 1 );
      if ( !rootSuccess ) {
        return false;
      }
      return faceRecur( 0, numInitialFeatures, numInitialEvaluatedFeatures );
    };

    // callback returns whether it is successful (and we should explore the subtree)
    const forEachPossibleEdgeFeatureSet = (
      initialFeatureSet: FeatureSet,
      callback: ( featureSet: FeatureSet, numFeatures: number, numEvaluatedFeatures: number ) => boolean,
      numInitialFeatures: number,
      numInitialEvaluatedFeatures: number
    ): boolean => {
      const edges = patternBoard.edges;
      const edgeFeatureStack = [ initialFeatureSet ];

      const edgeRecur = ( index: number, numFeatures: number, numEvaluatedFeatures: number ): boolean => {

        if ( index === edges.length ) {
          return true;
        }

        const previousFeatureSet = edgeFeatureStack[ edgeFeatureStack.length - 1 ];
        if ( numFeatures <= options.featureLimit ) {
          console.log( `${_.repeat( '  ', numEvaluatedFeatures )}skip edge ${index}` );
          const success = edgeRecur( index + 1, numFeatures, numEvaluatedFeatures + 1 );
          if ( !success ) {
            return false;
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
            const blackFeatureSet = previousFeatureSet.clone();
            blackFeatureSet.addBlackEdge( edges[ index ] );

            // FOR NOW:
            assertEnabled() && assert( blackFeatureSet.size === previousFeatureSet.size + 1 );

            console.log( `${_.repeat( '  ', numEvaluatedFeatures )}black ${index}` );
            if ( allowRecur( blackFeatureSet ) ) {
              addToShapeMap( blackFeatureSet );

              const success = callback( blackFeatureSet, numFeatures + 1, numEvaluatedFeatures + 1 );

              if ( success ) {
                console.log( ` ${_.repeat( '  ', numEvaluatedFeatures )}exploring` );
                edgeFeatureStack.push( blackFeatureSet );
                edgeRecur( index + 1, numFeatures + 1, numEvaluatedFeatures + 1 );
                edgeFeatureStack.pop();
              }
            }
          }
        }

        // Red edge
        {
          const redFeatureSet = previousFeatureSet.clone();
          redFeatureSet.addRedEdge( edges[ index ] );

          // FOR NOW:
          assertEnabled() && assert( redFeatureSet.size === previousFeatureSet.size + 1 );

          console.log( `${_.repeat( '  ', numEvaluatedFeatures )}red ${index}` );
          if ( allowRecur( redFeatureSet ) ) {
            addToShapeMap( redFeatureSet );

            const success = callback( redFeatureSet, numFeatures + 1, numEvaluatedFeatures + 1 );

            if ( success ) {
              console.log( ` ${_.repeat( '  ', numEvaluatedFeatures )}exploring` );
              edgeFeatureStack.push( redFeatureSet );
              edgeRecur( index + 1, numFeatures + 1, numEvaluatedFeatures + 1 );
              edgeFeatureStack.pop();
            }
          }
        }

        return true;
      };
      console.log( `${_.repeat( '  ', numInitialEvaluatedFeatures )}skip all edges` );
      const rootSuccess = callback( initialFeatureSet, numInitialFeatures, numInitialEvaluatedFeatures + 1 );
      if ( !rootSuccess ) {
        return false;
      }
      return edgeRecur( 0, numInitialFeatures, numInitialEvaluatedFeatures );
    };

    const rules: PatternRule[] = [];
    let count = 0;

    let leafCallback = ( featureSet: FeatureSet, numFeatures: number, numEvaluatedFeatures: number ) => {
      count++;
      if ( count % 10 === 0 ) {
        console.log( count );
      }
      const rule = PatternRule.getBasicRule( patternBoard, featureSet, options );
      console.log( `${_.repeat( '  ', numEvaluatedFeatures )}${rule ? `GOOD ${rule.isTrivial() ? '(trivial)' : '(actionable)'}` : 'BAD'} ${featureSet.toCanonicalString()}${rule ? ` => ${rule.outputFeatureSet.toCanonicalString()}` : ''}` );
      if ( rule && !rule.isTrivial() ) {
        rules.push( rule );
      }
      return !!rule;
    };

    if ( options.solveEdges ) {
      const originalCallback = leafCallback;

      leafCallback = ( featureSet, numFeatures, numEvaluatedFeatures ) => {
        return forEachPossibleEdgeFeatureSet( featureSet, originalCallback, numFeatures, numEvaluatedFeatures );
      };
    }

    forEachPossibleFaceFeatureSet( FeatureSet.empty( patternBoard ), leafCallback, 0, 0 );

    return rules;
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