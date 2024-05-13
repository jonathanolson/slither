import { TPatternBoard } from './TPatternBoard.ts';
import { serializePatternBoard } from './serializePatternBoard.ts';
import { compressByteArray, decompressByteArray } from '../../util/compression.ts';
import { deserializePatternBoard } from './deserializePatternBoard.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { PatternRule } from './PatternRule.ts';
import _ from '../../workarounds/_.ts';
import { PatternBoardRuleSet } from './PatternBoardRuleSet.ts';
import { getEmbeddings } from './getEmbeddings.ts';

export class BinaryRuleCollection {

  public readonly ruleIndices: number[] = [];

  public constructor(
    public readonly patternBoards: TPatternBoard[],
    public readonly data: Uint8Array,
    public readonly highlander: boolean,
  ) {
    let index = 0;
    while ( index < data.length ) {
      this.ruleIndices.push( index );

      let patternEndCount = 0;
      while ( patternEndCount < 2 ) {
        assertEnabled() && assert( index < data.length, 'Unexpected end of data' );

        if ( data[ index++ ] === 0xff ) {
          patternEndCount++;
        }
      }
    }
  }

  public getRules(): PatternRule[] {
    const rules: PatternRule[] = [];

    this.forEachRule( rule => rules.push( rule ) );

    return rules;
  }

  public get size(): number {
    return this.ruleIndices.length;
  }

  public getRule( index: number ): PatternRule {
    return PatternRule.fromBinary( this.patternBoards, this.data, this.ruleIndices[ index ], this.highlander ).rule;
  }

  public forEachRule( callback: ( rule: PatternRule ) => void ): void {
    for ( let i = 0; i < this.ruleIndices.length; i++ ) {
      callback( this.getRule( i ) );
    }
  }

  public withPatternBoardFilter( patternBoardFilter: ( patternBoard: TPatternBoard ) => boolean ): BinaryRuleCollection {
    const includedMap = this.patternBoards.map( patternBoardFilter );
    const filteredPatternBoards = this.patternBoards.filter( ( _, i ) => includedMap[ i ] );

    const bytes: number[] = [];

    for ( let i = 0; i < this.ruleIndices.length; i++ ) {
      const startIndex = this.ruleIndices[ i ];
      const patternBoardIndex = this.data[ startIndex ];

      if ( includedMap[ patternBoardIndex ] ) {
        const endIndex = i + 1 < this.ruleIndices.length ? this.ruleIndices[ i + 1 ] : this.data.length;
        bytes.push( ...this.data.slice( startIndex, endIndex ) );
      }
    }

    return new BinaryRuleCollection( filteredPatternBoards, new Uint8Array( bytes ), this.highlander );
  }

  public withRules( rules: PatternRule[] ): BinaryRuleCollection {
    const isHighlander = this.highlander || rules.some( rule => rule.highlander );
    const patternBoards = _.uniq( [
      ...this.patternBoards,
      ...rules.map( rule => rule.patternBoard ),
    ] );

    const bytes: number[] = [
      ...this.data
    ];

    for ( const rule of rules ) {
      bytes.push( ...rule.getBinary( patternBoards ) );
    }

    return new BinaryRuleCollection( patternBoards, new Uint8Array( bytes ), isHighlander );
  }

  public withNonredundantRuleSet( ruleSet: PatternBoardRuleSet, maxScore = Number.POSITIVE_INFINITY ): BinaryRuleCollection {
    const currentEmbeddedRules = this.getRules().flatMap( currentRule => currentRule.getEmbeddedRules( getEmbeddings( currentRule.patternBoard, ruleSet.patternBoard ) ) );

    let totalScoreSum = 0;
    let count = 0;
    let skipCount = 0;
    let maxEncounteredScore = 0;

    const addedRules: PatternRule[] = [];

    for ( const rule of ruleSet.rules ) {
      const score = rule.getInputDifficultyScoreA();

      maxEncounteredScore = Math.max( maxEncounteredScore, score );

      if ( ruleSet.patternBoard.faces.length > 1 && score > maxScore ) {
        skipCount++;
        continue;
      }

      if ( !rule.isRedundant( currentEmbeddedRules ) ) {
        addedRules.push( rule );

        totalScoreSum += score;
        count++;

        currentEmbeddedRules.push( ...rule.getEmbeddedRules( getEmbeddings( rule.patternBoard, ruleSet.patternBoard ) ) );
      }
    }

    console.log( `added ${count}, skipped ${skipCount} with average score ${Math.round( totalScoreSum / count )}, maxEncounteredScore ${maxEncounteredScore}` );

    return this.withRules( addedRules );
  }

  public withCollection( ruleCollection: BinaryRuleCollection ): BinaryRuleCollection {
    const theirRules = ruleCollection.getRules();

    let lastPatternBoard: TPatternBoard | null = null;
    let embeddedRules: PatternRule[] = [];

    const addedRules: PatternRule[] = [];

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
        addedRules.push( rule );
        embeddedRules.push( ...rule.getEmbeddedRules( getEmbeddings( rule.patternBoard, targetPatternBoard ) ) );
      }
    }

    return this.withRules( addedRules );
  }

  public serialize(): SerializedBinaryRuleCollection {
    return {
      patternBoards: this.patternBoards.map( serializePatternBoard ),
      rules: compressByteArray( this.data ),
      highlander: this.highlander,
    };
  }

  public static deserialize( serialized: SerializedBinaryRuleCollection ): BinaryRuleCollection {
    const decompressed = decompressByteArray( serialized.rules );
    if ( !decompressed ) {
      throw new Error( 'Failed to decompress rules!' );
    }

    return new BinaryRuleCollection(
      serialized.patternBoards.map( deserializePatternBoard ),
      decompressed,
      serialized.highlander,
    );
  }

  public static empty(): BinaryRuleCollection {
    return new BinaryRuleCollection( [], new Uint8Array( 0 ), false );
  }

  public static fromRules( rules: PatternRule[] ): BinaryRuleCollection {
    const isHighlander = rules.some( rule => rule.highlander );
    const patternBoards = _.uniq( rules.map( rule => rule.patternBoard ) );

    const bytes: number[] = [];

    for ( const rule of rules ) {
      bytes.push( ...rule.getBinary( patternBoards ) );
    }

    return new BinaryRuleCollection( patternBoards, new Uint8Array( bytes ), isHighlander );
  }
}

export type SerializedBinaryRuleCollection = {
  patternBoards: string[]; // serializePatternBoard / deserializePatternBoard, hopefully the board name often
  rules: string; // base64? compressed?
  highlander: boolean;
};
