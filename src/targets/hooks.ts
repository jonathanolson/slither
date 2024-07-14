import { TinyEmitter, TinyProperty } from 'phet-lib/axon';
import { Display, Node } from 'phet-lib/scenery';

import { PolygonGeneratorBoard } from '../model/board/core/PolygonGeneratorBoard.ts';
import { TStructure } from '../model/board/core/TStructure.ts';
import { TCompleteData } from '../model/data/combined/TCompleteData.ts';
import CanSolveDifficulty from '../model/generator/CanSolveDifficulty.ts';
import { TSolvedPuzzle } from '../model/generator/TSolvedPuzzle.ts';
import { generateAdditiveConstrained } from '../model/generator/generateAdditiveConstrained.ts';
import {
  BinaryMixedRuleGroup,
  SerializedBinaryMixedRuleGroup,
} from '../model/pattern/collection/BinaryMixedRuleGroup.ts';
import {
  BinaryRuleCollection,
  SerializedBinaryRuleCollection,
} from '../model/pattern/collection/BinaryRuleCollection.ts';
import {
  BinaryRuleSequence,
  SequenceSpecifier,
  SerializedBinaryRuleSequence,
} from '../model/pattern/collection/BinaryRuleSequence.ts';
import { TPatternBoard } from '../model/pattern/pattern-board/TPatternBoard.ts';
import { deserializePatternBoard } from '../model/pattern/pattern-board/deserializePatternBoard.ts';
import {
  getSerializedPatternBoardLibrary,
  standardSquareBoardGenerations,
} from '../model/pattern/pattern-board/patternBoards.ts';
import { serializePatternBoard } from '../model/pattern/pattern-board/serializePatternBoard.ts';
import { TSerializedRatedPuzzle } from '../model/puzzle/TSerializedRatedPuzzle.ts';
import { getSerializedRatedPuzzle } from '../model/puzzle/getSerializedRatedPuzzle.ts';

import { compressString } from '../util/compression.ts';

import _ from '../workarounds/_.ts';

// Load with `http://localhost:5173/rules-test.html?debugger`

// // @ts-expect-error
// window.assertions.enableAssert();

const scene = new Node();

const rootNode = new Node({
  renderer: 'svg',
  children: [scene],
});

const display = new Display(rootNode, {
  allowWebGL: true,
  allowBackingScaleAntialiasing: true,
  allowSceneOverflow: false,
});
document.body.appendChild(display.domElement);

display.setWidthHeight(window.innerWidth, window.innerHeight);

type ShortName = string;

// TODO: use this more to get rid of the other globals
declare global {
  interface Window {
    standardSquareBoardGenerations: TPatternBoard[][];

    // For being able to store the PatternBoards without the expensive construction
    getSerializedPatternBoardLibraryJS: () => string;

    getSequenceName: (sequenceSpecifier: SequenceSpecifier) => string;
    getEmptySequence: (sequenceSpecifier: SequenceSpecifier) => SerializedBinaryRuleSequence;
    getSequenceStatus: (serializedSequence: SerializedBinaryRuleSequence) => string;
    getNextBoardInSequence: (serializedSequence: SerializedBinaryRuleSequence) => string | null;
    getSequenceWithProcessingBoard: (
      serializedSequence: SerializedBinaryRuleSequence,
      serializedBoard: string,
    ) => SerializedBinaryRuleSequence;
    getSequenceWithoutProcessingBoard: (
      serializedSequence: SerializedBinaryRuleSequence,
      serializedBoard: string,
    ) => SerializedBinaryRuleSequence;
    getSequenceWithCollection: (
      serializedSequence: SerializedBinaryRuleSequence,
      serializedBoard: string,
      serializedCollection: SerializedBinaryRuleCollection,
    ) => SerializedBinaryRuleSequence;
    getCollectionForSequence: (
      serializedSequence: SerializedBinaryRuleSequence,
      board: string,
    ) => SerializedBinaryRuleCollection;
    withCollection: (
      a: SerializedBinaryRuleCollection,
      b: SerializedBinaryRuleCollection,
    ) => SerializedBinaryRuleCollection;
    withCollectionNonequal: (
      a: SerializedBinaryRuleCollection,
      b: SerializedBinaryRuleCollection,
    ) => SerializedBinaryRuleCollection;
    withCollectionNonredundant: (
      a: SerializedBinaryRuleCollection,
      b: SerializedBinaryRuleCollection,
    ) => SerializedBinaryRuleCollection;
    withoutCollectionNonequal: (
      a: SerializedBinaryRuleCollection,
      b: SerializedBinaryRuleCollection,
    ) => SerializedBinaryRuleCollection;
    withoutCollectionNonredundant: (
      a: SerializedBinaryRuleCollection,
      b: SerializedBinaryRuleCollection,
    ) => SerializedBinaryRuleCollection;

    collectionsToSortedMixedGroup: (
      mainCollection: SerializedBinaryRuleCollection | null,
      highlanderCollection: SerializedBinaryRuleCollection | null,
    ) => SerializedBinaryMixedRuleGroup;

    getMinimizedRatedPuzzle: (shortName: ShortName) => Promise<TSerializedRatedPuzzle | null>;
  }
}

window.standardSquareBoardGenerations = standardSquareBoardGenerations;

window.getSerializedPatternBoardLibraryJS = () => {
  const serializedPatternBoardLibrary = getSerializedPatternBoardLibrary();

  return JSON.stringify(compressString(JSON.stringify(serializedPatternBoardLibrary)));
};

// console.log( JSON.stringify( BinaryRuleCollection.empty().serialize() ) );

window.getSequenceName = (sequenceSpecifier: SequenceSpecifier): string => {
  return BinaryRuleSequence.getName(sequenceSpecifier);
};

window.getEmptySequence = (sequenceSpecifier: SequenceSpecifier): SerializedBinaryRuleSequence => {
  return BinaryRuleSequence.empty(sequenceSpecifier).serialize();
};

window.getSequenceStatus = (serializedSequence: SerializedBinaryRuleSequence): string => {
  const sequence = BinaryRuleSequence.deserialize(serializedSequence);

  return sequence.getStatusString();
};

window.getNextBoardInSequence = (serializedSequence: SerializedBinaryRuleSequence): string | null => {
  const sequence = BinaryRuleSequence.deserialize(serializedSequence);
  const nextBoard = sequence.getNextBoard();
  return nextBoard ? serializePatternBoard(nextBoard) : null;
};

window.getSequenceWithProcessingBoard = (
  serializedSequence: SerializedBinaryRuleSequence,
  serializedBoard: string,
): SerializedBinaryRuleSequence => {
  const sequence = BinaryRuleSequence.deserialize(serializedSequence);
  const board = deserializePatternBoard(serializedBoard);

  sequence.addProcessingBoard(board);

  return sequence.serialize();
};

window.getSequenceWithoutProcessingBoard = (
  serializedSequence: SerializedBinaryRuleSequence,
  serializedBoard: string,
): SerializedBinaryRuleSequence => {
  const sequence = BinaryRuleSequence.deserialize(serializedSequence);
  const board = deserializePatternBoard(serializedBoard);

  sequence.removeProcessingBoard(board);

  return sequence.serialize();
};

window.getSequenceWithCollection = (
  serializedSequence: SerializedBinaryRuleSequence,
  serializedBoard: string,
  serializedCollection: SerializedBinaryRuleCollection,
): SerializedBinaryRuleSequence => {
  const sequence = BinaryRuleSequence.deserialize(serializedSequence);
  const board = deserializePatternBoard(serializedBoard);
  const collection = BinaryRuleCollection.deserialize(serializedCollection);

  sequence.addProcessedBoardCollection(board, collection);

  return sequence.serialize();
};

window.getCollectionForSequence = (
  serializedSequence: SerializedBinaryRuleSequence,
  serializedBoard: string,
): SerializedBinaryRuleCollection => {
  const sequence = BinaryRuleSequence.deserialize(serializedSequence);
  const board = deserializePatternBoard(serializedBoard);

  const collection = sequence.getCollectionForBoard(board);
  return collection.serialize();
};

window.withCollection = (
  a: SerializedBinaryRuleCollection,
  b: SerializedBinaryRuleCollection,
): SerializedBinaryRuleCollection => {
  const aCollection = BinaryRuleCollection.deserialize(a);
  const bCollection = BinaryRuleCollection.deserialize(b);
  const resultCollection = aCollection.withCollection(bCollection);
  return resultCollection.serialize();
};

window.withCollectionNonequal = (
  a: SerializedBinaryRuleCollection,
  b: SerializedBinaryRuleCollection,
): SerializedBinaryRuleCollection => {
  const aCollection = BinaryRuleCollection.deserialize(a);
  const bCollection = BinaryRuleCollection.deserialize(b);
  const resultCollection = aCollection.withCollectionNonequal(bCollection);
  return resultCollection.serialize();
};

window.withCollectionNonredundant = (
  a: SerializedBinaryRuleCollection,
  b: SerializedBinaryRuleCollection,
): SerializedBinaryRuleCollection => {
  const aCollection = BinaryRuleCollection.deserialize(a);
  const bCollection = BinaryRuleCollection.deserialize(b);
  const resultCollection = aCollection.withCollectionNonredundant(bCollection);
  return resultCollection.serialize();
};

window.withoutCollectionNonequal = (
  a: SerializedBinaryRuleCollection,
  b: SerializedBinaryRuleCollection,
): SerializedBinaryRuleCollection => {
  const aCollection = BinaryRuleCollection.deserialize(a);
  const bCollection = BinaryRuleCollection.deserialize(b);
  const resultCollection = aCollection.withoutCollectionNonequal(bCollection);
  return resultCollection.serialize();
};

window.withoutCollectionNonredundant = (
  a: SerializedBinaryRuleCollection,
  b: SerializedBinaryRuleCollection,
): SerializedBinaryRuleCollection => {
  const aCollection = BinaryRuleCollection.deserialize(a);
  const bCollection = BinaryRuleCollection.deserialize(b);
  const resultCollection = aCollection.withoutCollectionNonredundant(bCollection);
  return resultCollection.serialize();
};

window.collectionsToSortedMixedGroup = (
  mainCollection: SerializedBinaryRuleCollection | null,
  highlanderCollection: SerializedBinaryRuleCollection | null,
): SerializedBinaryMixedRuleGroup => {
  const main = mainCollection ? BinaryRuleCollection.deserialize(mainCollection) : null;
  const highlander = highlanderCollection ? BinaryRuleCollection.deserialize(highlanderCollection) : null;

  console.log('main count', main ? main.size : 0);
  console.log('highlander count', highlander ? highlander.size : 0);

  const mixedGroup = BinaryMixedRuleGroup.fromCollections(main, highlander);

  console.log('rule count', mixedGroup.size);

  return mixedGroup.sortedDefault().serialize();
};

window.getMinimizedRatedPuzzle = async (shortName: ShortName): Promise<TSerializedRatedPuzzle | null> => {
  const board = PolygonGeneratorBoard.fromShortName(shortName);

  let solvedPuzzle: TSolvedPuzzle<TStructure, TCompleteData> | null = null;

  const difficulty = _.sample([
    CanSolveDifficulty.EASY,
    CanSolveDifficulty.MEDIUM,
    CanSolveDifficulty.HARD,
    CanSolveDifficulty.VERY_HARD,
    // CanSolveDifficulty.FULL,
    CanSolveDifficulty.NO_LIMIT,
  ]);

  try {
    while (!solvedPuzzle) {
      solvedPuzzle = await generateAdditiveConstrained(
        board,
        difficulty,
        new TinyProperty(false),
        new TinyEmitter(),
        new TinyEmitter(),
        new TinyEmitter(),
      );
    }

    return getSerializedRatedPuzzle(solvedPuzzle);
  } catch (e) {
    return null;
  }
};
