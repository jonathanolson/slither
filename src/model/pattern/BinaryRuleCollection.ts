import { TPatternBoard } from './TPatternBoard.ts';
import { serializePatternBoard } from './serializePatternBoard.ts';
import { compressByteArray, decompressByteArray } from '../../util/compression.ts';
import { deserializePatternBoard } from './deserializePatternBoard.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { PatternRule } from './PatternRule.ts';
import _ from '../../workarounds/_.ts';

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
