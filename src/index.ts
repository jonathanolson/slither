import '../index.css';

import { Display, Node } from 'phet-lib/scenery';
import PuzzleNode from './view/puzzle/PuzzleNode.ts';
import { puzzleFromCompressedString } from './model/puzzle/TPuzzle.ts';
import { getBasicColoringPuzzleStyleWithTheme, getBasicLinesPuzzleStyleWithTheme, getClassicPuzzleStyleWithTheme, getPureColoringPuzzleStyleWithTheme, getSectorsWithColorsPuzzleStyleWithTheme } from './view/puzzle/puzzleStyles.ts';
import { lightTheme } from './view/Theme.ts';
import { TPuzzleStyle } from './view/puzzle/TPuzzleStyle.ts';
import { PatternRule } from './model/pattern/pattern-rule/PatternRule.ts';
import { EmbeddedPatternRuleNode } from './view/pattern/EmbeddedPatternRuleNode.ts';
import { DisplayTiling } from './view/pattern/DisplayTiling.ts';
import { getBestDisplayEmbedding } from './view/pattern/getBestDisplayEmbedding.ts';
import { Bounds2 } from 'phet-lib/dot';
import { Shape } from 'phet-lib/kite';

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

const classicStyle = getClassicPuzzleStyleWithTheme( lightTheme );
const basicLineStyle = getBasicLinesPuzzleStyleWithTheme( lightTheme );
const basicColorStyle = getBasicColoringPuzzleStyleWithTheme( lightTheme );
const pureColorStyle = getPureColoringPuzzleStyleWithTheme( lightTheme );
const sectorColorStyle = getSectorsWithColorsPuzzleStyleWithTheme( lightTheme );

const getDisplayWithIdentifier = ( rootNode: Node, id: string ): Display => {
  return new Display( rootNode, {
    allowWebGL: true,
    allowBackingScaleAntialiasing: true,
    allowSceneOverflow: false,
    accessibility: true,

    assumeFullWindow: false,
    listenToOnlyElement: true,
    container: document.querySelector( `#${id}` )! as HTMLElement,
  } );
};

const staticNodeWithIdentifier = ( node: Node, id: string ) => {
  node.left = 0;
  node.top = 0;

  const rootNode = new Node( {
    renderer: 'svg',
    children: [ node ],
  } );

  const display = getDisplayWithIdentifier( rootNode, id );

  display.width = Math.ceil( node.right );
  display.height = Math.ceil( node.bottom );

  display.updateDisplay();
};

const addStaticPuzzle = async ( id: string, style: TPuzzleStyle, puzzleString: string ) => {

  const puzzle = puzzleFromCompressedString( puzzleString )!;

  const puzzleNode = new PuzzleNode( puzzle, {
    scale: 30,
    style: style,
  } );

  staticNodeWithIdentifier( puzzleNode, id );
};

const addStaticClippedPuzzle = async ( id: string, style: TPuzzleStyle, clipBounds: Bounds2, puzzleString: string ) => {

  const puzzle = puzzleFromCompressedString( puzzleString )!;

  const container = new Node( {
    scale: 30,
    clipArea: Shape.bounds( clipBounds ),
    localBounds: clipBounds,
    children: [
      new PuzzleNode( puzzle, {
        style: style,
      } )
    ]
  } );

  staticNodeWithIdentifier( container, id );
};

const addStaticRule = async ( id: string, style: TPuzzleStyle, displayTiling: DisplayTiling, ruleBinaryIdentifier: string ) => {

  const rule = PatternRule.fromBinaryIdentifier( ruleBinaryIdentifier );

  const displayEmbedding = getBestDisplayEmbedding( rule.patternBoard, displayTiling )!;

  const node = new EmbeddedPatternRuleNode( rule, displayEmbedding, {
    scale: 30,
    style: style,
  } );

  staticNodeWithIdentifier( node, id );
};

( async () => {
  await addStaticPuzzle( 'simple-puzzle-empty', classicStyle, 'eJytWE1v2zgQ/S8688AZfvu2TVIgly6waXtZ5OBN1EKAGwe2k7YI/N93KEeSh2IR0vEliPUe5+PNDCnqpXluN9tu/dAsQDT/rZeb+2bx0ux+P7bNovmw3LYf+mci8nbdXbttFv++NL+ahRTN7/7v8+HHc/y1F0cYHDDIYcgwYJhiNjmmDxjmbBqG8XX2gKncOscwvs4fMJ1bFxjG14FkCSIHgWWYgMjSSEDFYk1AzQJKQMMCUhy0LKAEdCygBPQsoATkCnEQuUKag1yhBOQKJSBXKAG5QgnIFTIc5AolIFcoAblCCcgV4qDiClkOcoUSkCuUgFyhBOQK2f2taL4ts2M/7QdSgEChbl8tQYYCQgsjcKBghqKFFU6YgaIyFCu8CMINFJ2hKIqEhg9gIJkMCSkWiLyBZDMkQ9HQvMEYtMuQHMVDcwdj8j6XPPQhkU870EKOJvugyOsoAuTkjiSKyxN15GU1V31oFKAfeTnhafopNppHHEWDnPoxASdo+nDUDXIliBl4QYOIo3SQq0LMIAiaSZxaJ1cI2gxicBTiKB/kahFJFByFOOmXK0ckUXAU4qRfrh6RRMFRiKN+mKsH7Q0UHE2rGvXDXD1iBk7QbKpRP8zVI2bgBY2pmuYlV4+YQRA0sYr0I2az3S137dHxfbH+8bhqd+3lcrdsDnP8dbl6OvyeaB/Z8+N5j/9F4jT3k5f+vDsi4FsEnRJUQvBvEYYunxgyZZi3ohg6bGJgynBveglviqHmjFih9v57exMfJCW4ouev6kdKVL8vaBcL+E/7nV7QkhU3KcTZvQXR/Gy7zf3VkcUY48V6td5kemB6Lpq7+P+hCTp6I3TGag3aqRCCxXhS9oSbQ27N318+31xfXh31DvlePz6ut92uHU1fkyGvHKBR0qPzKkB/4HWZ54mD60+F9tNAB/saLQTvrXWoAsqQ2P/y6fLqgjxcNvnjbv8nfw9Pq9XgAzR50OSCAtAyvhSU+YAKHySTDc47Q4IpGbfpMh9Y4cM5CWid1wGUtXErK/OhKnx47TVqhRqMVMoV10NXaaWp3FJZI70hT6U+TE0eJhh0yknqNXJUXHNb4YPqrb2VCqXTqlgpV5MFDZ30AZ2WJFqxUL7ChVFKoQLqKGc0qmIfoabgiCCBuha9JsWKfUDVlEuaO+qnAEg9hcX1gJoxp00kWG9DUI4clSdSM+Y02pqcaA/aKlNeEaiZc2WVshhkv2X58vmAmkFHY7SizSQ4p7WpKEnNpNuAfTIuaAO+PJGaSadBB2edpXRQQvkpBTXDDnQSWjRWauXBlW/vUDXuoKizaBwdnegGyjOpnHcTAjiQtMnL2VvJnw/DmnlHiVYG8qMdaCjPBGvmXdOuZTUVXgaqvCruLqwZeKCOstJQFjZImv1iJ0UDT2D38Lxcdfcj1iy+LVfbNr7Itne7V0/pe2yCDNzhhTXed9pfuZVfE4TdjYZ33dzCj+x56X3nZbo/HTIWzY/lbtMRtyEj3favB1qw2zy1+/S6cD5Ts0vW6aZmN5TTTc1udqebmt3fTjc1u+idbmp2Izzd1OySe7qp2S30HS16znY/Y7/DGRseztjxcMaWn3+zeIetMzb9/DvIO2ydse3nX1/esZ+ese/xnPv8Gft+/i2qxtbtfr//H4dpYs4=' );
  await addStaticPuzzle( 'simple-puzzle-partial', classicStyle, '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' );
  await addStaticPuzzle( 'simple-puzzle-complete', classicStyle, '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' );

  await addStaticPuzzle( 'notation-red-x', classicStyle, 'eJytWE1v2zgQ/S8888AZfvvWxC4Q7KIL1NteFjmosdIV4NqBrXhbBP7vO7Qt2aRpVGwFBIHE9/jmg8Oh6De2qzfbZr1iE+Dsy7raLNjkjbU/Xmo2YXfVtr47jPHAa5unessm/7yx72wiOPtx+L87vuzC255fYHDEIIdhhEGEyUgzxtQRw5ymjrB4njliMjfPRlg8zx0xlZvnIyyeByIKEGMQoggTEKMwElBGviagihxKQB05JGPQRA4loI0cSkAXOZSAcYZiEOMMqRiMM5SAcYYSMM5QAsYZUvtHzp6rbFGfq11w4Mjl40kJMhTgimuOHQUzFMUNt1x3FJmhGO6457ajqAxFkidUWgAdSWdISL5A4HUkkyFp8oaqCXqnbYZkyR+qKuiDd7ng4eAS2TQdzedo4uAUWe2TALl0BxL55Yja87I5lwfXyEHX83KJp9om36jasE8a5LIfArCcagv7vEFuCUIEjlOZYZ86yK1CiMBzqjik7BGTbduqrS+a6/3628uybutp1VbsWIefq+Xr8f1Mex+NX9ZreArEczmdrRw2/wVBpQRICN1anBkiZVwZkSkjYyVEXi++1vMwkIQ2o/FTVIFyjCo8BQ4pbNqTcNcZg9ZqEQ/K/dkc+zibsuBUqYgtFNE/Fbn78939Hz+TkTkZV+iLHUNE5UR8oYgbQySXWhRlIihyIlC8PrnUIpbK5L0plsmmFwvLH3PlXypCa5oRUYWe5Io/I3JonU1olR/rr/ShmvSQeQrF7GNPaRZh+RGNt8qjs2CRjqh/q+XzrO87Jbu8rFiGr4O4xb5Vz/T90mzn6+WuJuy5Wm7rMPRf3WwWXWQhf6FH36+X603mbDmPc/YUns8pU8YIbcBoZxHAyxNhflqevz79PX+Yzi7OJLK9fnlZb5u27qUfQu4dzScdq72VpBaibDLjiYGHDwP1U0c7fWO1dAKEpz+NWif6nz5MZ/dkYcryn4H7W/ZWr8tlZ8MigkCURhgk62kMN21AgQ2pnPbeayXRo8B0IW7awBIbUhrppXNSCoU4OFeywIaz0tFaGG00OG0Hx6EKbIQcSamV9QbQGz/Uhi6wgd4a5T0ooR2gHrzmpiRXSEWFnloVotI42IYtyhUtuQWhhZEaBQy14Uri8MZ6p8gESOPN4LryJXFQV1fOCeNEaCiDt2DJPqdlsJJKSlpthXSDaxdKNrpF661QUoFx1MgGJwtKdrr2CoD6CRikvju8m0DJVlfWOGuFpTC0BDncSMlex9DwPeUJrKajZPBeh0GbPRyuq121bBY91h2y9JFRP7UnS+kXSYJ03O4wDnfE+ntu5ucEie6T3Tmem/g+Gr9xR7y64L2d75zHiDn7VrWbhriMhQ+Ldyua0G5e63160RtPCseTurqf/rrU1UX216X0eFJmPCk7npQbT8qPWKJjlvuI9Q4jFvz1LzK/oTViycNv1fzjfr//H50bT2I=' );

  await addStaticRule( 'rule-two-black-to-red', classicStyle, DisplayTiling.SQUARE, 'vertex-2-exit-none/AAUH/wj/' );
  await addStaticRule( 'rule-two-red-to-black', classicStyle, DisplayTiling.SQUARE, 'vertex-2-exit-none/AAUI/wf/' );
  await addStaticRule( 'rule-three-red-to-red', classicStyle, DisplayTiling.SQUARE, 'vertex-2-exit-none/AAQI/wb/' );

  await addStaticClippedPuzzle( 'edge-clipped-puzzle', classicStyle, new Bounds2( -0.8, -0.8, 1.2, 1.2 ), 'eJytV8tu2zAQ/BeeeeDyTd/aPIBcWqBpeylyUGO2EODYga2kLQL9e5dWZJv0phFTXwyZM5zhPkhRT+wxrjftaslmwNn3VbOes9kT6/7cRzZj75tNfL8d44nXtbdxw2bfnthvNhOc/dn+Pg5/HtO/nh9gMGBAYTLDIMNUppljesAkpWkyLJ9nB0xR81yG5fN8tk6ZYSFbZ46ByBZTgJA5FmCeGpWDeW4KME9OAZrMswBt5qlz0GWeBegzzwIMmafubzj70ZA9tG8uwYFLrm6elYCgANfccDlSJEHR3HLHzUhRBEWhjedhpGiCItEGK+lHjiE4Bn2woCBGkiVIAZ2wsLALyxEkn7ywiLCLzFPBi60dLkyPtEDR1NbQcnC7VFLpTiS0RG+745E511vPgNSbHpls0zVdPDgrzlZ394vYxfOma9hQ56/N4mH4v6ddZuOH/ZCeEnHfF3uX7aY8IMiSoAqCeU3BlgRZEPyxRQo7zn/G6zRQxHWB488hJUoKaZulNmXlU/yJR2wx47qEcvZWgbNfsV3PLw4U0xLPVovVmkjsfpyz2/Q8ZLbFM10rE5yGIEFrb2R4JlwPsbGPXz5fX51fHBQEvVf396tN28Wd9BUKeXDgtJReSI1qLqWtJcYLg6sPE/XLhY76CoJ3DiGlQBpZ6n/5cH5xhg7njD5j+pf8lg+LxS4GI5wP2hjrjdZHMbzoATUeEIT0OmjvvNO2LMSLHrLCwzqrhHSgBXiL8Uz1UDUe2skQsBZKawkBpnroCg/wXlmLiQJhrFSTc2Vq4jAWqwDOp+IHNdXC1oQRQpAi2BAc1l5MDsNVtZWxBrcdaC+xcyeXw9ekCteutAJllAQhJm+PUJMrC2Cxt1JJlNLTt2DNPpfCW2O0tGCdxrxNNpm00RFsl4/Nop3vMDb70Sw2Mb0Q4m337FS+Dwpk5A7uw3Oi4+to3R29KONyno1Bv39z2RT3vwSAEJA1ApIQUDUCihAQNQKGENAHAvo1AU0I2BoBSwi4GgFHCJgaASoHrqoPqE4yNQpUDFDXi1QzQlUvkGFkq3g1lUC1Q7aK1yXIQKoKClRFIW/rdCdM9/T4mzpUvhZIdqcfr5PUxMtsfOo9/Wl/7x8OQ87umm7dIpehSLt5t8QJ3foh9sV1G04ndfRx8HYpdTopfTqpo4+bt0sdfQa9XcqdTuro2+vtUuGELXrKdv+vfr/p+/4vSE3vfA==' );
  await addStaticClippedPuzzle( 'edge-red-puzzle', classicStyle, new Bounds2( 2.2, 2.2, 4.2, 4.2 ), 'eJytWE1v2zgQ/S8688CZ4adv2yQFcmmBZtvLogdvohYC3DiwlWyLwP99h7YlmxSDkIkcILD1nub7UaSem6d2s+3W980CRPPverm5axbPTf/noW0WzYfltv2wvyYCr+9u222z+Oe5+d0spGj+7P8/HX48hV87cYbBAYMchhEGEUaRzRhTBwxzNnWExfeZA0a5+2yExfe5A6Zy9/kIi++DY2F0tjAQgcmdcWkwBuPaJGBcnATUUZYJaKJUEtBG0Sagi6KlGPRRtDGIMoo2ASGKNgExijYBKYo2AVUUrYpBHUWbgCaKNgHjCUrAeIQS0EfRxiDJKFodgxBFm4AYRZuAFEWbgCqKNgF1FK3efRfNj2V2TTgtFlKAQEHfj5YgQwGhhBY4UDBDUcIIK/RAoQzFCCe8sANFZShOsC5ZfX4g6QyJOFwWIYwhmwwJOWDWG4xB2wxJc8gQeAPJZUiWg2b9wZibz5B8iJqFCGasY67WvDyEyDnNMUPIFhxD8KxAcCMvV/WQITeGGyhHXq70IUkjWJcIIy9X/5CnFSxRHOsGuRbwwsFJsFpxrArkuhBIUrA2cSwx5BoRSJwEuz7VL9eLQOIk2Oo4RpBrRyBxEp6p49Dm+sFLCifBOqaxLpjrR8jUCFYtjXXGXD9CplawgOkkllw/QqZOsJZpHGLM9SNk6gXLmrh+zGy2/bJvzzYAF+tfD6u2by+X/bI5iP3bcvV4+H2ifYyuny8K4VsgnpR/8rJfm88I6jWCfo3gUwIkBHg1CHjVyTA5L3sZendiYMqgV21kqhE61N79bG/ChaQFV3z9WP1AOVQ/fAsctrDpj4aH7UCwdX8XXUTYndw1X64umxDUy0ZQzmAETM4IVkaSNWInRvYz3oWZ/tL+5F1vUsSbFIrZoaj8yPuv7TZ3V8ciB4uhbRfr1XqTkcXpumhuw/dDZzoO1SqpnLZKGURPYROxJ9wcA/789e+b68urMzmx7/XDw3rb9e1o+poNKY1aSu3IImm/f2Z308uJ+etPhdbTMAfzpEkS25YSAKRPw//66fLqgj1cNvlNwu4lf/ePq9WYAmpNZAw6UM5YKvUBFT40hiwMOQPeGV2cB9b4MMpbS2C1BIWqOA+q8AHSABI4MuAkKSj1oSp8OOcJFI+DklZBcRq6woW12hhutwSUypd6MDWFUlJap41HA4anuNSHrfDBIwuKZWE0OgcT8b3ow1X4IJaeJeU9eqWQimvlawSolfGGrfOfLB4pqNG4AW4GL1NoDLESyzVeI3KleYXyln1Z6VyxxqFK5N5KD7yKKHKA5XMFNSq3jjvO7Xaah8tQeSY1Mide8YmfGfwBklg8WVAjdF4MPVeJHyyajKJiiUCN1q3n+QWDVhrLa1e5kxqxk9QWDK8nykqJ5SqpEbt1PFySjPRGOmXLndSo3aKlsCYqRQQ8YsWPwhq981OQh1jzsij5yeuKhwtr9O64SgBKA+9crC7vO9YIXnHHHX/QG/6ocidVgueHuuMxlsSSV1C+PSkSPIPd/dNy1d2NWLP4sVxt27BTbm/7o6d0o5wgA3fYEYczZvs7d+e3BInOo8NmOnfjx+j6C2fMYQ7PTrLjmfWQsWh+LftNx9yGjXTbv+75hn7z2O7SY958pibHwbebmpwb325qcsB8u6nJmfntpsx8pux8piZH/rebmryjeMeIzjnuM847zDjwMOPEw4wjP31P9A5bMw49zDj10zdd77A149zjjHOPc67zM8799A3hO2y9a+6/73a7/wFzAfnf' );

  await addStaticRule( 'no-trivial-loop', classicStyle, DisplayTiling.SQUARE, 'square-0-0/AAoMEBES/w3/' );
  await addStaticRule( 'no-loop-a', classicStyle, DisplayTiling.SQUARE, 'square-0-0/AA4REv8JCw//' );

  await addStaticRule( 'basic-number-zero', classicStyle, DisplayTiling.SQUARE, 'square-0-0/AAD/CQsND/8=' );
  await addStaticRule( 'basic-number-one-black', classicStyle, DisplayTiling.SQUARE, 'square-0-0/AAEK/wsND/8=' );
  await addStaticRule( 'basic-number-one-red', classicStyle, DisplayTiling.SQUARE, 'square-0-0/AAEJCw3/EP8=' );
  await addStaticRule( 'basic-number-three-red', classicStyle, DisplayTiling.SQUARE, 'square-0-0/AAMJ/wwOEBMU/w==' );
  await addStaticRule( 'basic-number-two-black-a', classicStyle, DisplayTiling.SQUARE, 'square-0-0/AAIKDP8NDxL/' );
  await addStaticRule( 'basic-number-two-black-b', classicStyle, DisplayTiling.SQUARE, 'square-0-0/AAIKDv8LD/8=' );
  await addStaticRule( 'basic-number-two-red-a', classicStyle, DisplayTiling.SQUARE, 'square-0-0/AAIJC/8OEBT/' );
  await addStaticRule( 'basic-number-two-red-b', classicStyle, DisplayTiling.SQUARE, 'square-0-0/AAIJDf8MEP8=' );

  await addStaticRule( 'corner-one', classicStyle, DisplayTiling.SQUARE, 'square-0-0/AAER/wkP/w==' );
  await addStaticRule( 'corner-three', classicStyle, DisplayTiling.SQUARE, 'square-0-0/AAMR/woQ/w==' );
  await addStaticRule( 'corner-two-general', classicStyle, DisplayTiling.SQUARE, 'square-1-1/AAceIv8X/w==' );

  await addStaticRule( 'edge-three-one', classicStyle, DisplayTiling.SQUARE, 'square-1-1/AAEIHv8dEhT/' );
  await addStaticRule( 'edge-one-one', classicStyle, DisplayTiling.SQUARE, 'square-1-1/AAEGHv8Q/w==' );

  await addStaticRule( 'three-three-diagonal', classicStyle, DisplayTiling.SQUARE, 'square-1-0/AAMI/xUXGyEiJCb/' );
  await addStaticRule( 'three-three-adjacent', classicStyle, DisplayTiling.SQUARE, 'square-1-1/AAMI/xEVGR4f/w==' );
  await addStaticRule( 'three-incident-line', classicStyle, DisplayTiling.SQUARE, 'square-1-0/AAgT/xshGCIm/w==' );
  await addStaticRule( 'two-spiked-red', classicStyle, DisplayTiling.SQUARE, 'square-0-0/AAILEf8KEA3/' );
  await addStaticRule( 'two-spiked-black', classicStyle, DisplayTiling.SQUARE, 'square-0-0/AAIMEf8OCQ8T/w==' );
  await addStaticRule( 'three-two-red', classicStyle, DisplayTiling.SQUARE, 'square-1-0/AAIIFP8XGyEiJv8=' );
  await addStaticRule( 'two-two-red', classicStyle, DisplayTiling.SQUARE, 'square-1-0/AAcTGv8hGCL/' );
  await addStaticRule( 'one-incident', classicStyle, DisplayTiling.SQUARE, 'square-1-1/AAYXHv8YGv8=' );
  await addStaticRule( 'one-anti-incident-a', classicStyle, DisplayTiling.SQUARE, 'square-1-1/AAYYGh7/F/8=' );
  await addStaticRule( 'one-anti-incident-b', classicStyle, DisplayTiling.SQUARE, 'square-1-0/AAYTGiD/GCL/' );


} )();
