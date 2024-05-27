import { HBox, Node, NodeOptions } from 'phet-lib/scenery';
import { optionize } from 'phet-lib/phet-core';
import { PatternNode, PatternNodeOptions } from './PatternNode.ts';
import { PatternRule } from '../../model/pattern/pattern-rule/PatternRule.ts';
import { TPlanarPatternMap } from '../../model/pattern/TPlanarPatternMap.ts';
import { ArrowNode } from 'phet-lib/scenery-phet';

type SelfOptions = {
  patternNodeOptions?: PatternNodeOptions;
};

export type PatternRuleNodeOptions = SelfOptions & NodeOptions;

export class PatternRuleNode extends Node {
  public constructor(
    public readonly rule: PatternRule,
    public readonly planarPatternMap: TPlanarPatternMap,
    providedOptions?: PatternRuleNodeOptions
  ) {
    const options = optionize<PatternRuleNodeOptions, SelfOptions, NodeOptions>()( {
      patternNodeOptions: {}
    }, providedOptions );

    options.children = [
      new HBox( {
        spacing: 10,
        align: 'origin',
        children: [
          new PatternNode(
            rule.patternBoard,
            rule.inputFeatureSet,
            planarPatternMap,
            options.patternNodeOptions
          ),
          new ArrowNode( 0, 0, 20, 0, {
            // TODO: theme
            fill: '#ccc',
            stroke: '#ccc',
            headHeight: 7,
            headWidth: 7,
            tailWidth: 1,
            layoutOptions: {
              align: 'center'
            }
          } ),
          new PatternNode(
            rule.patternBoard,
            rule.outputFeatureSet,
            planarPatternMap,
            options.patternNodeOptions
          )
        ]
      } )
    ];

    super( options );
  }
}