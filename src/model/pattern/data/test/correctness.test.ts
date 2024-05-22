import generalEdgeSequence from '../../../../../data-sequences/general-edge.json';
import generalEdgeUnrestrictedSequence from '../../../../../data-sequences/general-edge-unrestricted.json';
import generalColorSequence from '../../../../../data-sequences/general-color.json';
import generalColorUnrestrictedSequence from '../../../../../data-sequences/general-color-unrestricted.json';
import generalEdgeSectorSequence from '../../../../../data-sequences/general-edge-sector.json';
import generalEdgeSectorUnrestrictedSequence from '../../../../../data-sequences/general-edge-sector-unrestricted.json';
import generalAllSequence from '../../../../../data-sequences/general-all.json';
import generalAllUnrestrictedSequence from '../../../../../data-sequences/general-all-unrestricted.json';
import squareOnlyEdgeSequence from '../../../../../data-sequences/square-only-edge.json';
import squareOnlyEdgeUnrestrictedSequence from '../../../../../data-sequences/square-only-edge-unrestricted.json';
import squareOnlyColorSequence from '../../../../../data-sequences/square-only-color.json';
import squareOnlyColorUnrestrictedSequence from '../../../../../data-sequences/square-only-color-unrestricted.json';
import squareOnlyEdgeSectorSequence from '../../../../../data-sequences/square-only-edge-sector.json';
import squareOnlyEdgeSectorUnrestrictedSequence from '../../../../../data-sequences/square-only-edge-sector-unrestricted.json';
import squareOnlyAllSequence from '../../../../../data-sequences/square-only-all.json';
import squareOnlyAllUnrestrictedSequence from '../../../../../data-sequences/square-only-all-unrestricted.json';
import { BinaryRuleSequence, SerializedBinaryRuleSequence } from '../../BinaryRuleSequence.ts';
import { BinaryRuleCollection } from '../../BinaryRuleCollection.ts';
import { isPatternRuleValid } from '../../isPatternRuleValid.ts';
import QUnit from 'qunit';

QUnit.module( 'pattern rule correctness', () => {

  const testCollection = ( name: string, collection: BinaryRuleCollection ) => {
    QUnit.test( name, assert => {
      collection.forEachRule( rule => {
        const isValid = isPatternRuleValid( rule, true );

        assert.ok( isValid, rule.toCanonicalString() );
      } );
    } );
  };

  testCollection( 'square-only-edge', BinaryRuleSequence.deserialize( squareOnlyEdgeSequence as SerializedBinaryRuleSequence ).collection );
  testCollection( 'square-only-edge-unrestricted', BinaryRuleSequence.deserialize( squareOnlyEdgeUnrestrictedSequence as SerializedBinaryRuleSequence ).collection );
  testCollection( 'square-only-color', BinaryRuleSequence.deserialize( squareOnlyColorSequence as SerializedBinaryRuleSequence ).collection );
  testCollection( 'square-only-color-unrestricted', BinaryRuleSequence.deserialize( squareOnlyColorUnrestrictedSequence as SerializedBinaryRuleSequence ).collection );
  testCollection( 'square-only-edge-sector', BinaryRuleSequence.deserialize( squareOnlyEdgeSectorSequence as SerializedBinaryRuleSequence ).collection );
  testCollection( 'square-only-edge-sector-unrestricted', BinaryRuleSequence.deserialize( squareOnlyEdgeSectorUnrestrictedSequence as SerializedBinaryRuleSequence ).collection );
  testCollection( 'square-only-all', BinaryRuleSequence.deserialize( squareOnlyAllSequence as SerializedBinaryRuleSequence ).collection );
  testCollection( 'square-only-all-unrestricted', BinaryRuleSequence.deserialize( squareOnlyAllUnrestrictedSequence as SerializedBinaryRuleSequence ).collection );

  testCollection( 'general-edge', BinaryRuleSequence.deserialize( generalEdgeSequence as SerializedBinaryRuleSequence ).collection );
  testCollection( 'general-edge-unrestricted', BinaryRuleSequence.deserialize( generalEdgeUnrestrictedSequence as SerializedBinaryRuleSequence ).collection );
  testCollection( 'general-color', BinaryRuleSequence.deserialize( generalColorSequence as SerializedBinaryRuleSequence ).collection );
  testCollection( 'general-color-unrestricted', BinaryRuleSequence.deserialize( generalColorUnrestrictedSequence as SerializedBinaryRuleSequence ).collection );
  testCollection( 'general-edge-sector', BinaryRuleSequence.deserialize( generalEdgeSectorSequence as SerializedBinaryRuleSequence ).collection );
  testCollection( 'general-edge-sector-unrestricted', BinaryRuleSequence.deserialize( generalEdgeSectorUnrestrictedSequence as SerializedBinaryRuleSequence ).collection );
  testCollection( 'general-all', BinaryRuleSequence.deserialize( generalAllSequence as SerializedBinaryRuleSequence ).collection );
  testCollection( 'general-all-unrestricted', BinaryRuleSequence.deserialize( generalAllUnrestrictedSequence as SerializedBinaryRuleSequence ).collection );
} );