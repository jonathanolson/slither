import { BasicSolveOptions, FeatureSet } from './feature/FeatureSet.ts';
import { TDescribedPatternBoard } from './TDescribedPatternBoard.ts';
import { Embedding } from './Embedding.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { getEmbeddings } from './getEmbeddings.ts';
import PatternRuleMatchState from './PatternRuleMatchState.ts';
import FeatureCompatibility from './feature/FeatureCompatibility.ts';
import { TPatternBoard } from './TPatternBoard.ts';
import { optionize3 } from 'phet-lib/phet-core';

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

    // callback returns whether it is successful (and we should explore the subtree)
    const forEachPossibleEdgeFeatureSet = ( initialFeatureSet: FeatureSet, callback: ( featureSet: FeatureSet, numFeatures: number ) => boolean ): void => {
      const edges = patternBoard.edges;
      const edgeFeatureStack = [ initialFeatureSet ];

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

      const edgeRecur = ( index: number, numFeatures: number ): void => {

        const previousFeatureSet = edgeFeatureStack[ edgeFeatureStack.length - 1 ];
        if ( numFeatures <= options.featureLimit ) {
          callback( previousFeatureSet, numFeatures );
        }
        if ( numFeatures === options.featureLimit || index === edges.length ) {
          return;
        }

        addToShapeMap( previousFeatureSet );

        if ( index < 4 ) {
          console.log( index, 'black' );
        }

        const blackFeatureSet = previousFeatureSet.clone();
        blackFeatureSet.addBlackEdge( edges[ index ] );

        // FOR NOW:
        assertEnabled() && assert( blackFeatureSet.size === previousFeatureSet.size + 1 );

        if ( !isIsomorphicToVisited( blackFeatureSet ) ) {
          if ( blackFeatureSet.hasSolution( options?.highlander ) ) {
            edgeFeatureStack.push( blackFeatureSet );
            edgeRecur( index + 1, numFeatures );
            edgeFeatureStack.pop();
          }
        }

        if ( index < 4 ) {
          console.log( index, 'red' );
        }

        const redFeatureSet = previousFeatureSet.clone();
        redFeatureSet.addRedEdge( edges[ index ] );

        // FOR NOW:
        assertEnabled() && assert( blackFeatureSet.size === previousFeatureSet.size + 1 );

        if ( !isIsomorphicToVisited( redFeatureSet ) ) {
          if ( redFeatureSet.hasSolution( options?.highlander ) ) {
            edgeFeatureStack.push( redFeatureSet );
            edgeRecur( index + 1, numFeatures );
            edgeFeatureStack.pop();
          }
        }
      };
      edgeRecur( 0, 0 );
    };

    const rules: PatternRule[] = [];
    let count = 0;

    forEachPossibleEdgeFeatureSet( FeatureSet.empty( patternBoard ), featureSet => {
      count++;
      if ( count % 10 === 0 ) {
        console.log( count );
      }
      const rule = PatternRule.getBasicRule( patternBoard, featureSet, options );
      if ( rule && !rule.isTrivial() ) {
        rules.push( rule );
      }
      return !!rule;
    } );

    return rules;
  }
}

// TODO: OMG, if we have an isomorphic option... we can bail that entire sub-tree no?
type GetRulesSelfOptions = {
  featureLimit?: number; // counts 1 for edge or face, n-1 for each face color duals (e.g. how many linked faces)
};

export type GetRulesOptions = BasicSolveOptions & GetRulesSelfOptions;

export const GET_RULES_DEFAULTS = {
  featureLimit: Number.POSITIVE_INFINITY
} as const;