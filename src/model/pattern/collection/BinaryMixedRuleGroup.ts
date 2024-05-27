import { BinaryRuleGroup } from './BinaryRuleGroup.ts';
import { BinaryRuleCollection, SerializedBinaryRuleCollection } from './BinaryRuleCollection.ts';
import { PatternRule } from '../pattern-rule/PatternRule.ts';
import { compressByteArray, decompressByteArray } from '../../../util/compression.ts';
import _ from '../../../workarounds/_.ts';
import { TPatternBoard } from '../pattern-board/TPatternBoard.ts';

export class BinaryMixedRuleGroup {
  private constructor(
    public readonly collection: BinaryRuleCollection,

    // alternates bits, low-bit highlander, high-bit fallback
    private readonly mixedData: Uint8Array,
  ) {}

  public get size(): number {
    return this.collection.size;
  }

  public getRule( ruleIndex: number ): PatternRule {
    return this.collection.getRule( ruleIndex, this.isRuleIndexHighlander( ruleIndex ) );
  }

  public isRuleIndexHighlander( index: number ): boolean {
    return ( this.mixedData[ Math.floor( index / 4 ) ] & ( 1 << ( 2 * ( index % 4 ) ) ) ) !== 0;
  }

  public isRuleIndexFallback( index: number ): boolean {
    return ( this.mixedData[ Math.floor( index / 4 ) ] & ( 1 << ( 2 * ( index % 4 ) + 1 ) ) ) !== 0;
  }

  public withOnlyHighlander(): BinaryMixedRuleGroup {
    return this.filterIndex( ruleIndex => this.isRuleIndexHighlander( ruleIndex ) );
  }

  public withoutHighlander(): BinaryMixedRuleGroup {
    return this.filterIndex( ruleIndex => !this.isRuleIndexHighlander( ruleIndex ) );
  }

  public withoutFallback(): BinaryMixedRuleGroup {
    return this.filterIndex( ruleIndex => !this.isRuleIndexFallback( ruleIndex ) );
  }

  public withPatternBoardFilter( patternBoardFilter: ( patternBoard: TPatternBoard ) => boolean ): BinaryMixedRuleGroup {
    // TODO: can optimize further, no need to un-binary-ify
    return this.filterIndex( ruleIndex => patternBoardFilter( this.getRule( ruleIndex ).patternBoard ) );
  }

  public withRuleIndices( ruleIndices: number[] ): BinaryMixedRuleGroup {
    const collection = BinaryRuleCollection.empty();
    const mixedData = new Uint8Array( this.mixedData.length );

    let index = 0;
    const addRule = ( rule: PatternRule, isHighlander: boolean, isFallback: boolean ) => {
      // TODO: could optimize in the future, we really don't have to take things OUT of binary form here.
      collection.addRule( rule );
      mixedData[ Math.floor( index / 4 ) ] |= ( isHighlander ? 1 : 0 ) << ( 2 * ( index % 4 ) );
      mixedData[ Math.floor( index / 4 ) ] |= ( isFallback ? 1 : 0 ) << ( 2 * ( index % 4 ) + 1 );
      index++;
    };

    for ( let i = 0; i < ruleIndices.length; i++ ) {
      const ruleIndex = ruleIndices[ i ];

      addRule( this.getRule( ruleIndex ), this.isRuleIndexHighlander( ruleIndex ), this.isRuleIndexFallback( ruleIndex ) );
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

  public static fromGroup( group: BinaryRuleGroup ): BinaryMixedRuleGroup {

    const collection = BinaryRuleCollection.empty();
    const mixedData = new Uint8Array( Math.ceil( group.size / 4 ) );

    let index = 0;
    const addRule = ( rule: PatternRule, isHighlander: boolean, isFallback: boolean ) => {
      collection.addRule( rule );
      mixedData[ Math.floor( index / 4 ) ] |= ( isHighlander ? 1 : 0 ) << ( 2 * ( index % 4 ) );
      mixedData[ Math.floor( index / 4 ) ] |= ( isFallback ? 1 : 0 ) << ( 2 * ( index % 4 ) + 1 );
      index++;
    };

    group.mainCollection && group.mainCollection.forEachRule( rule => addRule( rule, false, false ) );
    group.highlanderCollection && group.highlanderCollection.forEachRule( rule => addRule( rule, true, false ) );
    group.fallbackCollection && group.fallbackCollection.forEachRule( rule => addRule( rule, false, true ) );
    group.highlanderFallbackCollection && group.highlanderFallbackCollection.forEachRule( rule => addRule( rule, true, true ) );

    return new BinaryMixedRuleGroup( collection, mixedData );
  }
}

export type SerializedBinaryMixedRuleGroup = {
  collection: SerializedBinaryRuleCollection;
  mixedData: string;
};