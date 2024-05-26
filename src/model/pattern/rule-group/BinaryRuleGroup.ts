import { BinaryRuleCollection } from '../BinaryRuleCollection.ts';
import { PatternRule } from '../PatternRule.ts';
import _ from '../../../workarounds/_.ts';
import { TPatternBoard } from '../TPatternBoard.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export class BinaryRuleGroup {

  public readonly collections: BinaryRuleCollection[];

  public constructor(
    public readonly mainCollection: BinaryRuleCollection | null,
    public readonly fallbackCollection: BinaryRuleCollection | null,
    public readonly highlanderCollection: BinaryRuleCollection | null,
    public readonly highlanderFallbackCollection: BinaryRuleCollection | null,
  ) {
    this.collections = [
      mainCollection,
      highlanderCollection,
      fallbackCollection,
      highlanderFallbackCollection,
    ].filter( collection => collection !== null ) as BinaryRuleCollection[];
  }

  public get size(): number {
    return _.sum( this.collections.map( collection => collection.size ) );
  }

  public getRule( index: number ): PatternRule {
    assertEnabled() && assert( index < this.size );

    for ( const collection of this.collections ) {
      if ( index < collection.size ) {
        return collection.getRule( index );
      }
      else {
        index -= collection.size;
      }
    }

    throw new Error( `bad index: ${index}` );
  }

  public withOnlyHighlander(): BinaryRuleGroup {
    return new BinaryRuleGroup(
      null,
      null,
      this.highlanderCollection,
      this.highlanderFallbackCollection,
    );
  }

  public withoutHighlander(): BinaryRuleGroup {
    return new BinaryRuleGroup(
      this.mainCollection,
      this.fallbackCollection,
      null,
      null,
    );
  }

  public withoutFallback(): BinaryRuleGroup {
    return new BinaryRuleGroup(
      this.mainCollection,
      null,
      this.highlanderCollection,
      null,
    );
  }

  public withPatternBoardFilter( patternBoardFilter: ( patternBoard: TPatternBoard ) => boolean ): BinaryRuleGroup {
    return new BinaryRuleGroup(
      this.mainCollection && this.mainCollection.withPatternBoardFilter( patternBoardFilter ),
      this.fallbackCollection && this.fallbackCollection.withPatternBoardFilter( patternBoardFilter ),
      this.highlanderCollection && this.highlanderCollection.withPatternBoardFilter( patternBoardFilter ),
      this.highlanderFallbackCollection && this.highlanderFallbackCollection.withPatternBoardFilter( patternBoardFilter ),
    );
  }
}