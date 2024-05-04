import { Display, Node } from 'phet-lib/scenery';
import { PatternBoardRuleSet, SerializedPatternBoardRuleSet } from './model/pattern/PatternBoardRuleSet.ts';
import { PatternRuleCollection, SerializedPatternRuleCollection } from './model/pattern/PatternRuleCollection.ts';
import { standardSquareBoardGenerations } from './model/pattern/patternBoards.ts';

// Load with `http://localhost:5173/rules-test.html?debugger`

// @ts-expect-error
window.assertions.enableAssert();

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

// @ts-expect-error
window.standardSquareBoardGenerations = standardSquareBoardGenerations;

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
    // TODO: stack?
    // @ts-expect-error
    console.log( `${e} ${e?.stack}` );
    throw e;
  }
};

// empty collection
// console.log( JSON.stringify( PatternRuleCollection.fromRules( [] ).serialize() ) );