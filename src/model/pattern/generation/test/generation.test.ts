import QUnit from 'qunit';
import { getOnlyImpliedSquareBoardRules } from '../getOnlyImpliedSquareBoardRules.ts';
import { squareEdgeOnlyImplied1RuleSets } from '../../data/squareEdgeOnlyImplied1RuleSets.ts';
import { squareEdgeOnlyImplied0RuleSets } from '../../data/squareEdgeOnlyImplied0RuleSets.ts';
import { getOnlyImpliedSectorSquareBoardRules } from '../getOnlyImpliedSectorSquareBoardRules.ts';
import { squareSectorOnlyImplied0RuleSets } from '../../data/squareSectorOnlyImplied0RuleSets.ts';
import { getImpliedColorSquareBoardRules } from '../getImpliedColorSquareBoardRules.ts';
import { squareColorImplied0RuleSets } from '../../data/squareColorImplied0RuleSets.ts';

QUnit.module( 'generation', () => {
  QUnit.test( 'getOnlyImpliedSquareBoardRules 0 0', assert => {
    const actualRuleSet = getOnlyImpliedSquareBoardRules( 0, 0 );
    const expectedRuleSet = squareEdgeOnlyImplied0RuleSets[ 0 ];

    assert.equal( JSON.stringify( actualRuleSet.serialize() ), JSON.stringify( expectedRuleSet.serialize() ) );
  } );

  QUnit.test( 'getOnlyImpliedSquareBoardRules 1 0', assert => {
    const actualRuleSet = getOnlyImpliedSquareBoardRules( 1, 0 );
    const expectedRuleSet = squareEdgeOnlyImplied1RuleSets[ 0 ];

    assert.equal( JSON.stringify( actualRuleSet.serialize() ), JSON.stringify( expectedRuleSet.serialize() ) );
  } );

  QUnit.test( 'getOnlyImpliedSquareBoardRules 1 1', assert => {
    const actualRuleSet = getOnlyImpliedSquareBoardRules( 1, 1 );
    const expectedRuleSet = squareEdgeOnlyImplied1RuleSets[ 1 ];

    assert.equal( JSON.stringify( actualRuleSet.serialize() ), JSON.stringify( expectedRuleSet.serialize() ) );
  } );

  QUnit.test( 'getOnlyImpliedSectorSquareBoardRules 0 0', assert => {
    const actualRuleSet = getOnlyImpliedSectorSquareBoardRules( 0, 0 );
    const expectedRuleSet = squareSectorOnlyImplied0RuleSets[ 0 ];

    assert.equal( JSON.stringify( actualRuleSet.serialize() ), JSON.stringify( expectedRuleSet.serialize() ) );
  } );

  QUnit.test( 'getImpliedColorSquareBoardRules 0 0', assert => {
    const actualRuleSet = getImpliedColorSquareBoardRules( 0, 0 );
    const expectedRuleSet = squareColorImplied0RuleSets[ 0 ];

    assert.equal( JSON.stringify( actualRuleSet.serialize() ), JSON.stringify( expectedRuleSet.serialize() ) );
  } );
} );
