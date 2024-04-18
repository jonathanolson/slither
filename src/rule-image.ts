import { AlignBox, Display, GridBox, Node, Rectangle, VBox } from 'phet-lib/scenery';
import { PatternRuleNode } from './view/pattern/PatternRuleNode.ts';
import { hexOnlyEdgeGeneration1RuleSets } from './model/pattern/data/rules.ts';
import { PatternBoardRuleSet } from './model/pattern/PatternBoardRuleSet.ts';

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

( async () => {

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

  const showRuleSet = ( ruleSet: PatternBoardRuleSet ) => {
    addPaddedNode( new GridBox( {
      xSpacing: 40,
      ySpacing: 20,
      // xAlign: 'origin',
      // yAlign: 'origin',
      autoColumns: ruleSet.rules.length < 9 ? 1 : Math.floor( 0.5 * Math.sqrt( ruleSet.rules.length ) ),
      children: ruleSet.rules.map( rule => new PatternRuleNode( rule, ruleSet.mapping ) )
    } ) );
  };

  // showRuleSet( squareOnlyEdgeGeneration1RuleSets[ 0 ] );
  // showRuleSet( squareOnlyEdgeGeneration3RuleSets[ 0 ] );
  showRuleSet( hexOnlyEdgeGeneration1RuleSets[ 0 ] );
  // showRuleSet( squareOnlyEdgeGeneration3RuleSets[ 0 ] );


  // const ruleSets = [
  //   ...basicEdgeRuleSets,
  //
  //   // ...triangularEdgeGeneration0RuleSets,
  //   ...squareEdgeGeneration0RuleSets,
  //   // ...cairoEdgeGeneration0RuleSets,
  //   // ...hexEdgeGeneration0RuleSets,
  //
  //   // ...triangularEdgeGeneration1RuleSets,
  //   ...squareEdgeGeneration1RuleSets,
  //   // ...snubSquareEdgeGeneration1RuleSets,
  //   // ...cairoEdgeGeneration1RuleSets,
  //   // ...hexEdgeGeneration1RuleSets,
  //
  //   // ...triangularEdgeGeneration2RuleSets,
  //   ...squareEdgeGeneration2RuleSets,
  //   // ...rhombilleEdgeGeneration2RuleSets,
  // ];

  // const ruleSets = [
  //   ...basicEdgeRuleSets,
  //
  //   dualEdgeColorRuleSet,
  //   basicColorOnly4RuleSet,
  //
  //   ...squareColorGeneration0RuleSets,
  //   ...squareOnlyEdgeGeneration0RuleSets,
  //
  //   ...squareColorGeneration1RuleSets,
  //   ...squareOnlyEdgeGeneration1RuleSets,
  //
  //   ...squareOnlyEdgeGeneration2RuleSets,
  // ];

  // const ruleSets = [
  //   // ...basicEdgeRuleSets,
  //
  //   ...hexEdgeGeneration0RuleSets,
  //   ...hexEdgeGeneration1RuleSets,
  // ];



  // addPaddedNode( new HBox( {
  //   spacing: 20,
  //   align: 'top',
  //   children: ruleSets.map( ruleSet => {
  //     return new VBox( {
  //       spacing: 10,
  //       // TODO: omg, associate boards with planar pattern maps
  //       children: ruleSet.rules.map( rule => new PatternRuleNode( rule, ruleSet.mapping ) )
  //     } );
  //   } )
  // } ) );


  if ( scene.bounds.isValid() ) {
    background.rectWidth = Math.ceil( scene.right + 10 );
    background.rectHeight = Math.ceil( scene.bottom + 10 );

    display.setWidthHeight(
      Math.ceil( scene.right + 10 ),
      Math.ceil( scene.bottom + 10 )
    );
    display.updateDisplay();

    // Serialize it to XHTML that can be used in foreignObject (HTML can't be)
    const xhtml = new window.XMLSerializer().serializeToString( display.domElement );

    // Create an SVG container with a foreignObject.
    const data = `<svg xmlns="http://www.w3.org/2000/svg" width="${display.width}" height="${display.height}">` +
                 '<foreignObject width="100%" height="100%">' +
                 `<div xmlns="http://www.w3.org/1999/xhtml">${
                   xhtml
                 }</div>` +
                 '</foreignObject>' +
                 '</svg>';

    console.log( data );
  }

} )();
