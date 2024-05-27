import { deserializePlanarPatternMap, serializePlanarPatternMap, TPlanarPatternMap } from './pattern-board/planar-map/TPlanarPatternMap.ts';
import { PatternRule } from './pattern-rule/PatternRule.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { FeatureSet, TSerializedFeatureSet } from './feature/FeatureSet.ts';
import { deserializePatternBoardDescriptor, serializePatternBoardDescriptor } from './pattern-board/TPatternBoardDescriptor.ts';
import { BasePatternBoard } from './pattern-board/BasePatternBoard.ts';
import { planarPatternMaps } from './pattern-board/planar-map/planarPatternMaps.ts';
import { combineOptions } from 'phet-lib/phet-core';
import { TPatternBoard } from './pattern-board/TPatternBoard.ts';
import { GetRulesOptions } from './generation/GetRulesOptions.ts';
import { getSolutionImpliedRules } from './generation/getSolutionImpliedRules.ts';
import { getStandardDescribedPatternBoard } from './pattern-board/patternBoards.ts';

export class PatternBoardRuleSet {
  public constructor(
    public readonly patternBoard: TPatternBoard,
    public readonly mapping: TPlanarPatternMap,
    public readonly rules: PatternRule[] = [],
    public readonly highlander: boolean = false,
  ) {
    assertEnabled() && assert( rules.every( rule => rule.patternBoard === patternBoard ) );
  }

  public static createImplied(
    patternBoard: TPatternBoard,
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

    const rules = getSolutionImpliedRules( patternBoard, options );

    return new PatternBoardRuleSet( patternBoard, mapping, rules, !!providedOptions?.highlander );
  }

  public static createImpliedChained(
    patternBoards: TPatternBoard[],
    previousRuleSets: PatternBoardRuleSet[],
    providedOptions?: GetRulesOptions
  ): PatternBoardRuleSet[] {
    let previousRules = previousRuleSets.flatMap( ruleSet => ruleSet.rules );

    const ruleSets: PatternBoardRuleSet[] = [];

    for ( let i = 0; i < patternBoards.length; i++ ) {
      const patternBoard = patternBoards[ i ];
      const mapping = planarPatternMaps.get( patternBoard )!;
      assertEnabled() && assert( mapping );

      const options = combineOptions<GetRulesOptions>( {}, providedOptions, {
        prefilterRules: previousRules
      } );

      const rules = getSolutionImpliedRules( patternBoard, options );

      if ( rules.length ) {
        ruleSets.push( new PatternBoardRuleSet( patternBoard, mapping, rules, !!providedOptions?.highlander ) );
      }

      previousRules = [
        ...previousRules,
        ...rules
      ];
    }

    return ruleSets;
  }

  public serialize(): SerializedPatternBoardRuleSet {
    const result: SerializedPatternBoardRuleSet = {
      patternBoard: serializePatternBoardDescriptor( this.patternBoard.descriptor ),
      mapping: serializePlanarPatternMap( this.mapping ),
      rules: this.rules.map( rule => {
        return {
          input: rule.inputFeatureSet.serialize(),
          output: rule.outputFeatureSet.serialize()
        };
      } )
    };

    if ( this.highlander ) {
      result.highlander = true;
    }

    return result;
  }

  public static deserialize( serialized: SerializedPatternBoardRuleSet ): PatternBoardRuleSet {

    const highlander = !!serialized.highlander;

    // TODO: these should match descriptors perfectly, so they won't be "isomorphic"
    const descriptor = deserializePatternBoardDescriptor( serialized.patternBoard );

    let patternBoard: TPatternBoard;
    let planarPatternMap: TPlanarPatternMap;

    let standardPatternBoard = getStandardDescribedPatternBoard( descriptor );
    if ( standardPatternBoard ) {
      patternBoard = standardPatternBoard;
      planarPatternMap = planarPatternMaps.get( patternBoard )!;
      assertEnabled() && assert( planarPatternMap );
    }
    else {
      patternBoard = new BasePatternBoard( deserializePatternBoardDescriptor( serialized.patternBoard ) );
      planarPatternMap = deserializePlanarPatternMap( serialized.mapping, patternBoard );

      planarPatternMaps.set( patternBoard, planarPatternMap );
    }

    const rules = serialized.rules.map( rule => {
      return new PatternRule(
        patternBoard,
        FeatureSet.deserialize( rule.input, patternBoard ),
        FeatureSet.deserialize( rule.output, patternBoard ),
        highlander
      );
    } );

    return new PatternBoardRuleSet( patternBoard, planarPatternMap, rules, highlander );
  }
}

export type SerializedPatternBoardRuleSet = {
  patternBoard: string; // descriptor from serializePatternBoardDescriptor
  mapping: string; // from serializePlanarPatternMap
  highlander?: true;
  rules: {
    input: TSerializedFeatureSet;
    output: TSerializedFeatureSet;
  }[];
};