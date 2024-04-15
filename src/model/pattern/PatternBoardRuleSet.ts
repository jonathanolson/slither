import { TDescribedPatternBoard } from './TDescribedPatternBoard.ts';
import { deserializePlanarPatternMap, serializePlanarPatternMap, TPlanarPatternMap } from './TPlanarPatternMap.ts';
import { GetRulesOptions, PatternRule } from './PatternRule.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { FeatureSet, TSerializedFeatureSet } from './feature/FeatureSet.ts';
import { deserializePatternBoardDescriptor, serializePatternBoardDescriptor } from './TPatternBoardDescriptor.ts';
import { BasePatternBoard } from './BasePatternBoard.ts';
import { patternBoardMappings } from './patternBoardMappings.ts';
import { combineOptions } from 'phet-lib/phet-core';

export class PatternBoardRuleSet {
  public constructor(
    public readonly patternBoard: TDescribedPatternBoard,
    public readonly mapping: TPlanarPatternMap,
    public readonly rules: PatternRule[] = []
  ) {
    assertEnabled() && assert( rules.every( rule => rule.patternBoard === patternBoard ) );
  }

  public static create(
    patternBoard: TDescribedPatternBoard,
    mapping: TPlanarPatternMap,
    previousRuleSets: PatternBoardRuleSet[],
    providedOptions?: GetRulesOptions
  ): PatternBoardRuleSet {
    assertEnabled() && assert( patternBoard );
    assertEnabled() && assert( mapping );

    const previousRules = previousRuleSets.flatMap( ruleSet => ruleSet.rules );

    const options = combineOptions<GetRulesOptions>( {}, providedOptions, {
      prefilterRules: previousRules
    } );

    const rules = PatternRule.computeFilteredRules( patternBoard, options );

    return new PatternBoardRuleSet( patternBoard, mapping, rules );
  }

  public serialize(): SerializedPatternBoardRuleSet {
    return {
      patternBoard: serializePatternBoardDescriptor( this.patternBoard.descriptor ),
      mapping: serializePlanarPatternMap( this.mapping ),
      rules: this.rules.map( rule => {
        return {
          input: rule.inputFeatureSet.serialize(),
          output: rule.outputFeatureSet.serialize()
        };
      } )
    };
  }

  public static deserialize( serialized: SerializedPatternBoardRuleSet ): PatternBoardRuleSet {
    const patternBoard = new BasePatternBoard( deserializePatternBoardDescriptor( serialized.patternBoard ) );
    const mapping = deserializePlanarPatternMap( serialized.mapping, patternBoard );

    patternBoardMappings.set( patternBoard, mapping );

    const rules = serialized.rules.map( rule => {
      return new PatternRule(
        patternBoard,
        FeatureSet.deserialize( rule.input, patternBoard ),
        FeatureSet.deserialize( rule.output, patternBoard )
      );
    } );

    return new PatternBoardRuleSet( patternBoard, mapping, rules );
  }
}

export type SerializedPatternBoardRuleSet = {
  patternBoard: string; // descriptor from serializePatternBoardDescriptor
  mapping: string; // from serializePlanarPatternMap
  rules: {
    input: TSerializedFeatureSet;
    output: TSerializedFeatureSet;
  }[];
};