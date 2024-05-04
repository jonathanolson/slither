import { CollectionSerializedPatternRule, PatternRule } from './PatternRule.ts';
import { TPatternBoard } from './TPatternBoard.ts';
import { deserializePatternBoard } from './deserializePatternBoard.ts';
import { serializePatternBoard } from './serializePatternBoard.ts';
import { compressString2, decompressString2 } from '../../util/compression.ts';
import _ from '../../workarounds/_.ts';
import { getEmbeddings } from './getEmbeddings.ts';
import { PatternBoardRuleSet } from './PatternBoardRuleSet.ts';

/**
 * Exists to have a memory/disk friendly way of storing a collection of rules.
 */
export class PatternRuleCollection {
  private constructor(
    private readonly patternBoards: TPatternBoard[],
    private readonly serializedRules: CollectionSerializedPatternRule[],
  ) {
  }

  public getRules(): PatternRule[] {
    const rules: PatternRule[] = [];

    this.forEachRule( rule => rules.push( rule ) );

    return rules;
  }

  public forEachRule( callback: ( rule: PatternRule ) => void ): void {
    for ( let i = 0; i < this.serializedRules.length; i++ ) {
      const rule = PatternRule.collectionDeserialize( this.patternBoards, this.serializedRules[ i ] );
      callback( rule );
    }
  }

  public addRule( rule: PatternRule ): void {
    if ( !this.patternBoards.includes( rule.patternBoard ) ) {
      this.patternBoards.push( rule.patternBoard );
    }
    this.serializedRules.push( rule.collectionSerialize( this.patternBoards.indexOf( rule.patternBoard ) ) );
  }

  public addNonredundantRuleSet( ruleSet: PatternBoardRuleSet, maxScore = Number.POSITIVE_INFINITY ): void {
    const currentEmbeddedRules = this.getRules().flatMap( currentRule => currentRule.getEmbeddedRules( getEmbeddings( currentRule.patternBoard, ruleSet.patternBoard ) ) );

    let totalScoreSum = 0;
    let count = 0;
    let skipCount = 0;
    let maxEncounteredScore = 0;

    for ( const rule of ruleSet.rules ) {
      const score = rule.getInputDifficultyScoreA();

      maxEncounteredScore = Math.max( maxEncounteredScore, score );

      if ( ruleSet.patternBoard.faces.length > 1 && score > maxScore ) {
        skipCount++;
        continue;
      }

      if ( !rule.isRedundant( currentEmbeddedRules ) ) {
        this.addRule( rule );

        totalScoreSum += score;
        count++;

        currentEmbeddedRules.push( ...rule.getEmbeddedRules( getEmbeddings( rule.patternBoard, ruleSet.patternBoard ) ) );
      }
    }

    console.log( `added ${count}, skipped ${skipCount} with average score ${Math.round( totalScoreSum / count )}, maxEncounteredScore ${maxEncounteredScore}` );
  }

  public combineWith( ruleCollection: PatternRuleCollection ): void {
    const theirRules = ruleCollection.getRules();

    let lastPatternBoard: TPatternBoard | null = null;
    let embeddedRules: PatternRule[] = [];

    for ( let i = 0; i < theirRules.length; i++ ) {
      if ( i % 100 === 0 ) {
        console.log( i, theirRules.length );
      }
      const rule = theirRules[ i ];

      const targetPatternBoard = rule.patternBoard;

      if ( targetPatternBoard !== lastPatternBoard ) {
        embeddedRules = this.getRules().flatMap( currentRule => currentRule.getEmbeddedRules( getEmbeddings( currentRule.patternBoard, targetPatternBoard ) ) );
        lastPatternBoard = targetPatternBoard;
      }

      if ( !rule.isRedundant( embeddedRules ) ) {
        this.addRule( rule );
        embeddedRules.push( ...rule.getEmbeddedRules( getEmbeddings( rule.patternBoard, targetPatternBoard ) ) );
      }
    }
  }

  public serialize(): SerializedPatternRuleCollection {
    return {
      patternBoards: this.patternBoards.map( serializePatternBoard ),
      rules: compressString2( JSON.stringify( this.serializedRules ) )
    };
  }

  public static deserialize( serialized: SerializedPatternRuleCollection ): PatternRuleCollection {
    const patternBoards = serialized.patternBoards.map( deserializePatternBoard );
    const decompressed = decompressString2( serialized.rules );
    if ( decompressed === null ) {
      console.log( serialized.rules );
      throw new Error( 'Failed to decompress rules!' );
    }
    else {
      const serializedRules = JSON.parse( decompressed );

      return new PatternRuleCollection( patternBoards, serializedRules );
    }
  }

  public static fromRules( rules: PatternRule[] ): PatternRuleCollection {
    const patternBoards = _.uniq( rules.map( rule => rule.patternBoard ) );
    const serializedRules = rules.map( rule => rule.collectionSerialize( patternBoards.indexOf( rule.patternBoard ) ) );

    return new PatternRuleCollection( patternBoards, serializedRules );
  }
}

export type SerializedPatternRuleCollection = {
  patternBoards: string[]; // serializePatternBoard / deserializePatternBoard, hopefully the board name often
  rules: string;
};
