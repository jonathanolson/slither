import { BinaryRuleCollection, SerializedBinaryRuleCollection } from './BinaryRuleCollection.ts';
import { PatternRule } from '../pattern-rule/PatternRule.ts';
import { compressByteArray, decompressByteArray } from '../../../util/compression.ts';
import _ from '../../../workarounds/_.ts';
import { TPatternBoard } from '../pattern-board/TPatternBoard.ts';

export class BinaryMixedRuleGroup {
  private constructor(
    public readonly collection: BinaryRuleCollection,

    // "highlander" bits"
    private readonly mixedData: Uint8Array,
  ) {}

  public get size(): number {
    return this.collection.size;
  }

  public getRule( ruleIndex: number ): PatternRule {
    return this.collection.getRule( ruleIndex, this.isRuleIndexHighlander( ruleIndex ) );
  }

  public isRuleIndexHighlander( index: number ): boolean {
    return ( this.mixedData[ Math.floor( index / 8 ) ] & ( 1 << ( index % 8 ) ) ) !== 0;
  }

  public withOnlyHighlander(): BinaryMixedRuleGroup {
    return this.filterIndex( ruleIndex => this.isRuleIndexHighlander( ruleIndex ) );
  }

  public withoutHighlander(): BinaryMixedRuleGroup {
    return this.filterIndex( ruleIndex => !this.isRuleIndexHighlander( ruleIndex ) );
  }

  public withPatternBoardFilter( patternBoardFilter: ( patternBoard: TPatternBoard ) => boolean ): BinaryMixedRuleGroup {
    // TODO: can optimize further, no need to un-binary-ify
    return this.filterIndex( ruleIndex => patternBoardFilter( this.getRule( ruleIndex ).patternBoard ) );
  }

  public withRuleIndices( ruleIndices: number[] ): BinaryMixedRuleGroup {
    const collection = BinaryRuleCollection.empty();
    const mixedData = new Uint8Array( this.mixedData.length );

    let index = 0;
    const addRule = ( patternBoard: TPatternBoard, bytesSuffix: number[], isHighlander: boolean ) => {
      collection.addRuleSuffixBytes( patternBoard, bytesSuffix, isHighlander );
      if ( isHighlander ) {
        mixedData[ Math.floor( index / 8 ) ] |= 1 << ( index % 8 );
      }
      index++;
    };

    for ( let i = 0; i < ruleIndices.length; i++ ) {
      const ruleIndex = ruleIndices[ i ];

      // For efficiency, we strip this stuff out so we don't have to convert between binary and not
      const patternBoard = this.collection.getRulePatternBoard( ruleIndex );
      const bytesSuffix = this.collection.getRuleBytes( ruleIndex, false );

      addRule( patternBoard, bytesSuffix, this.isRuleIndexHighlander( ruleIndex ) );
    }

    return new BinaryMixedRuleGroup( collection, mixedData );
  }

  public filterIndex( predicate: ( ruleIndex: number ) => boolean ): BinaryMixedRuleGroup {
    return this.withRuleIndices(
      _.range( 0, this.size ).filter( predicate )
    );
  }

  public sortedIndex( getSortValue: ( ruleIndex: number ) => number ): BinaryMixedRuleGroup {
    return this.withRuleIndices(
      _.sortBy( _.range( 0, this.size ), i => getSortValue( i ) )
    );
  }

  public sortedDefault(): BinaryMixedRuleGroup {
    return this.sortedIndex( ruleIndex => {
      return this.getRule( ruleIndex ).getInputDifficultyScoreB();
    } );
  }

  public serialize(): SerializedBinaryMixedRuleGroup {
    return {
      collection: this.collection.serialize(),
      mixedData: compressByteArray( this.mixedData ),
    };
  }

  public static deserialize( serialized: SerializedBinaryMixedRuleGroup ): BinaryMixedRuleGroup {
    const mixedData = decompressByteArray( serialized.mixedData );

    if ( mixedData ) {
      return new BinaryMixedRuleGroup(
        BinaryRuleCollection.deserialize( serialized.collection ),
        mixedData,
      );
    }
    else {
      throw new Error( 'could not read mixedData' );
    }
  }

  public static fromCollections(
    mainCollection: BinaryRuleCollection | null,
    highlanderCollection: BinaryRuleCollection | null,
  ): BinaryMixedRuleGroup {

    const size = ( mainCollection ? mainCollection.size : 0 ) + ( highlanderCollection ? highlanderCollection.size : 0 );

    const collection = BinaryRuleCollection.empty();
    const mixedData = new Uint8Array( Math.ceil( size / 8 ) );

    let index = 0;
    const addRule = ( rule: PatternRule, isHighlander: boolean ) => {
      collection.addRule( rule );
      if ( isHighlander ) {
        mixedData[ Math.floor( index / 8 ) ] |= 1 << ( index % 8 );
      }
      index++;
    };

    mainCollection && mainCollection.forEachRule( rule => addRule( rule, false ) );
    highlanderCollection && highlanderCollection.forEachRule( rule => addRule( rule, true ) );

    return new BinaryMixedRuleGroup( collection, mixedData );
  }
}

export type SerializedBinaryMixedRuleGroup = {
  collection: SerializedBinaryRuleCollection;
  mixedData: string;
};