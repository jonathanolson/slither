import { Display, Node } from 'phet-lib/scenery';
import { PatternBoardRuleSet, SerializedPatternBoardRuleSet } from './model/pattern/PatternBoardRuleSet.ts';
import { PatternRuleCollection, SerializedPatternRuleCollection } from './model/pattern/PatternRuleCollection.ts';

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
window.addRuleSetToCollection = ( serializedCollection: SerializedPatternRuleCollection, serializedRuleSet: SerializedPatternBoardRuleSet ) => {

  const collection = PatternRuleCollection.deserialize( serializedCollection );
  const ruleSet = PatternBoardRuleSet.deserialize( serializedRuleSet );

  collection.addNonredundantRuleSet( ruleSet );

  return collection.serialize();
};

// empty collection
// console.log( JSON.stringify( PatternRuleCollection.fromRules( [] ).serialize() ) );