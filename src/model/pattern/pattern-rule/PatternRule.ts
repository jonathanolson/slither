import { FeatureSet, TSerializedFeatureSet } from '../feature/FeatureSet.ts';
import { Embedding } from '../embedding/Embedding.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { getEmbeddings } from '../embedding/getEmbeddings.ts';
import PatternRuleMatchState from '../PatternRuleMatchState.ts';
import FeatureCompatibility from '../feature/FeatureCompatibility.ts';
import { TPatternBoard } from '../pattern-board/TPatternBoard.ts';
import { serializePatternBoard } from '../pattern-board/serializePatternBoard.ts';
import { deserializePatternBoard } from '../pattern-board/deserializePatternBoard.ts';
import { PatternBoardSolver } from '../solve/PatternBoardSolver.ts';
import { getBinaryFeatureMapping } from '../BinaryFeatureMapping.ts';
import { TEmbeddableFeature } from '../feature/TEmbeddableFeature.ts';
import { FaceColorDualFeature } from '../feature/FaceColorDualFeature.ts';
import { TPatternFace } from '../pattern-board/TPatternFace.ts';

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

  public equals( other: PatternRule ): boolean {
    return this.patternBoard === other.patternBoard && this.inputFeatureSet.equals( other.inputFeatureSet ) && this.outputFeatureSet.equals( other.outputFeatureSet ) && this.highlander === other.highlander;
  }

  public getBinaryIdentifier(): string {
    const patternBoardName = this.patternBoard.name;

    if ( !patternBoardName ) {
      throw new Error( 'Pattern board must have a name' );
    }

    const binaryData = this.getBinary( [ this.patternBoard ] ).slice( 1 );
    const binaryString = btoa( String.fromCharCode.apply( null, [ this.highlander ? 1 : 0, ...binaryData ] ) );

    const binaryIdentifier = `${patternBoardName}/${binaryString}`;

    if ( assertEnabled() ) {
      const rule = PatternRule.fromBinaryIdentifier( binaryIdentifier );
      assert( rule.equals( this ), 'round-trip equality' );
    }

    return binaryIdentifier;
  }

  public static fromBinaryIdentifier( identifier: string ): PatternRule {
    const slashIndex = identifier.indexOf( '/' );
    const patternBoardName = identifier.slice( 0, slashIndex );
    const binaryString = identifier.slice( slashIndex + 1 );
    const binaryData = atob( binaryString ).split( '' ).map( c => c.charCodeAt( 0 ) );

    const patternBoard = deserializePatternBoard( patternBoardName );

    // TODO: include highlander in binary...>?
    return PatternRule.fromBinary( [ patternBoard ], [ 0, ...binaryData.slice( 1 ) ], 0, binaryData[ 0 ] !== 0 );
  }

  public getBinary( patternBoards: TPatternBoard[] ): number[] {
    const bytes: number[] = [];

    // TODO: how to note that it is a highlander rule? do we want to store that? Just rely on knowing which collection it is from?

    const patternBoardIndex = patternBoards.indexOf( this.patternBoard );
    assertEnabled() && assert( patternBoardIndex !== -1 && patternBoardIndex < 256, 'pattern board index' );
    bytes.push( patternBoardIndex );

    const binaryMapping = getBinaryFeatureMapping( this.patternBoard );

    const inputFeatures = this.inputFeatureSet.getFeaturesArray();

    // TODO: better deduplication in the future
    const outputOnlyFeatures = this.outputFeatureSet.getFeaturesArray().filter( feature => !inputFeatures.some( f => f.equals( feature ) ) );

    const addFeatures = ( features: TEmbeddableFeature[] ) => {
      const mappedFeatures = features.filter( feature => !( feature instanceof FaceColorDualFeature ) );
      const faceColorDualFeatures = features.filter( feature => feature instanceof FaceColorDualFeature ) as FaceColorDualFeature[];

      for ( const feature of mappedFeatures ) {
        const index = binaryMapping.featureArray.findIndex( f => f.equals( feature ) );
        assertEnabled() && assert( index !== -1, 'feature index' );
        bytes.push( index );
      }

      for ( const feature of faceColorDualFeatures ) {
        bytes.push( 0xfe );

        for ( const face of feature.primaryFaces ) {
          assertEnabled() && assert( face.index < 126, 'need room to disambiguate from 0xff/0xfe once high bit is set' );
          bytes.push( face.index );
        }

        for ( const face of feature.secondaryFaces ) {
          assertEnabled() && assert( face.index < 126, 'need room to disambiguate from 0xff/0xfe once high bit is set' );
          bytes.push( face.index | 0x80 );
        }
      }
    };

    addFeatures( inputFeatures );
    bytes.push( 0xff );
    addFeatures( outputOnlyFeatures );
    bytes.push( 0xff );

    if ( assertEnabled() ) {
      const array = new Uint8Array( bytes );
      const rule = PatternRule.fromBinary( patternBoards, array, 0, this.highlander );
      assert( rule.equals( this ), 'round-trip equality' );
    }

    return bytes;
  }

  public static fromBinary( patternBoards: TPatternBoard[], data: Uint8Array | number[], byteIndex: number, highlander: boolean ): PatternRule {
    const patternBoardIndex = data[ byteIndex++ ];
    const patternBoard = patternBoards[ patternBoardIndex ];
    assertEnabled() && assert( patternBoard, 'pattern board' );

    const binaryMapping = getBinaryFeatureMapping( patternBoard );

    const readFeatures = (): FeatureSet => {
      const featureSet = FeatureSet.empty( patternBoard );

      while ( true ) {
        const firstByte = data[ byteIndex++ ];

        if ( firstByte === 0xff ) {
          return featureSet;
        }
        else if ( firstByte === 0xfe ) {
          const primaryFaces: TPatternFace[] = [];
          const secondaryFaces: TPatternFace[] = [];

          while ( true ) {
            const nextByte = data[ byteIndex++ ];

            // Rewind if the next byte is a control signal (the only way we exit the face color dual section)
            if ( nextByte === 0xff || nextByte === 0xfe ) {
              byteIndex--;
              break;
            }

            if ( nextByte & 0x80 ) {
              secondaryFaces.push( patternBoard.faces[ nextByte & 0x7f ] );
            }
            else {
              primaryFaces.push( patternBoard.faces[ nextByte ] );
            }
          }

          featureSet.addFeature( FaceColorDualFeature.fromPrimarySecondaryFaces( primaryFaces, secondaryFaces ) );
        }
        else {
          // binary mapped feature
          featureSet.addFeature( binaryMapping.featureArray[ firstByte ] );
        }
      }
    };

    const inputFeatureSet = readFeatures();
    const outputFeatureSet = readFeatures().union( inputFeatureSet )!;
    assertEnabled() && assert( outputFeatureSet );

    return new PatternRule( patternBoard, inputFeatureSet, outputFeatureSet, highlander );
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

