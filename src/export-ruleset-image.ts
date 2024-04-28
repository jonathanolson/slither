import { AlignBox, Display, GridBox, Node, Rectangle, VBox } from 'phet-lib/scenery';
import { PatternRuleNode } from './view/pattern/PatternRuleNode.ts';
import { PatternBoardRuleSet, SerializedPatternBoardRuleSet } from './model/pattern/PatternBoardRuleSet.ts';

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

console.log( 'test' );

// @ts-expect-error
window.serializedRuleSetToSVG = ( serializedRuleSet: SerializedPatternBoardRuleSet ) => {

  const ruleSet = PatternBoardRuleSet.deserialize( serializedRuleSet );

  const background = new Rectangle( {
    fill: '#333'
  } );
  scene.addChild( background );

  const container = new VBox( {
    x: 10,
    y: 10,
    align: 'left'
  } );
  scene.addChild( container );

  const addPaddedNode = ( node: Node ) => {
    container.addChild( new AlignBox( node, { margin: 5 } ) );
  };

  addPaddedNode( new GridBox( {
    xSpacing: 40,
    ySpacing: 20,
    // xAlign: 'origin',
    // yAlign: 'origin',
    autoColumns: ruleSet.rules.length < 9 ? 1 : Math.floor( 0.5 * Math.sqrt( ruleSet.rules.length ) ),
    children: ruleSet.rules.map( rule => new PatternRuleNode( rule, ruleSet.mapping ) )
  } ) );

  if ( !scene.bounds.isValid() ) {
    throw new Error( 'invalid bounds' );
  }

  background.rectWidth = Math.ceil( scene.right + 10 );
  background.rectHeight = Math.ceil( scene.bottom + 10 );

  display.setWidthHeight(
    Math.ceil( scene.right + 10 ),
    Math.ceil( scene.bottom + 10 )
  );
  display.updateDisplay();

  return new window.XMLSerializer().serializeToString( display.getRootBackbone().blocks[ 0 ].domElement );
};