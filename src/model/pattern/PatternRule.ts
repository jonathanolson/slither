import { FeatureSet, TSerializedFeatureSet } from './feature/FeatureSet.ts';
import { Embedding } from './Embedding.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { getEmbeddings } from './getEmbeddings.ts';
import PatternRuleMatchState from './PatternRuleMatchState.ts';
import FeatureCompatibility from './feature/FeatureCompatibility.ts';
import { TPatternBoard } from './TPatternBoard.ts';
import { serializePatternBoard } from './serializePatternBoard.ts';
import { deserializePatternBoard } from './deserializePatternBoard.ts';
import { PatternBoardSolver } from './PatternBoardSolver.ts';

export type SerializedPatternRule = {
  patternBoard: string;
  highlander?: true;
  input: TSerializedFeatureSet;
  output: TSerializedFeatureSet;
};

export type CollectionSerializedPatternRule = {
  patternBoard: number;
  highlander?: true;
  input: TSerializedFeatureSet;
  output: TSerializedFeatureSet;
};

export class PatternRule {
  public constructor(
    public readonly patternBoard: TPatternBoard,
    public readonly inputFeatureSet: FeatureSet,
    public readonly outputFeatureSet: FeatureSet,
    public readonly highlander: boolean = false
  ) {}

  public getInputDifficultyScoreA(): number {
    return this.inputFeatureSet.getInputDifficultyScoreA() + 0.75 * this.patternBoard.vertices.length;
  }

  // TODO: now that we have input/output targets, the patternBoard here is redundant
  public embedded( patternBoard: TPatternBoard, embedding: Embedding ): PatternRule | null {
    const inputFeatureSet = this.inputFeatureSet.embedded( patternBoard, embedding );
    if ( inputFeatureSet === null ) {
      return null;
    }

    const outputFeatureSet = this.outputFeatureSet.embedded( patternBoard, embedding )!;
    if ( outputFeatureSet === null ) {
      return null;
    }

    return new PatternRule( patternBoard, inputFeatureSet, outputFeatureSet, this.highlander );
  }

  public getEmbeddedRules( embeddings: Embedding[] ): PatternRule[] {
    // TODO: integrate the description, then remove the cast!
    return embeddings.map( embedding => this.embedded( embedding.targetPatternBoard as TPatternBoard, embedding ) ).filter( rule => rule !== null ) as PatternRule[];
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

    // For redundancy, we know that rules that are INCONSISTENT with our "output" will never be applied
    const featureSet = this.outputFeatureSet;
    const filteredEmbeddedRules = embeddedRules.filter( rule => {
      return rule.outputFeatureSet.isSubsetOf( featureSet );
    } );

    return this.outputFeatureSet.isSubsetOf( PatternRule.withRulesApplied( this.patternBoard, this.inputFeatureSet, filteredEmbeddedRules ) );
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

  public isCorrectSlow(): boolean {
    const inputSolutionsCount = PatternBoardSolver.countSolutions( this.patternBoard, this.inputFeatureSet.getFeaturesArray() );
    const outputSolutionsCount = PatternBoardSolver.countSolutions( this.patternBoard, this.outputFeatureSet.getFeaturesArray() );

    return inputSolutionsCount === outputSolutionsCount;
  }

  public toCanonicalString(): string {
    return `rule:${this.inputFeatureSet.toCanonicalString()}->${this.outputFeatureSet.toCanonicalString()}`;
  }

  public serialize(): SerializedPatternRule {
    const result: SerializedPatternRule = {
      patternBoard: serializePatternBoard( this.patternBoard ),
      input: this.inputFeatureSet.serialize(),
      output: this.outputFeatureSet.serialize()
    };

    if ( this.highlander ) {
      result.highlander = true;
    }

    return result;
  }

  public collectionSerialize( patternBoardNumber: number ): CollectionSerializedPatternRule {
    const serialized = this.serialize();

    return {
      ...serialized,
      patternBoard: patternBoardNumber
    };
  }

  public static deserialize( serialized: SerializedPatternRule ): PatternRule {
    const patternBoard = deserializePatternBoard( serialized.patternBoard );

    return new PatternRule(
      patternBoard,
      FeatureSet.deserialize( serialized.input, patternBoard ),
      FeatureSet.deserialize( serialized.output, patternBoard ),
      serialized.highlander ?? false
    );
  }

  public static collectionDeserialize( patternBoards: TPatternBoard[], serialized: CollectionSerializedPatternRule ): PatternRule {
    const patternBoard = patternBoards[ serialized.patternBoard ];
    assertEnabled() && assert( patternBoard, 'pattern board' );

    return new PatternRule(
      patternBoard,
      FeatureSet.deserialize( serialized.input, patternBoard ),
      FeatureSet.deserialize( serialized.output, patternBoard ),
      serialized.highlander ?? false
    );
  }

  public static withRulesApplied( patternBoard: TPatternBoard, initialFeatureSet: FeatureSet, embeddedRules: PatternRule[] ): FeatureSet {
    assertEnabled() && assert( embeddedRules.every( otherRule => otherRule.patternBoard === patternBoard ), 'embedding check' );

    let currentRuleList = embeddedRules;
    let nextRuleList: PatternRule[] = [];
    const featureState = initialFeatureSet.clone();

    let changed = true;

    // TODO: try to prune things based on whether a rule's "input set" of edges/faces has changed since it was last evaluated?
    // TODO: how to get that computation to be LESS than what we have now?

    // console.log( 'withRulesApplied', initialFeatureSet.toCanonicalString(), JSON.stringify( initialFeatureSet.serialize() ) );

    while ( changed ) {
      changed = false;

      for ( const rule of currentRuleList ) {

        const matchState = rule.getMatchState( featureState );

        if ( matchState === PatternRuleMatchState.ACTIONABLE ) {

          // console.log( 'applying', rule.inputFeatureSet.toCanonicalString(), JSON.stringify( rule.inputFeatureSet.serialize() ) );

          rule.apply( featureState );

          // console.log( 'after', featureState.toCanonicalString(), JSON.stringify( featureState.serialize() ) );

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
}

