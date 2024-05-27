import { Display, Node } from 'phet-lib/scenery';
import { standardSquareBoardGenerations } from './model/pattern/pattern-board/patternBoards.ts';
import { BinaryRuleCollection, SerializedBinaryRuleCollection } from './model/pattern/collection/BinaryRuleCollection.ts';
import { BinaryRuleSequence, SequenceSpecifier, SerializedBinaryRuleSequence } from './model/pattern/collection/BinaryRuleSequence.ts';
import { serializePatternBoard } from './model/pattern/pattern-board/serializePatternBoard.ts';
import { TPatternBoard } from './model/pattern/pattern-board/TPatternBoard.ts';
import { deserializePatternBoard } from './model/pattern/pattern-board/deserializePatternBoard.ts';
import { BinaryMixedRuleGroup, SerializedBinaryMixedRuleGroup } from './model/pattern/collection/BinaryMixedRuleGroup.ts';
import { BinaryRuleGroup } from './model/pattern/collection/BinaryRuleGroup.ts';

// Load with `http://localhost:5173/rules-test.html?debugger`

// // @ts-expect-error
// window.assertions.enableAssert();

const scene = new Node();

const rootNode = new Node( {
  renderer: 'svg',
  children: [ scene ]
} );

const display = new Display( rootNode, {
  allowWebGL: true,
  allowBackingScaleAntialiasing: true,
  allowSceneOverflow: false
} );
document.body.appendChild( display.domElement );

display.setWidthHeight( window.innerWidth, window.innerHeight );

// TODO: use this more to get rid of the other globals
declare global {
  interface Window {
    standardSquareBoardGenerations: TPatternBoard[][];

    getSequenceName: ( sequenceSpecifier: SequenceSpecifier ) => string;
    getEmptySequence: ( sequenceSpecifier: SequenceSpecifier ) => SerializedBinaryRuleSequence;
    getSequenceStatus: ( serializedSequence: SerializedBinaryRuleSequence ) => string;
    getNextBoardInSequence: ( serializedSequence: SerializedBinaryRuleSequence ) => string | null;
    getSequenceWithProcessingBoard: ( serializedSequence: SerializedBinaryRuleSequence, serializedBoard: string ) => SerializedBinaryRuleSequence;
    getSequenceWithoutProcessingBoard: ( serializedSequence: SerializedBinaryRuleSequence, serializedBoard: string ) => SerializedBinaryRuleSequence;
    getSequenceWithCollection: ( serializedSequence: SerializedBinaryRuleSequence, serializedBoard: string, serializedCollection: SerializedBinaryRuleCollection ) => SerializedBinaryRuleSequence;
    getCollectionForSequence: ( serializedSequence: SerializedBinaryRuleSequence, board: string ) => SerializedBinaryRuleCollection;
    withCollection: ( a: SerializedBinaryRuleCollection, b: SerializedBinaryRuleCollection ) => SerializedBinaryRuleCollection;
    withCollectionNonequal: ( a: SerializedBinaryRuleCollection, b: SerializedBinaryRuleCollection ) => SerializedBinaryRuleCollection;
    withCollectionNonredundant: ( a: SerializedBinaryRuleCollection, b: SerializedBinaryRuleCollection ) => SerializedBinaryRuleCollection;
    withoutCollectionNonequal: ( a: SerializedBinaryRuleCollection, b: SerializedBinaryRuleCollection ) => SerializedBinaryRuleCollection;
    withoutCollectionNonredundant: ( a: SerializedBinaryRuleCollection, b: SerializedBinaryRuleCollection ) => SerializedBinaryRuleCollection;

    collectionsToSortedMixedGroup: (
      mainCollection: SerializedBinaryRuleCollection | null,
      fallbackCollection: SerializedBinaryRuleCollection | null,
      highlanderCollection: SerializedBinaryRuleCollection | null,
      highlanderFallbackCollection: SerializedBinaryRuleCollection | null,
    ) => SerializedBinaryMixedRuleGroup;
  }
}

window.standardSquareBoardGenerations = standardSquareBoardGenerations;

// console.log( JSON.stringify( BinaryRuleCollection.empty().serialize() ) );

window.getSequenceName = ( sequenceSpecifier: SequenceSpecifier ): string => {
  return BinaryRuleSequence.getName( sequenceSpecifier );
};

window.getEmptySequence = ( sequenceSpecifier: SequenceSpecifier ): SerializedBinaryRuleSequence => {
  return BinaryRuleSequence.empty( sequenceSpecifier ).serialize();
};

window.getSequenceStatus = ( serializedSequence: SerializedBinaryRuleSequence ): string => {
  const sequence = BinaryRuleSequence.deserialize( serializedSequence );

  return sequence.getStatusString();
};

window.getNextBoardInSequence = ( serializedSequence: SerializedBinaryRuleSequence ): string | null => {
  const sequence = BinaryRuleSequence.deserialize( serializedSequence );
  const nextBoard = sequence.getNextBoard();
  return nextBoard ? serializePatternBoard( nextBoard ) : null;
};

window.getSequenceWithProcessingBoard = ( serializedSequence: SerializedBinaryRuleSequence, serializedBoard: string ): SerializedBinaryRuleSequence => {
  const sequence = BinaryRuleSequence.deserialize( serializedSequence );
  const board = deserializePatternBoard( serializedBoard );

  sequence.addProcessingBoard( board );

  return sequence.serialize();
};

window.getSequenceWithoutProcessingBoard = ( serializedSequence: SerializedBinaryRuleSequence, serializedBoard: string ): SerializedBinaryRuleSequence => {
  const sequence = BinaryRuleSequence.deserialize( serializedSequence );
  const board = deserializePatternBoard( serializedBoard );

  sequence.removeProcessingBoard( board );

  return sequence.serialize();
};

window.getSequenceWithCollection = ( serializedSequence: SerializedBinaryRuleSequence, serializedBoard: string, serializedCollection: SerializedBinaryRuleCollection ): SerializedBinaryRuleSequence => {
  const sequence = BinaryRuleSequence.deserialize( serializedSequence );
  const board = deserializePatternBoard( serializedBoard );
  const collection = BinaryRuleCollection.deserialize( serializedCollection );

  sequence.addProcessedBoardCollection( board, collection );

  return sequence.serialize();
};

window.getCollectionForSequence = ( serializedSequence: SerializedBinaryRuleSequence, serializedBoard: string ): SerializedBinaryRuleCollection => {
  const sequence = BinaryRuleSequence.deserialize( serializedSequence );
  const board = deserializePatternBoard( serializedBoard );

  const collection = sequence.getCollectionForBoard( board );
  return collection.serialize();
};

window.withCollection = ( a: SerializedBinaryRuleCollection, b: SerializedBinaryRuleCollection ): SerializedBinaryRuleCollection => {
  const aCollection = BinaryRuleCollection.deserialize( a );
  const bCollection = BinaryRuleCollection.deserialize( b );
  const resultCollection = aCollection.withCollection( bCollection );
  return resultCollection.serialize();
};

window.withCollectionNonequal = ( a: SerializedBinaryRuleCollection, b: SerializedBinaryRuleCollection ): SerializedBinaryRuleCollection => {
  const aCollection = BinaryRuleCollection.deserialize( a );
  const bCollection = BinaryRuleCollection.deserialize( b );
  const resultCollection = aCollection.withCollectionNonequal( bCollection );
  return resultCollection.serialize();
};

window.withCollectionNonredundant = ( a: SerializedBinaryRuleCollection, b: SerializedBinaryRuleCollection ): SerializedBinaryRuleCollection => {
  const aCollection = BinaryRuleCollection.deserialize( a );
  const bCollection = BinaryRuleCollection.deserialize( b );
  const resultCollection = aCollection.withCollectionNonredundant( bCollection );
  return resultCollection.serialize();
};

window.withoutCollectionNonequal = ( a: SerializedBinaryRuleCollection, b: SerializedBinaryRuleCollection ): SerializedBinaryRuleCollection => {
  const aCollection = BinaryRuleCollection.deserialize( a );
  const bCollection = BinaryRuleCollection.deserialize( b );
  const resultCollection = aCollection.withoutCollectionNonequal( bCollection );
  return resultCollection.serialize();
};

window.withoutCollectionNonredundant = ( a: SerializedBinaryRuleCollection, b: SerializedBinaryRuleCollection ): SerializedBinaryRuleCollection => {
  const aCollection = BinaryRuleCollection.deserialize( a );
  const bCollection = BinaryRuleCollection.deserialize( b );
  const resultCollection = aCollection.withoutCollectionNonredundant( bCollection );
  return resultCollection.serialize();
};

window.collectionsToSortedMixedGroup = (
  mainCollection: SerializedBinaryRuleCollection | null,
  fallbackCollection: SerializedBinaryRuleCollection | null,
  highlanderCollection: SerializedBinaryRuleCollection | null,
  highlanderFallbackCollection: SerializedBinaryRuleCollection | null,
): SerializedBinaryMixedRuleGroup => {
  const main = mainCollection ? BinaryRuleCollection.deserialize( mainCollection ) : null;
  const fallback = fallbackCollection ? BinaryRuleCollection.deserialize( fallbackCollection ) : null;
  const highlander = highlanderCollection ? BinaryRuleCollection.deserialize( highlanderCollection ) : null;
  const highlanderFallback = highlanderFallbackCollection ? BinaryRuleCollection.deserialize( highlanderFallbackCollection ) : null;

  const normalGroup = new BinaryRuleGroup( main, fallback, highlander, highlanderFallback );

  const mixedGroup = BinaryMixedRuleGroup.fromGroup( normalGroup );

  return mixedGroup.sortedDefault().serialize();
};