import generalAllUnrestrictedSequence from '../../../../../data-sequences/general-all-unrestricted.json';
import generalAllSequence from '../../../../../data-sequences/general-all.json';
import generalColorUnrestrictedSequence from '../../../../../data-sequences/general-color-unrestricted.json';
import generalEdgeColorUnrestrictedSequence from '../../../../../data-sequences/general-edge-color-unrestricted.json';
import generalEdgeColorSequence from '../../../../../data-sequences/general-edge-color.json';
import generalEdgeSectorUnrestrictedSequence from '../../../../../data-sequences/general-edge-sector-unrestricted.json';
import generalEdgeSectorSequence from '../../../../../data-sequences/general-edge-sector.json';
import generalEdgeUnrestrictedSequence from '../../../../../data-sequences/general-edge-unrestricted.json';
import generalEdgeSequence from '../../../../../data-sequences/general-edge.json';
import squareOnlyAllUnrestrictedSequence from '../../../../../data-sequences/square-only-all-unrestricted.json';
import squareOnlyAllSequence from '../../../../../data-sequences/square-only-all.json';
import squareOnlyColorUnrestrictedSequence from '../../../../../data-sequences/square-only-color-unrestricted.json';
import squareOnlyEdgeColorUnrestrictedSequence from '../../../../../data-sequences/square-only-edge-color-unrestricted.json';
import squareOnlyEdgeColorSequence from '../../../../../data-sequences/square-only-edge-color.json';
import squareOnlyEdgeSectorUnrestrictedSequence from '../../../../../data-sequences/square-only-edge-sector-unrestricted.json';
import squareOnlyEdgeSectorSequence from '../../../../../data-sequences/square-only-edge-sector.json';
import squareOnlyEdgeUnrestrictedSequence from '../../../../../data-sequences/square-only-edge-unrestricted.json';
import squareOnlyEdgeSequence from '../../../../../data-sequences/square-only-edge.json';
import { BinaryRuleSequence, SerializedBinaryRuleSequence } from '../../collection/BinaryRuleSequence.ts';
import QUnit from 'qunit';

QUnit.module('Generation', () => {
  const testGeneration = (expectedSequence: BinaryRuleSequence, boardCount: number) => {
    QUnit.test(expectedSequence.getName(), (assert) => {
      assert.ok(true, 'placeholder');

      const actualSequence = BinaryRuleSequence.empty(expectedSequence); // just use as a sequence specifier

      for (let i = 0; i < boardCount; i++) {
        const board = actualSequence.getNextBoard()!;

        assert.ok(!!board, 'nextBoard');

        actualSequence.addProcessingBoard(board);

        const actualCollection = actualSequence.getCollectionForBoard(board);

        const expectedCollection = expectedSequence.collection.withPatternBoardFilter(
          (otherBoard) => board === otherBoard,
        );
        assert.equal(actualCollection.size, expectedCollection.size, `${expectedSequence.getName()} ${board.name}`);

        if (actualCollection.size === expectedCollection.size) {
          for (let j = 0; j < actualCollection.size; j++) {
            const actualRule = actualCollection.getRule(j)!;
            const expectedRule = expectedCollection.getRule(j)!;
            if (!actualRule.equals(expectedRule)) {
              assert.ok(false, actualRule.toCanonicalString() + ' ' + expectedRule.toCanonicalString());
            }
          }
        }

        actualSequence.addProcessedBoardCollection(board, actualCollection);

        actualSequence.removeProcessingBoard(board);
      }
    });
  };

  testGeneration(BinaryRuleSequence.deserialize(generalEdgeSequence as SerializedBinaryRuleSequence), 11 + 10);
  testGeneration(
    BinaryRuleSequence.deserialize(generalEdgeUnrestrictedSequence as SerializedBinaryRuleSequence),
    13 + 10,
  );
  testGeneration(
    BinaryRuleSequence.deserialize(generalColorUnrestrictedSequence as SerializedBinaryRuleSequence),
    12 + 10,
  );
  testGeneration(BinaryRuleSequence.deserialize(generalEdgeColorSequence as SerializedBinaryRuleSequence), 10 + 10);
  testGeneration(
    BinaryRuleSequence.deserialize(generalEdgeColorUnrestrictedSequence as SerializedBinaryRuleSequence),
    12 + 10,
  );
  testGeneration(BinaryRuleSequence.deserialize(generalEdgeSectorSequence as SerializedBinaryRuleSequence), 10 + 10);
  testGeneration(
    BinaryRuleSequence.deserialize(generalEdgeSectorUnrestrictedSequence as SerializedBinaryRuleSequence),
    10 + 10,
  );
  testGeneration(BinaryRuleSequence.deserialize(generalAllSequence as SerializedBinaryRuleSequence), 10 + 8);
  testGeneration(
    BinaryRuleSequence.deserialize(generalAllUnrestrictedSequence as SerializedBinaryRuleSequence),
    10 + 8,
  );

  // This first one is slowest, but it tests our highlander patterns so well
  testGeneration(BinaryRuleSequence.deserialize(squareOnlyEdgeSequence as SerializedBinaryRuleSequence), 11);
  testGeneration(
    BinaryRuleSequence.deserialize(squareOnlyEdgeUnrestrictedSequence as SerializedBinaryRuleSequence),
    13,
  );
  testGeneration(
    BinaryRuleSequence.deserialize(squareOnlyColorUnrestrictedSequence as SerializedBinaryRuleSequence),
    12,
  );
  testGeneration(BinaryRuleSequence.deserialize(squareOnlyEdgeColorSequence as SerializedBinaryRuleSequence), 10);
  testGeneration(
    BinaryRuleSequence.deserialize(squareOnlyEdgeColorUnrestrictedSequence as SerializedBinaryRuleSequence),
    12,
  );
  testGeneration(BinaryRuleSequence.deserialize(squareOnlyEdgeSectorSequence as SerializedBinaryRuleSequence), 10);
  testGeneration(
    BinaryRuleSequence.deserialize(squareOnlyEdgeSectorUnrestrictedSequence as SerializedBinaryRuleSequence),
    10,
  );
  testGeneration(BinaryRuleSequence.deserialize(squareOnlyAllSequence as SerializedBinaryRuleSequence), 10);
  testGeneration(BinaryRuleSequence.deserialize(squareOnlyAllUnrestrictedSequence as SerializedBinaryRuleSequence), 10);
});
