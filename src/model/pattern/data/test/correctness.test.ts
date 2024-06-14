import generalColorUnrestrictedSequence from '../../../../../data-sequences/general-color-unrestricted.json';
import generalEdgeSectorSequence from '../../../../../data-sequences/general-edge-sector.json';
import generalEdgeSectorUnrestrictedSequence from '../../../../../data-sequences/general-edge-sector-unrestricted.json';
import generalAllSequence from '../../../../../data-sequences/general-all.json';
import generalAllUnrestrictedSequence from '../../../../../data-sequences/general-all-unrestricted.json';
import squareOnlyColorUnrestrictedSequence from '../../../../../data-sequences/square-only-color-unrestricted.json';
import squareOnlyEdgeSectorSequence from '../../../../../data-sequences/square-only-edge-sector.json';
import squareOnlyEdgeSectorUnrestrictedSequence from '../../../../../data-sequences/square-only-edge-sector-unrestricted.json';
import squareOnlyAllSequence from '../../../../../data-sequences/square-only-all.json';
import squareOnlyAllUnrestrictedSequence from '../../../../../data-sequences/square-only-all-unrestricted.json';
import { BinaryRuleSequence, SerializedBinaryRuleSequence } from '../../collection/BinaryRuleSequence.ts';
import { BinaryRuleCollection } from '../../collection/BinaryRuleCollection.ts';
import { isPatternRuleValid } from '../../pattern-rule/isPatternRuleValid.ts';
import QUnit from 'qunit';
import { serializePatternBoard } from '../../pattern-board/serializePatternBoard.ts';
import { getPatternBoardGenericRichSolutions } from '../../solve/getPatternBoardGenericRichSolutions.ts';

QUnit.module('pattern rule correctness', () => {
  const testCollection = (collectionName: string, collection: BinaryRuleCollection) => {
    collection.patternBoards.forEach((patternBoard) => {
      const boardName = serializePatternBoard(patternBoard);

      QUnit.test(`${collectionName} ${boardName}`, (assert) => {
        let count = 0;

        const solutions = getPatternBoardGenericRichSolutions(patternBoard, false);

        let passed = true;
        let firstBrokenString: string | null = null;

        collection.forEachRule((rule) => {
          if (passed && rule.patternBoard === patternBoard) {
            if (++count % 50 === 1) {
              console.log(collectionName, boardName, count - 1);
            }

            const isValid = isPatternRuleValid(rule, true, solutions);

            if (!isValid) {
              passed = false;
              firstBrokenString = rule.toCanonicalString();
            }
          }
        });

        assert.ok(passed, firstBrokenString ?? 'all rules passed');
      });
    });
  };

  // testCollection( 'square-only-edge', BinaryRuleSequence.deserialize( squareOnlyEdgeSequence as SerializedBinaryRuleSequence ).collection );
  // testCollection( 'square-only-edge-unrestricted', BinaryRuleSequence.deserialize( squareOnlyEdgeUnrestrictedSequence as SerializedBinaryRuleSequence ).collection );
  testCollection(
    'square-only-color-unrestricted',
    BinaryRuleSequence.deserialize(squareOnlyColorUnrestrictedSequence as SerializedBinaryRuleSequence).collection,
  );
  testCollection(
    'square-only-edge-sector',
    BinaryRuleSequence.deserialize(squareOnlyEdgeSectorSequence as SerializedBinaryRuleSequence).collection,
  );
  testCollection(
    'square-only-edge-sector-unrestricted',
    BinaryRuleSequence.deserialize(squareOnlyEdgeSectorUnrestrictedSequence as SerializedBinaryRuleSequence).collection,
  );
  testCollection(
    'square-only-all',
    BinaryRuleSequence.deserialize(squareOnlyAllSequence as SerializedBinaryRuleSequence).collection,
  );
  testCollection(
    'square-only-all-unrestricted',
    BinaryRuleSequence.deserialize(squareOnlyAllUnrestrictedSequence as SerializedBinaryRuleSequence).collection,
  );

  // testCollection( 'general-edge', BinaryRuleSequence.deserialize( generalEdgeSequence as SerializedBinaryRuleSequence ).collection );
  // testCollection( 'general-edge-unrestricted', BinaryRuleSequence.deserialize( generalEdgeUnrestrictedSequence as SerializedBinaryRuleSequence ).collection );
  testCollection(
    'general-color-unrestricted',
    BinaryRuleSequence.deserialize(generalColorUnrestrictedSequence as SerializedBinaryRuleSequence).collection,
  );
  testCollection(
    'general-edge-sector',
    BinaryRuleSequence.deserialize(generalEdgeSectorSequence as SerializedBinaryRuleSequence).collection,
  );
  testCollection(
    'general-edge-sector-unrestricted',
    BinaryRuleSequence.deserialize(generalEdgeSectorUnrestrictedSequence as SerializedBinaryRuleSequence).collection,
  );
  testCollection(
    'general-all',
    BinaryRuleSequence.deserialize(generalAllSequence as SerializedBinaryRuleSequence).collection,
  );
  testCollection(
    'general-all-unrestricted',
    BinaryRuleSequence.deserialize(generalAllUnrestrictedSequence as SerializedBinaryRuleSequence).collection,
  );
});
