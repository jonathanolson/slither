import { CollectionSerializedPatternRule, PatternRule } from './PatternRule.ts';
import { TPatternBoard } from './TPatternBoard.ts';
import { deserializePatternBoard } from './deserializePatternBoard.ts';
import { serializePatternBoard } from './serializePatternBoard.ts';
import { compressString, decompressString } from '../../util/compression.ts';
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
  ) {}

  public addRule( rule: PatternRule ): void {
    if ( !this.patternBoards.includes( rule.patternBoard ) ) {
      this.patternBoards.push( rule.patternBoard );
    }
    this.serializedRules.push( rule.collectionSerialize( this.patternBoards.indexOf( rule.patternBoard ) ) );
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

  public addNonredundantRuleSet( ruleSet: PatternBoardRuleSet ): void {
    const currentEmbeddedRules = this.getRules().flatMap( currentRule => currentRule.getEmbeddedRules( getEmbeddings( currentRule.patternBoard, ruleSet.patternBoard ) ) );

    for ( const rule of ruleSet.rules ) {
      if ( !rule.isRedundant( currentEmbeddedRules ) ) {
        this.addRule( rule );

        currentEmbeddedRules.push( ...rule.getEmbeddedRules( getEmbeddings( rule.patternBoard, ruleSet.patternBoard ) ) );
      }
    }
  }

  public serialize(): SerializedPatternRuleCollection {
    return {
      patternBoards: this.patternBoards.map( serializePatternBoard ),
      rules: compressString( JSON.stringify( this.serializedRules ) )
    };
  }

  public static deserialize( serialized: SerializedPatternRuleCollection ): PatternRuleCollection {
    const patternBoards = serialized.patternBoards.map( deserializePatternBoard );
    const serializedRules = JSON.parse( decompressString( serialized.rules )! );

    return new PatternRuleCollection( patternBoards, serializedRules );
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
