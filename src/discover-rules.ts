import { Display, Node } from 'phet-lib/scenery';
import { FormulaSolver } from './model/logic/FormulaSolver.ts';
import { logicOr } from './model/logic/operations.ts';
import { Term } from './model/logic/Term.ts';

// Load with `http://localhost:5173/discover-rules.html?debugger`

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
  const solver = new FormulaSolver<string>();

  const a = new Term( 'a', 'a' );
  const b = new Term( 'b', 'b' );
  const c = new Term( 'c', 'c' );

  solver.addFormula( logicOr( [ a, b, c ] ) );

  console.log( solver.getNextSolution() );
  console.log( solver.getNextSolution() );
  console.log( solver.getNextSolution() );
  console.log( solver.getNextSolution() );
  console.log( solver.getNextSolution() );
  console.log( solver.getNextSolution() );
  console.log( solver.getNextSolution() );
  console.log( solver.getNextSolution() );
  console.log( solver.getNextSolution() );
  console.log( solver.getNextSolution() );
  console.log( solver.getNextSolution() );
  console.log( solver.getNextSolution() );
} )();
