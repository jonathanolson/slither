import { TDescribedPatternBoard } from './TDescribedPatternBoard.ts';
import { deserializePlanarPatternMap, serializePlanarPatternMap, TPlanarPatternMap } from './TPlanarPatternMap.ts';
import { GetRulesOptions, PatternRule } from './PatternRule.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { FeatureSet, TSerializedFeatureSet } from './feature/FeatureSet.ts';
import { deserializePatternBoardDescriptor, serializePatternBoardDescriptor } from './TPatternBoardDescriptor.ts';
import { BasePatternBoard } from './BasePatternBoard.ts';
import { patternBoardMappings } from './patternBoardMappings.ts';
import { combineOptions } from 'phet-lib/phet-core';
import { PatternBoardSolver } from './PatternBoardSolver.ts';
import { getEmbeddings } from './getEmbeddings.ts';

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

  // TODO: Don't really use this, JUST generate the rules correctly from the start?
  public filterCollapseWithInitialFeatureSet( featureSet: FeatureSet, previousRuleSets: PatternBoardRuleSet[] ): PatternBoardRuleSet {
    assertEnabled() && assert( this.patternBoard === featureSet.patternBoard );

    const previousRules = previousRuleSets.flatMap( ruleSet => ruleSet.rules );

    const embeddedRules = previousRules.flatMap( rule => {
      return rule.getEmbeddedRules( getEmbeddings( rule.patternBoard, this.patternBoard ) );
    } );

    const patchedFilteredRules = this.rules.map( rule => {
      if ( featureSet.isSubsetOf( rule.inputFeatureSet ) ) {
        return rule;
      }
      else {
        const input = rule.inputFeatureSet.union( featureSet ); // this might be null if we make other assumptions

        if ( !input ) {
          return null;
        }

        if ( !PatternBoardSolver.hasSolution( rule.patternBoard, input.getFeaturesArray() ) ) {
          return null;
        }

        let output = rule.outputFeatureSet.union( featureSet ); // this might be null if the result is not compatible

        if ( output ) {
          output = PatternRule.withRulesApplied( this.patternBoard, output, embeddedRules );
        }

        return output ? new PatternRule( rule.patternBoard, input, output ) : null;
      }
    } ).filter( rule => rule !== null && !rule.isTrivial() ) as PatternRule[];

    const collapsedRules = PatternRule.collapseRules( patchedFilteredRules );

    const finalRules = PatternRule.filterAndSortRules( collapsedRules, previousRules );

    return new PatternBoardRuleSet( this.patternBoard, this.mapping, finalRules );
  }

  // TODO: Don't really use this, JUST generate the rules correctly from the start?
  public filterCollapseWithVertexOrderLimit( vertexOrderLimit: number, previousRuleSets: PatternBoardRuleSet[] ): PatternBoardRuleSet {
    return this.filterCollapseWithInitialFeatureSet( FeatureSet.emptyWithVertexOrderLimit( this.patternBoard, vertexOrderLimit ), previousRuleSets );
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