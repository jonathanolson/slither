
import { Display, Node } from 'phet-lib/scenery';
import PuzzleNode from './view/puzzle/PuzzleNode.ts';
import { puzzleFromCompressedString } from './model/puzzle/TPuzzle.ts';

// @ts-expect-error
if ( window.assertions && !( import.meta.env.PROD ) ) {
  // TODO: We should actually... have stripped these, something is going wrong
  console.log( 'enabling assertions' );
  // @ts-expect-error
  window.assertions.enableAssert();
}

// const addDisplayToIdentifier = ( id: string, display: Display ) => {
//   document.querySelector( `#${id}` )?.appendChild( display.domElement );
// };

const getDisplayWithIdentifier = ( rootNode: Node, id: string ): Display => {
  return new Display( rootNode, {
    allowWebGL: true,
    allowBackingScaleAntialiasing: true,
    allowSceneOverflow: false,
    accessibility: true,
    backgroundColor: '#eee',

    assumeFullWindow: false,
    listenToOnlyElement: true,
    container: document.querySelector( `#${id}` )! as HTMLElement,
  } );
};

const addStaticPuzzleToIdentifier = ( id: string, puzzleString: string ) => {

  const puzzle = puzzleFromCompressedString( puzzleString )!;

  const puzzleNode = new PuzzleNode( puzzle, {
    scale: 30,
  } );

  puzzleNode.left = 0;
  puzzleNode.top = 0;

  const rootNode = new Node( {
    renderer: 'svg',
    children: [ puzzleNode ],
  } );


  const display = getDisplayWithIdentifier( rootNode, id );

  display.width = Math.ceil( puzzleNode.right );
  display.height = Math.ceil( puzzleNode.bottom );

  display.updateDisplay();
};

const emptyPuzzleString = 'eJytWE1v2zgQ/S8688AZfvu2TVIgly6waXtZ5OBN1EKAGwe2k7YI/N93KEeSh2IR0vEliPUe5+PNDCnqpXluN9tu/dAsQDT/rZeb+2bx0ux+P7bNovmw3LYf+mci8nbdXbttFv++NL+ahRTN7/7v8+HHc/y1F0cYHDDIYcgwYJhiNjmmDxjmbBqG8XX2gKncOscwvs4fMJ1bFxjG14FkCSIHgWWYgMjSSEDFYk1AzQJKQMMCUhy0LKAEdCygBPQsoATkCnEQuUKag1yhBOQKJSBXKAG5QgnIFTIc5AolIFcoAblCCcgV4qDiClkOcoUSkCuUgFyhBOQK2f2taL4ts2M/7QdSgEChbl8tQYYCQgsjcKBghqKFFU6YgaIyFCu8CMINFJ2hKIqEhg9gIJkMCSkWiLyBZDMkQ9HQvMEYtMuQHMVDcwdj8j6XPPQhkU870EKOJvugyOsoAuTkjiSKyxN15GU1V31oFKAfeTnhafopNppHHEWDnPoxASdo+nDUDXIliBl4QYOIo3SQq0LMIAiaSZxaJ1cI2gxicBTiKB/kahFJFByFOOmXK0ckUXAU4qRfrh6RRMFRiKN+mKsH7Q0UHE2rGvXDXD1iBk7QbKpRP8zVI2bgBY2pmuYlV4+YQRA0sYr0I2az3S137dHxfbH+8bhqd+3lcrdsDnP8dbl6OvyeaB/Z8+N5j/9F4jT3k5f+vDsi4FsEnRJUQvBvEYYunxgyZZi3ohg6bGJgynBveglviqHmjFih9v57exMfJCW4ouev6kdKVL8vaBcL+E/7nV7QkhU3KcTZvQXR/Gy7zf3VkcUY48V6td5kemB6Lpq7+P+hCTp6I3TGag3aqRCCxXhS9oSbQ27N318+31xfXh31DvlePz6ut92uHU1fkyGvHKBR0qPzKkB/4HWZ54mD60+F9tNAB/saLQTvrXWoAsqQ2P/y6fLqgjxcNvnjbv8nfw9Pq9XgAzR50OSCAtAyvhSU+YAKHySTDc47Q4IpGbfpMh9Y4cM5CWid1wGUtXErK/OhKnx47TVqhRqMVMoV10NXaaWp3FJZI70hT6U+TE0eJhh0yknqNXJUXHNb4YPqrb2VCqXTqlgpV5MFDZ30AZ2WJFqxUL7ChVFKoQLqKGc0qmIfoabgiCCBuha9JsWKfUDVlEuaO+qnAEg9hcX1gJoxp00kWG9DUI4clSdSM+Y02pqcaA/aKlNeEaiZc2WVshhkv2X58vmAmkFHY7SizSQ4p7WpKEnNpNuAfTIuaAO+PJGaSadBB2edpXRQQvkpBTXDDnQSWjRWauXBlW/vUDXuoKizaBwdnegGyjOpnHcTAjiQtMnL2VvJnw/DmnlHiVYG8qMdaCjPBGvmXdOuZTUVXgaqvCruLqwZeKCOstJQFjZImv1iJ0UDT2D38Lxcdfcj1iy+LVfbNr7Itne7V0/pe2yCDNzhhTXed9pfuZVfE4TdjYZ33dzCj+x56X3nZbo/HTIWzY/lbtMRtyEj3favB1qw2zy1+/S6cD5Ts0vW6aZmN5TTTc1udqebmt3fTjc1u+idbmp2Izzd1OySe7qp2S30HS16znY/Y7/DGRseztjxcMaWn3+zeIetMzb9/DvIO2ydse3nX1/esZ+ese/xnPv8Gft+/i2qxtbtfr//H4dpYs4=';
const partialPuzzleString = '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';
const completePuzzleString = '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';

addStaticPuzzleToIdentifier( 'simple-puzzle-empty', emptyPuzzleString );
addStaticPuzzleToIdentifier( 'simple-puzzle-partial', partialPuzzleString );
addStaticPuzzleToIdentifier( 'simple-puzzle-complete', completePuzzleString );
