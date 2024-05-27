import { Display, Node } from 'phet-lib/scenery';
import { PatternBoardRuleSet, SerializedPatternBoardRuleSet } from './model/pattern/PatternBoardRuleSet.ts';
import { PatternRuleCollection, SerializedPatternRuleCollection } from './model/pattern/PatternRuleCollection.ts';
import { standardSquareBoardGenerations } from './model/pattern/patternBoards.ts';
import { BinaryRuleCollection, SerializedBinaryRuleCollection } from './model/pattern/collection/BinaryRuleCollection.ts';
import { BinaryRuleSequence, SequenceSpecifier, SerializedBinaryRuleSequence } from './model/pattern/BinaryRuleSequence.ts';
import { serializePatternBoard } from './model/pattern/serializePatternBoard.ts';
import { TPatternBoard } from './model/pattern/TPatternBoard.ts';
import { deserializePatternBoard } from './model/pattern/deserializePatternBoard.ts';

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



// @ts-expect-error
window.addRuleSetToCollection = ( serializedCollection: SerializedPatternRuleCollection, serializedRuleSet: SerializedPatternBoardRuleSet, maxScore = Number.POSITIVE_INFINITY ) => {

  try {
    console.log( `input: ${serializedCollection.rules.slice( 0, 20 )}...${serializedCollection.rules.slice( -20 )}` );

    const collection = PatternRuleCollection.deserialize( serializedCollection );
    const ruleSet = PatternBoardRuleSet.deserialize( serializedRuleSet );

    collection.addNonredundantRuleSet( ruleSet, maxScore );

    const serialized = collection.serialize();

    if ( !PatternRuleCollection.deserialize( serialized ) ) {
      throw new Error( 'Failed to deserialize what we serialized' );
    }

    console.log( `output: ${serialized.rules.slice( 0, 20 )}...${serialized.rules.slice( -20 )}` );

    return serialized;
  }
  catch ( e ) {
    // @ts-expect-error
    console.log( `${e} ${e?.stack}` );
    throw e;
  }
};

// @ts-expect-error
window.addRuleSetToBinaryCollection = ( serializedCollection: SerializedBinaryRuleCollection, serializedRuleSet: SerializedPatternBoardRuleSet, maxScore = Number.POSITIVE_INFINITY ) => {

  try {
    const collection = BinaryRuleCollection.deserialize( serializedCollection );
    const ruleSet = PatternBoardRuleSet.deserialize( serializedRuleSet );

    const newCollection = collection.withNonredundantRuleSet( ruleSet, maxScore );

    const serialized = newCollection.serialize();

    if ( !BinaryRuleCollection.deserialize( serialized ) ) {
      throw new Error( 'Failed to deserialize what we serialized' );
    }

    return serialized;
  }
  catch ( e ) {
    // @ts-expect-error
    console.log( `${e} ${e?.stack}` );
    throw e;
  }
};

// @ts-expect-error
window.combineCollections = ( a: SerializedPatternRuleCollection, b: SerializedPatternRuleCollection ) => {
  try {
    const aCollection = PatternRuleCollection.deserialize( a );
    const bCollection = PatternRuleCollection.deserialize( b );

    aCollection.combineWith( bCollection );

    return aCollection.serialize();
  }
  catch ( e ) {
    // @ts-expect-error
    console.log( `${e} ${e?.stack}` );
    throw e;
  }
};

// empty collection
// console.log( JSON.stringify( PatternRuleCollection.fromRules( [] ).serialize() ) );