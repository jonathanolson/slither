import '../index.css';

import { Circle, Display, Node, Path } from 'phet-lib/scenery';
import PuzzleNode from './view/puzzle/PuzzleNode.ts';
import { getBasicColoringPuzzleStyleWithTheme, getBasicLinesPuzzleStyleWithTheme, getClassicPuzzleStyleWithTheme, getClassicWithSectorsPuzzleStyleWithTheme, getPureColoringPuzzleStyleWithTheme, getSectorsWithColorsPuzzleStyleWithTheme } from './view/puzzle/puzzleStyles.ts';
import { lightTheme } from './view/Theme.ts';
import { TPuzzleStyle } from './view/puzzle/TPuzzleStyle.ts';
import { PatternRule } from './model/pattern/pattern-rule/PatternRule.ts';
import { EmbeddedPatternRuleNode } from './view/pattern/EmbeddedPatternRuleNode.ts';
import { DisplayTiling } from './view/pattern/DisplayTiling.ts';
import { getBestDisplayEmbedding } from './view/pattern/getBestDisplayEmbedding.ts';
import { Bounds2 } from 'phet-lib/dot';
import { Shape } from 'phet-lib/kite';
import { standardSquareBoardGenerations, vertexNonExit4PatternBoard } from './model/pattern/pattern-board/patternBoards.ts';
import { FeatureSet } from './model/pattern/feature/FeatureSet.ts';
import { SectorOnlyOneFeature } from './model/pattern/feature/SectorOnlyOneFeature.ts';
import { FaceFeature } from './model/pattern/feature/FaceFeature.ts';
import { RedEdgeFeature } from './model/pattern/feature/RedEdgeFeature.ts';
import { BlackEdgeFeature } from './model/pattern/feature/BlackEdgeFeature.ts';
import { BooleanProperty } from 'phet-lib/axon';
import { PatternRuleNode } from './view/pattern/PatternRuleNode.ts';
import { planarPatternMaps } from './model/pattern/pattern-board/planar-map/planarPatternMaps.ts';
import { Panel } from 'phet-lib/sun';
import { puzzleFromCompressedString } from './model/puzzle/puzzleFromCompressedString.ts';

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
const classicWithSectorsStyle = getClassicWithSectorsPuzzleStyleWithTheme( lightTheme );
const basicLineStyle = getBasicLinesPuzzleStyleWithTheme( lightTheme );
const basicColorStyle = getBasicColoringPuzzleStyleWithTheme( lightTheme );
const pureColorStyle = getPureColoringPuzzleStyleWithTheme( lightTheme );
const sectorColorStyle = getSectorsWithColorsPuzzleStyleWithTheme( lightTheme );

const redLinesVisibleColorsStyle = {
  ...basicColorStyle,
  redLineVisibleProperty: new BooleanProperty( true ),
};

const puzzleScale = 40;

const serializedToBinary = ( str: string ): string => {
  return PatternRule.deserialize( JSON.parse( str ) ).getBinaryIdentifier();
};

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

const addStaticPuzzle = async ( id: string, style: TPuzzleStyle, puzzleString: string, additionalNode?: Node ) => {

  const puzzle = puzzleFromCompressedString( puzzleString )!;

  const puzzleNode = new PuzzleNode( puzzle, {
    scale: puzzleScale,
    style: style,
    noninteractive: true,
  } );

  const node = additionalNode ? new Node( {
    children: [
      puzzleNode,
      new Node( {
        children: [ additionalNode ],
        scale: puzzleScale,
      } ),
    ]
  } ) : puzzleNode;

  staticNodeWithIdentifier( node, id );
};

const addStaticClippedPuzzle = async ( id: string, style: TPuzzleStyle, clipBounds: Bounds2, puzzleString: string ) => {

  const puzzle = puzzleFromCompressedString( puzzleString )!;

  const container = new Node( {
    scale: puzzleScale,
    clipArea: Shape.bounds( clipBounds ),
    localBounds: clipBounds,
    children: [
      new PuzzleNode( puzzle, {
        style: style,
        noninteractive: true,
      } )
    ]
  } );

  staticNodeWithIdentifier( container, id );
};

const addStaticRule = async ( id: string, style: TPuzzleStyle, displayTiling: DisplayTiling, ruleBinaryIdentifier: string ) => {

  const rule = PatternRule.fromBinaryIdentifier( ruleBinaryIdentifier );

  const displayEmbedding = getBestDisplayEmbedding( rule.patternBoard, displayTiling )!;

  const node = new EmbeddedPatternRuleNode( rule, displayEmbedding, {
    scale: puzzleScale,
    style: style,
  } );

  staticNodeWithIdentifier( node, id );
};

const addStaticPatternRule = async ( id: string, ruleBinaryIdentifier: string ) => {

  const rule = PatternRule.fromBinaryIdentifier( ruleBinaryIdentifier );

  const node = new PatternRuleNode( rule, planarPatternMaps.get( rule.patternBoard )!, {
    scale: puzzleScale / 30,
  } );

  staticNodeWithIdentifier( new Panel( node, {
    fill: '#333',
  } ), id );
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

  await addStaticPuzzle( 'annotated-simple-0', classicStyle, 'eJytVstu4jAU/RevvfD185rdtFCpm440TLsZscgUt4pEAUHKtEL597EJAWyMJukgJJT4HJ/j+7CdLdm41bpczMkAKPm9KFZTMtiS6nPpyIDcFGt3sxujgVeVz25NBr+25IMMGCWfu/9N87IJbzU9waDBIIfxCIMIE5FmjMkG4zlNFWHxPN1gIjfPRFg8D6N18giz0TpjDFi0mASEyDEB49SIGIxzk4BxchJQRZ4JqCNPGYMm8kxAjDwT0Eaesp5Q8lJke+jYXIwC5VRM9kqQoQCVVFHeUniGIqmmhqqWIjIU4W2Q2pYiMxTubXwlseWoDEd5H19QYC1JZ0jWO/nCwiEskyFh8PJFhENkmAue7ez8wmRLszma2BlqCuaQyly6A8lbem994GVzLnee1lMntWeSdVVU7uSsuF28LWeucsOiKkhT56di9t68H2l30fhpP4SnQDwW/eiy25QnBPkvgkoJIiGYlMASQputU4kQt5u+unEYSAIb+fF9TIESYtqlqQxp+eFe/RmbzBinUMzeKVDyx5Wr6ehEMazxdjFbrDKZPY5T8hyem9SW/lA3KBUzyhjJFNNG7AnjJjby/fHn+H44OqmI914sl4t1WbmD9L0X4hy5F/E/RI5oQ97KzHhicP/QUT9daKtvOEMUFtFosIpBov/4MBzdeochyR8y9SW/+fts1npooxlKkCgZQxtOvm4e0MtDGDBcKOFDBKm6evA+HqAMNyAUgmVSpcW+6CF6eChlfbqk1WgUCuwch+zhIbQFrphV1oLlIu2pix6qhweA0tyXXVmOUsjOudI9PBARjJQMtEQhVOfeNX1y5fODSvqah23DO/cu9ukrxozffloKKyTqzh62Tz24sob7Xc6E0sx2rgf02eiCcUAFqK1grEfzQqed7sFyvilm5fSAkcFLMVu7cCO452rvlF4ICdJy25M/XMfuIzfzKUGiq7u9NHIT76LxC9fx2U24PV7vTcSUvBXVqvRc4kXK9be5n1Ct3l2d3qrXk+LXkxLXkzr7Mvm61Nk3zNel9PWkzj6cvi6F15OyV2zRa7b7f/X7pK7rvw3bs8M=' );
  await addStaticPuzzle( 'annotated-simple-1', classicStyle, 'eJytVstu4jAU/RevvfD185rdTKFSNx2pTLsZdZEpaRWJQgUp06rKv881IYBdo0k6CAklPsfn+D7s+INtytW6Wi7YCDj7vSxWMzb6YPX7S8lG7HuxLr9vx3jg1dVDuWajXx/sjY0EZ+/b/037sglvDT/CoMUgh8kIgwhTkWaM6RaTOU0TYfE822IqN89FWDwPo3XKCPPROmMMRLSYBITIMQHj1KgYjHOTgHFyEtBEngloI08dgy7yTECMPBPQR566uefsscj20KG5BAcuubrfKUGGAlxzw2VHkRmK5pY7bjqKylAU2SD3HUVnKJJsqJLYcUyGY8iHCgqiI9kMyZMTFRb2YbkMCYMXFRH2kWEueLG1o4XpjuZzNLU1tBzcPpW5dAcSWZK33fOyOddbT0/U+4aYbF0XdXl0Vlwsn1/mZV2Oi7pgbZ3vivlr+36gXUbjx/0QngLxUPSDy3ZTHhH0vwgmJaiE4FKCSAhdto4lQtzl7KmchoEksAmN72IKlDam8BQ4pLCqd8K7gyVILWbRGIjm4MZuJmMW1jRQQw7TAJET0QNFZD+Rbd9UoU9uyif66CQpnKZQzA4ppRPkT1mtZpNdioNiKNrFcr5cZVrtMM7ZQ3hu61LRUh1qI5xxTgsjrFM7wnS34B+3P6dX48lRi5L38uVlua7qci99RUJSoiQR+iFKRB9yVWXGE4Or65766UI7fScFovKIzoI3AhL92+vx5IIcxix/6jan/Bav83nnYZ0VqEGjFgJ9+BT084BBHsqBk8ooChG06eshh3iAcdKBMgheaJMW+6SHGuBhjKd0aW/RGVTYOw49wENZD9IIb7wHL1XaUyc9zAAPAGMlld14iVrp3rmyAzwQEZzWAqxGpUzv3nVDckX5QaOp5mHbyN69i0P6SghH289q5ZVG29vDD6mHNN5J2uVCGSt873rAkI2uhAQ0gNYrIQY0L/Ta6QRWi00xr2Z7jI0ei/m6DF+E8qHeOaUfhATpuN3JH+4n5Vtu5l2CRHeZ7qORm3gZjZ+4n3y6Gnwc7jttxJw9F/WqIi4jkWr9bUET6tVr2aTXjPNJyfNJqfNJfbqqfV3q06Xu61L2fFKfbpJfl8LzSfkztug52/2/+v2+aZq/1eYDCA==' );
  await addStaticPuzzle( 'annotated-simple-2', classicStyle, 'eJy1VstuEzEU/RevvfDb19nRJkgVqEgNsEFdDI0LIw1JlUwDqJp/5zqTSWLXFeMSVKnK+Byf4/vw44ls/XpTr5Zkwin5uqrWCzJ5Iu3vB08m5KLa+IvdGA28tr7zGzL58kR+kQmj5Pfu/7b/2Iavjp5gvMd4DhMRxiNMRpoxpnpM5DR1hMXzTI/J3DwbYfE8iNYpIsxF64wxzqLFJCCPHBMwTo2MwTg3CRgnJwF15JmAJvJUMWgjzwSEyDMBXeSpultK7qtsDx2bi1FOBZW3eyWeoXCqqKZioIgMRVFDLdUDRWYoEm2AuoGiMhSBNlhJGDg6w9HogwXlbCCZDMmhExaWH8KyGRIELywiP0QGueDZzg4Xpgaay9HkztBQbg+pzKU7kNASvc2Bl8252nk6pN52yCSbtmr9yVlxufrx0PjWT6u2In2dP1fNY/99pL2Nxk/7IfwKxGPRjy67TXlCUH8j6JQgE4JNCSwhDNk6lQhx+8U3Pw8DSWAzHN/HFCh9TOFX4KDCut0L7w+WILVcRGOcdUc3cjObkrCmQg1RpsFZTkQVioj/JmJORS7ev7l89zcZlZOBYhkzVma3GerQ/Df+G96kSV/MUyhm931SL4KjtQ40d0wL4Rx28PequZ8deqkkY2URZdnZ5sKS4hleb+arZusRu6+ajQ9DP329XgxrDRkJO+ly1azWmf1/HKfkLvw+JsGC0sxqaxXTzFi5J8z3Kf/w6eP8ajo7OTfQe/XwsNrUrT9IX6GQECBQBP8ABIALUdaZ8cTg6nqkfrrQQd8KBiAdgDXcacYT/U/X09klOkxJ/irsXvJbPjbN4GGsYaC4AsUYuHA/j/PgRR7SciuklhgiV3qshyjx4NoKy6UGbHql02K/6CELPLR2mC7lDFgNEkbHoQo8pHFcaOa0c9wJmfbUix66wINzbQSWXTsBSqrRuTIFHgDArVKMGwVS6tG9a0tyhfkBrbDmYduI0b0LJX3FmMXtZ5R0UoEZ7eFK6iG0swJ3OZPaMDe6Hrxko0smON4IYJxkrKB5+aidHk7y5bZq6sUBG050vKP8Xbt3Si+0BBm4w8kfHo3+V27m5wSJHpjDpZGb+DYaf+HR+Oy99nR8hPYRU/Kjatc1cgkJt9ibJU5o14++S99+55MS55OS55N69n5+vdSzl/brpcz5pJ49718vBeeTcmds0XO2+z/1+23XdX8ACwJ3vg==' );
  await addStaticPuzzle( 'annotated-simple-3', classicStyle, 'eJy1V1tv0zAY/S9+9oPv/tw3thZpAoFEgRe0h7B6ECm0U5sV0JT/zuemaWvXE/EomjQlPifn+Lv40iey9etNvVqSCafk66paL8jkibS/HzyZkKtq4692YzTw2vrOb8jkyxP5RSaMkt+7/9v+ZRveOnqC8R7jOUxEGI8wGWnGmOoxkdPUERZ/Z3pM5r6zERZ/B9E8RYS5aJ4xxlk0mQTkkWMCxqmRMRjnJgHj5CSgjjwT0ESeKgZt5JmAEHkmoIs8VXdLyX2V7aFjczHKqaDydq/EMxROFdVUDBSRoShqqKV6oMgMRaINUDdQVIYi0AYrCQNHZzgafbCgnA0kkyE5dMLC8kNYNkOC4IVF5IfIIBc829nhxNRAczma3Bkayu0hlbl0BxJaorc58LI5VztPh9TbDplk01atP9krrlc/Hhrf+mnVVqSv8+eqeezfj7TX0fhpP4SnQDwW/eiyW5QnBPU3gk4JMiHYlMASwpCtU4kQt1988/MwkAQ2w/F9TIHSxxSeAgcV1u1eeL+xBKnlIhrjrDu6kQ+zKQlzKtQQZRqc5URUoYj4byLmVOTq7avrN3+TMTkZWzgXlROBy8ylXCZbaHcW0m5Z1mEZfvDf8ExPOnSeQjG779h6EaZtrQPNHdNCOIdr6XvV3M8OXV1Su7K0jI8emwtPk3ozXzVbj9h91Wx8GPrp6/VimGvISFjT16tmtc7sRMdxSu7C8zEJFpRmVlurmGbGyj1hvk/4+08f5zfT2ckOht6rh4fVpm79QfoGhYQAgSL4ByAAXIiyzownBjfvRuqnEx30rWAA0gFYw51mPNH/9G46u0aHKckfyt1zfsvHphk8jDUMFFegGAMXbgrjPHiRh7TcCqklhsiVHushSjy4tsJyqQGbXum02M96yAIPrR2mSzkDVoOE0XGoAg9pHBeaOe0cd0KmPfWshy7w4FwbgWXXToCSanSuTIEHAHCrFONGgZR6dO/aklxhfkArrHlYNmJ070JJXzFmcfkZJZ1UYEZ7uJJ6CO2swFXOpDbMja4HL1nokgmOJwIYJxkraF4+aqWHnXy5rZp6ccCGHR3PKH/X7p3SAy1BBu6w84frq/+V+/JzgkRX3eHQyH34Ohp/5vp6dnN8Ol6H+4gp+VG16xq5hIRT7NUSP2jXj75Lb6GXkxKXk5KXkzq7yb9c6uzO/3Ipczmpsx8aL5eCy0m5C7boJdv9n/r9tuu6Pw0vn7A=' );
  await addStaticPuzzle( 'annotated-simple-4', classicStyle, 'eJy1V01v2zgQ/S8888BvDn1rYhcIuugC9baXRQ5qzLQCVDuwFW+LQP99h5ZlmzSDilktDBgS3+N7nOHwQy9k77e7erMmM07J1021XZHZC2l/PXkyIzfVzt8c2mjgtfWD35HZ3y/kJ5kxSn4d/vf9yz68dfQC4z3Gc5iIMB5hMtKMMdVjIqepIyzuZ3pM5vrZCIv7QTROEWEuGmeMcRYNJgF55JiAcWpkDMa5ScA4OQmoI88ENJGnikEbeSYgRJ4J6CJP1d1T8lhla+hcXIxyKqi8PyrxDIVTRTUVA0VkKIoaaqkeKDJDkWgD1A0UlaEItMGZhIGjMxyNPjihnA0kkyE5dMKJ5aewbIYEwQsnkZ8ig1zw7GCHA1MDzeVo8mBoKLenVObSHUhoid7mxMvmXB08HVLvO2SSXVu1/mKvuN38eGp86+dVW5F+nr9UzXP/fqa9j9ov6yE8BeJ50s8uh0V5QVC/I+iUIBOCTQksIQzZupQIcfvVN78MDUlgC2w/xhQofUzhKXBQYdsehY8bS5Bar6I2zrqzG/m0mJMwpkINUabBWU5EFYqI/03EXIrc/PHu9sPvZExOxhaORU4honIiME1A5TI6J+MKQ8qW3LXIYYOow4bwyX/D20WyVpYpFLP7tVOvQuzWOtDcMS2Ec7iqv1fN4+K0vkqqqCy346PHMsdzrd4tN83eI/ZYNTsfmv7x9XY1jDVkJOwut5tms83sied2Sh7C8zkJFpRmVlurmGbGyiNheUz4n5//Wt7NFxd7KXpvnp42u7r1J+k7FBICBIrgD0AAuBBlnWlPDO4+jtRPBzroW8EApAOwhjvNeKL/+eN8cYsOc5K/HnSv+a2fm2bwMNYwUFyBYgxcuLOM8+BFHtJyK6SWGCJXeqyHKPHg2grLpQYseqXTyX7VQxZ4aO0wXcoZsBokjI5DFXhI47jQzGnnuBMyralXPXSBB+faCJx27QQoqUbnyhR4AAC3SjFuFEipR9euLckV5ge0wjkPy0aMrl0oqSvGLC4/o6STCsxoD1cyH0I7K3CVM6kNc6Png5csdMkExxMBjJOMFRQvH7XSw06+3ldNvTphw46OZ5R/aI9O6YGWIAN32PnDRdr/zPX8kiDRpXs4NHId30ftr1ykr+6wL+eLeR8xJT+qdlsjl5Bwir1bY4d2++y79D48nZSYTkpOJ3X1TfF2qauvj7dLmemkrj553i4F00m5CUt0ynL/T/V+33Xdv1Dex5w=' );
  await addStaticPuzzle( 'annotated-simple-5', classicStyle, 'eJytV01v2zgQ/S8888BvDn1rYhcIdtEF6m0vixy0MdMVoNqBrXhbBPrvO7Qs26RpVMwKAQKL7+k9zgyHFN/I3m939WZNZpySvzfVdkVmb6T9+eLJjNxVO393GKOB19ZPfkdmf72RH2TGKPl5+L/vH/bhqaMXGO8xnsNEhPEIk5FmjKkeEzlNHWHxe6bHZO49G2HxexDNU0SYi+YZY5xFk0lAHjkmYJwaGYNxbhIwTk4C6sgzAU3kqWLQRp4JCJFnArrIU3WPlDxX2TV0XlyMciqofDwq8QyFU0U1FQNFZCiKGmqpHigyQ5FoA9QNFJWhCLTBSsLA0RmORh8sKGcDyWRIDp2wsPwUls2QIHhhEfkpMsgFzw52ODE10FyOJg+GhnJ7SmUu3YGEluhtTrxsztXB0yH1sUMm2bVV6y/2ivvN95fGt35etRXp6/y1al775zPtYzR+uR7Cr0A8F/3scmjKC4L6FUGnBJkQbEpgCWHI1qVEiNuvvvllGEgCW+D4MaZA6WMKvwIHFbbtUfi4sQSp9Soa46w7u5HPizkJcyrUEGUayM+IyEuRu98/3P/2KxmWk1FTzKVUROVEdHFA2bmYYhmTk7GFIckpRLJ5gWkCKpfRORlXGFK2Aa5FDttVHbanz/4bfusknbtMoZjdd3K9CrFb60Bzx7QQzuEe80/VPC9O3T62cqFFy9ZcWSXG50rdYt9qIjzB691y0+w9Ys9Vs/Nh6F9fb1dDHkK2wz56v2k228zufx6n5Cn8PifYgtLMamsV08xYeSQsj8X848ufy4f54uLUQO/Ny8tmV7f+JP2AQkKAQBH8AxAALkRZZ8YTg4dPI/XTiQ76VjAA6QCs4U4znuh/+TRf3KPDnOQ/hLpbfuvXphk8jDUMFFegGAMXvs7GefAiD2m5FVJLDJErPdZDlHhwbYXlUgM2lNJpsW96yAIPrR2mSzkDVoOE0XGoAg9pHBeaOe0cd0Kma+qmhy7w4FwbgWXXToCSanSuTIEHAHCrFONGgZR69Nq1JbnC/IBWWPPQNmL02oWSdcWYxfYzSjqpwIz2cCX1ENpZgV3OpDbMja4HL2l0yQTH0waMk4wVLF4+qtPDTr7eV029OmHDjo7nn39qj07pYZkgA3fY+cOVwf/Ivfk1QaLrxXBo5F78GI3fuDJcfa2/na8gfcSUfK/abY1cQsIp9mGNL7TbV9+lX/7TSYnppOR0Ule3p/dLXd2z3i9lppO6uty9Xwqmk3ITLtEpl/v/Wu+PXdf9B8rqCok=' );
  await addStaticPuzzle( 'annotated-simple-6', classicStyle, 'eJytV11v2zYU/S985gMvv+m3JnaBYEMH1GtfhjxoMdMJUO3AVrwWgf77Li3LNmkaFTMhQGDxHJ6j+0FSfCN7v93VmzWZASV/b6rtiszeSPvzxZMZuat2/u4wRgOvrZ/8jsz+eiM/yIxR8vPwf98/7MNTRy8w6DHIYTzCIMJEpBljssd4TlNFWDxP95jIzTMRFs+z0XvyCHPRe8YYsOhlEhAixwSMUyNiMM5NAsbJSUAVeSagjjxlDJrIMwFt5JmALvKU3SMlz1W2h87NxShQTsXjUQkyFKCSKsoHCs9QJNXUUDVQRIYi0MZSN1BkhsLRBitpB47KcBT6YEGBDSSdITl0wsLCKSyTIdnghUWEU2Q2Fzw72OGLyYHmcjRxMNQUzCmVuXQHElqitz7xsjmXB0+H1McOmWTXVq2/2CvuN99fGt/6edVWpK/z16p57Z/PtI/R+GU/hF+BeC762eWwKC8I8lcElRJEQjApgSWEIVuXEiFuv/rml2EgCWyB48eYAqWPKfwKHFTYtkfh48YSpNaraAxYd3YjnxdzEt6pUIOXaSA/IyIuRe5+/3D/2y9k3CQqwHIycoqISkUgJ6KKA5LTyGRD0sUyOidjCjMjphDJ5sVOE1C5jMrJuMKQsqvxWuSwd9Zhr/zsv+GHV7KNLFMoZvfbSr0KsRvjrALHFOfO4Yb3T9U8L05bT8EaHV9mfot9s0HLyjY+sfIW++aKG1956MKXSr1bbpq9R+y5anY+DP3r6+1qSHEoZDgv7jfNZps55c7jlDyF3+faGSsVM8oYyRTTRhwJy2Of/PHlz+XDfHFxOqL35uVls6tbf5J+QCHOLUcR/LOWW+tClHVmPDF4+DRSP33RQd9wZq1w1hoNTjFI9L98mi/u0WFO8h983S2/9WvTDB7aaGYlSCsZsy58hY7zgCIPYcBwoQSGCFKN9eAlHqAMNyCUxbUqVVrsmx6iwEMph+mSTlujrLCj45AFHkI74Io55Rw4LtKeuumhCjwAlOZYduW4lUKOzpUu8LDWgpGSgZZWCDW6d01JrjA/VkmseVg2fHTv2pK+Yszg8tNSOCGtHu3hSurBlTMcVzkTSjM3uh5QstAF44AHmdVOMFbQvDBqpYedfL2vmnp1woYdHY9W/9QendJzOEEG7rDzh6uR/5Gb+TVBomvUcGjkJn6Mxm9cja5uJW/nq1YfMSXfq3ZbI5eQcIp9WOOEdvvqu/SGM50Un05KTCd1dUt8v9TVffL9Uno6qatL7Pul7HRSbsIWnbLd/1e/P3Zd9x+KiE0N' );
  await addStaticPuzzle( 'annotated-simple-7', classicStyle, 'eJytV8tu2zoQ/ReuueCbQ++a2AWCFi1Q33ZTZKEbK60A1Q5sxbdFoH/v0LJsk6YQMVcwYEicw3M4Dw7FF7Ivt7tqsyYzTsm/m2K7IrMX0vx5KsmM3BS78uYwRj2uqR7KHZl9fyG/yYxR8ufwv+9e9v6tpRc23tl4yiYCGw9sMuAMbaqziRSnDmzhPNPZZGqeDWzhPAjWKQKbC9YZ2jgLFhMZeaAYGcPQyNAYxiYyhsGJjDrQjIwm0FSh0QaakRECzcjoAk3V3lPyWCRr6FxcjHIqqLw/MvEEhFNFNRU9RCQgihpqqe4hMgGRKAPU9RCVgAiUwUxCj9EJjEYdTChnPcgkQA6VMLH85JZNgMBrYRL5yTNIOc8Ocrgw1cNcCiYPgoZyewplKtwehJKobU64ZMzVQdMh9L5FJNk1RVNe9Irbza+numzKedEUpMvzt6J+7t7PsPfB+GU9+CcPPCf9rHLYlBcA9RpAxwAZAWwMYBGgj9Ylhfe7XP0ol34gcmyB40efPKTzyT95DDJsmyPxsVl5qvUqGOOsPauRm4/vbj8Qv6phFniV5cti/goHZykSPslSROZSRIpE5i7FTcKSjouawqNcEp4i0dkOqWloki6ZbBqTorGZkZFTkCTjAtM4lE+T7Awu06XkbrwmOTTyyjfuL+UP/AqMetoyNoXorsdVK++7tQ40d0wL4Rx2359F/bg49cGMPTo+zWIIPVigeWkbH1g1hB7cceMzz4fQyabAhtCpZoYLwS+yarfc1PsSTY9FvSv90H9ltV312fM14s/F20292SZO8/M4JQ/++VwWFpRmVlurmGbGyiNgeSzBz1//Wd7NFxdfAai9eXra7KqmPFHfIZEQIJAEfwACwHknq8R4JHD3aSR/vNCe3woGIB2ANdxpxiP+r5/mi1tUmJP0h207pLd+rutew1jDQHEFijFw/mt7nAbP0pCWWyG1RBe50mM1RI4G11ZYLjVgG1A6TvaghszQ0NphuJQzYDVIGO2HytCQxnGhmdPOcSdkXFODGjpDg3NtBKZdOwFKqtGxMhkaAMCtUowbBVLq0bVrc2KF8QGtMOd+24jRtQs5dcWYxe1nlHRSgRmt4XLyIbSzAnc5k9owNzofPGejSyY4npFgnGQso3j5qJ3uO/l6X9TV6mTrOzqe2uVDc1SKj/jI0mP7zu+vgOXv1MxvkSW4LvaHRmri+2B84Ap4dft6OV8pO48p+VU02wqxhPhT7N0aJzTb57KNb3LTUYnpqOR0VFe34bdTXd2b305lpqO6uqy/nQqmo3ITluiU5f6/6v2+bdu/aASPeQ==' );
  await addStaticPuzzle( 'annotated-simple-7a', classicStyle, 'eJytV8tu2zoQ/ReuueCbQ++a2AWCFi1Q33ZTZKEbK60A1Q5sxbdFoH/v0LJsk6YQMVcIEFicw3M4Dw7JF7Ivt7tqsyYzTsm/m2K7IrMX0vx5KsmM3BS78uYwRj2uqR7KHZl9fyG/yYxR8ufwf9997P1XSy9svLPxlE0ENh7YZMAZ2lRnEylOHdjCeaazydQ8G9jCeRCsUwQ2F6wztHEWLCYy8kAxMoahkaExjE1kDIMTGXWgGRlNoKlCow00IyMEmpHRBZqqvafksUjW0Lm4GOVUUHl/ZOIJCKeKaip6iEhAFDXUUt1DZAIiUQao6yEqAREog5mEHqMTGI06mFDOepBJgBwqYWL5yS2bAIHXwiTyk2eQcp4d5HBhqoe5FEweBA3l9hTKVLg9CCVR25xwyZirg6ZD6H2LSLJriqa86BW3m19PddmU86IpSJfnb0X93H2fYe+D8ct68L888Jz0s8phU14A1GsAHQNkBLAxgEWAPlqXFN7vcvWjXPqByLEFjh998pDOJ//LY5Bh2xyJj83KU61XwRhn7VmN3Hx8d/uB+FUNs8CrLF8W81c4bIqD53Fw9irJm90RmUsRKRKZuxQ3CUs6LmoKj3JJeIpEZzukpqFJumSyaUyKxmZGRk5BkowLTONQPk2yu7hMl5K78ZrkcBhUvvl/KX/gTTLqi8vYFKK7PlmtvO/WOtDcMS2Ec9jBfxb14+LUSzP26Pg0iyH0YIHmpW18YNUQenDHjc88H0InmwIbQqeaGS4Eb3XVbrmp9yWaHot6V/qh/8pqu+qz52vEn623m3qzTdwIzuOUPPjf57KwoDSz2lrFNDNWHgHLYwl+/vrP8m6+uLhJoPbm6Wmzq5ryRH2HREKAQBL8AxAAzjtZJcYjgbtPI/njhfb8VjAA6QCs4U4zHvF//TRf3KLCnKQvx+2Q3vq5rnsNYw0DxRUoxsD5G/s4DZ6lIS23QmqJLnKlx2qIHA2urbBcasA2oHSc7EENmaGhtcNwKWfAapAw2g+VoSGN40Izp53jTsi4pgY1dIYG59oITLt2ApRUo2NlMjQAgFulGDcKpNSja9fmxArjA1phzv22EaNrF3LqijGL288o6aQCM1rD5eRDaGcF7nImtWFudD54zkaXTHA8I8E4yVhG8fJRO9138vW+qKvVydZ3dDy1y4fmqBQf8ZGlx/ad3z8jy9+pmd8iS/Dk7A+N1MT3wfjAM/LqBfdyfpZ2HlPyq2i2FWIJ8afYuzVOaLbPZRu/BqejEtNRyemorl7Ub6e6enu/ncpMR3X14H87FUxH5SYs0SnL/X/V+33btn8BhlOjOg==' );
  await addStaticPuzzle( 'annotated-simple-7b', classicStyle, 'eJytWMtu2zgU/ReuueDlm941sQsELVqgnnZTZKGJlVaAage24mkR6N97aVm2SVOImBECBDbP0Tm8D5KiX8i+3O6qzZrMgJJ/N8V2RWYvpPnzVJIZuSl25c1hjHpeUz2UOzL7/kJ+kxmj5M/h/777svffWnqBQYdBCuMBBgEmAs0Qkx3GU5oqwMLndIeJ1HMmwMLnbDBPHmAumGeIAQsmE4EQOEZgmBoRgmFuIjBMTgSqwDMCdeApQ9AEnhFoA88IdIGnbO8peSySPXRuLkaBciruj0qQoACVVFHeU3iCIqmmhqqeIhIUgTaWup4iExSONlhJ23NUgqPQBwsKrCfpBMmhExYWTmGZBMl6LywinCKzqeDZwQ4nJnuaS9HEwVBTMKdUptLtSWiJ3vrES+ZcHjwdUu9bZJJdUzTlxV5xu/n1VJdNOS+agnR1/lbUz933M+19MH7ZD/6TJ56LfnY5LMoLgnyNoGKCiAgmJrCI0GfrUsLHXa5+lEs/EAW2wPFjTJ7SxeQ/eQ4qbJuj8HGz8lLrVTBm2rMZufn47vYD8ZPKEwGWq2JfVfmymL+iYVIakKcB7FWRN4fDM6fCUyIidypuEpV0XuQUEeWKQEpEZQckp5FJhqSzZXRKxmRmRkwhksyLnSagfJnk7uIyQ0quxmuRw4lS+RPkS/kDX0ejzXUZQyG722yrlY/dGGcVOKY4dw6PgZ9F/bg4bcgZa3R8mfkQe7BB88o2PrFyiD244sZXHobYyU2BDbFTm9nQRAYOSXyNrHbLTb0vEXos6l3ph/4rq+2qr7TvJ3+Y327qzTbxCnIep+TBfz63kLFSMaOMkUwxbcSRsDy26+ev/yzv5ouLVxf03jw9bXZVU56k71CIc8tRBP+s5dY6H2OVGI8M7j6N1I8n2usbzqwVzlqjwSkGkf7XT/PFLTrMSfptvB3yWz/Xde+hjWZWgrSSMev8FWGcB2R5CAOGCyUwRJBqrAfP8QBluAGhLG4ZUsXFHvQQGR5KOUyXdNoaZYUdHYfM8BDaAVfMKefAcRH31KCHyvAAUJpj2ZXjVgo5Olc6w8NaC0ZKBlpaIdTo3jU5ucL8WCWx5n7Z8NG9a3P6ijGDy09L4YS0erSHy6kHV85wXOVMKM3c6HpAzkIXjAOep1Y7wVhG88Kole538vW+qKvVCet3dDzhy4fm6BS/DkRIz+13fn9vLX+nnvwWIcEdtz80Ug++D8YH7q1XV8aX8z24i5iSX0WzrZBLiD/F3q3xgWb7XLbx9XM6KT6dlJhO6uoK/3apq8v+26X0dFJXvzC8XcpOJ+UmbNEp2/1/9ft927Z/AWtMw+8=' );
  await addStaticPuzzle( 'annotated-simple-8', classicStyle, 'eJytWF1v2jwU/i++9oWPP4+5WwuTqk2bNN7tZupFVtItUgYVpLybKv77bEIAG0eNaVSpIj6Pn+d82Y7zQrblelOtlmQClPxYFesFmbyQ5u9TSSbkptiUN/sx6nFN9VBuyOT7C/lDJoySv/v/2/Zh65929MwGrQ1SNh7YILCJgDO0ydbGU5wqsIXzdGsTqXkmsIXzMPCTBzYb+BnagAXOREYIFCNjmBoRGsPcRMYwOZFRBZqRUQeaMjSaQDMyYqAZGW2gKXf3lDwWyR46NRejQDkV9wcmSECASqoo7yA8AZFUU0NVBxEJiHAySG0HkQkIdzKukthhVAKjnI4rKLAOpBMg65RcYeEYlkmA0Gu5IsIxMkwFz/ZyzjHZwWwKJvaCmoI5pjKVbg9ykk5bH3HJnMu9pnXQ+51Dkk1TNOXZXnG7+v1Ul005LZqCtHX+VtTP7fMJ9j4YP+8H/8sDT0U/qewX5RlAvgZQMUBEABMDWATosnVO4eMuFz/LuR+IApu58UNMHtLG5H95jGNYNwfiw0bmqZaLYEztTmLky2xKvEv9FPztFCpBYc4pbj6+u/1whR+Y5wcmKOzbQwGWG0vKkZDldU9MigPyOIC9SnJ1ODzTlVR9QeS6YkdhSedFjhFRLgmkSFR2QKmN4AqaZEg6m0anaExmZsQYJMm84DgB5dMkd5fMHQqSq/GSZH+6Vv40/VL+dK/m0UEzj00huj14qoWP3RiLCixTnFvrjsRfRf04Ox5OGWt0eJl5H7q3QfPKNjyxsg/du+KGVx760MlNgfWhU5tZnyM9R7V7pa4281W9LZ3psag3pR/6v6zWi67Svp/8i83tql6tE69jp3FKHvzvUwsZlIoZZYxkimkjDoD5oV0/f/1vfjednb3GOe3V09NqUzXlkfrOEXGO3JG4P0SOaH2MVWI8Erj7NJA/drTjN5whCotoNFjFIOL/+mk6u3UKU5K+mez69JbPdd1paKMZSpAoGUPrr0vDNCBLQxgwXCjhQgSphmrwHA1QhhsQCt2WIVVc7F4NkaGhlHXpklajUShwcBwyQ0NoC1wxq6wFy0XcU70aKkMDQGnuyq4sRynk4FzpDA1EBCMlAy1RCDW4d01Orlx+UElXc79s+ODexZy+Ysy45aelsEKiHqxhc+rBlTXcrXImlGZ2cD0gZ6ELxsGdp6itYCyjeWHQSvc7+XJb1NXiaOt2dHfClw/NQSl+HYgsHbbb+f0dvvyTmvktsgT3/e7QSE18H4z33OEvrs8vp28CbcSU/C6adeWwhPhT7N3STWjWz+UuvoqPR8XHoxLjUV18zrie6uLDx/VUejyqi68t11PheFR2xBYds93f1O/3u93uH7tSEkk=' );
  await addStaticPuzzle( 'annotated-simple-9', classicStyle, 'eJytWE1v2zgQ/S8868Dh5zC3JnaBYBddoN72sshBjZWuANcObMXbItB/X9K2bJMewaIrBAgsztN7nA8OKb6zbbXe1Kslu4OCfVuV6zm7e2fNr9eK3bH7clPd78aKgGvq52rD7v55Zz/ZHS/Yr93/7f5hG57a4swGextQNhHZILLJiDO2qb1NUJw6ssXvmb1NUu/ZyBa/h9E8RWRz0TxjG/BoMokRIsXEGIdGxsY4NokxDk5i1JFmYjSRpoqNNtJMjBhpJkYXaar2qWAvJVlDp+LiBRSikE8HJiAgUKhCF6KDCAKiClPYQncQSUCkl8HCdRBFQISX8ZnEDqMJjPY6PqHAO5AhQM4r+cTC0S1LgDBo+STC0TOknOc7OT8x1cEcBZM7QVOAPYaSCncAeUmvbY44MuZqp+k89Kn1SLZpyqY66xUPqx+vi6qpJmVTsn2ev5aLt/3zCfYxGj+vh/ArAE9JP6nsFuUZQF0D6BQgE4BNATwBdNE6pwh+V/Pv1SwMJI5N/fjBpwDZ+xR+BYxnWDcH4sPaCFTLeTSm2pMYu//zw8MfLEyqn0QRJPqc5PN0coVC/D4FNQuT64ohSGwuiR6DhIoI5kUECQqXRyGvUdwaD+C5LJQ3Mct1dyzFAXkcwK+S3OyOyJwKVSQgc6fiRmGh46LG8CiXhOpqoLMdojrKDTSkS9mdCajWBDYzMtR6ziYh44LjOJRPQ3aXzDYH5Gq8JNmdOOpwwvhcffefK8nmO0tNMXq/Gdfz4Lu1DjU4roVwzh8T/i0XL9Pjhj28EWet5+ElIfrQvcWcl+LhSVB96N7VObxKoA9NNhDeh6YaX99E+s4GQ3ervlBTke4LHRm5NnwW1ZvZarGtvOmlXGyqMPRfVa/nXWWG+g+H04fVYrUmjtSn8YI9h9+nkreoNLfaWsU1N1YeALPD8vrry9+zx8n07CjutVevr6tN3VRH6kdPJAQKT+L/EAWiCz7WxHgi8PhpIH860Y7fCo4oHaI14DSHhP/Lp8n0wStMGP112fbpLd8Wi07DWMNRgULFObrwyTtMA7I0pAUrpJbeRVB6qIbI0QBthQWp0bc4pdNk92rIDA2tnQ+XcgatRomD/VAZGtI4EJo77Rw4IdOa6tXQGRoA2gifdu0EKqkGx8pkaCAiWKU4GIVS6sG1a3Ni5eODWvmch2UjBtcu5tQV59YvP6OkkwrNYA2Xkw+hnRV+lXOpDXeD8wE5C11yAX7/R+Mk5xnFC4NWeujky225qOdHW9fR/Ymkem4OSunxJbF02K7zh3uY6if15tfEEt3ZdJsG9eLHaLznHubiCuT9dK+z97hgP8pmXXssY2EX+7D0LzTrt6pNr1PGoxLjUcnxqC6upG6nuri8up3KjEd1cWN2OxWOR+VGLNExy/236v2pbdv/AatNlQ0=' );
  await addStaticPuzzle( 'annotated-simple-10', classicStyle, 'eJytWE1v2zgQ/S8868Dh5zC3JnaBYBddoN72sshBjZWuANcObMXbItB/X9K2bJMewaIrBAgszuN7nOHMiOI721brTb1asjso2LdVuZ6zu3fW/Hqt2B27LzfV/W6sCLimfq427O6fd/aT3fGC/dr93+4ftuGpLc5ssLcBZRORDSKbjDhjm9rbBMWpI1s8z+xtkppnI1s8D6N1isjmonXGNuDRYhIjRIqJMQ6NjI1xbBJjHJzEqCPNxGgiTRUbbaSZGDHSTIwu0lTtU8FeSjKHTsnFCyhEIZ8OTEBAoFCFLkQHEQREFaawhe4gkoBIL4OF6yCKgAgv43cSO4wmMNrr+A0F3oEMAXJeyW8sHN2yBAiDlt9EOHqGlPN8J+cXpjqYo2ByJ2gKsMdQUuEOIC/ptc0RR8Zc7TSdhz61Hsk2TdlUZ73iYfXjdVE11aRsSrbf56/l4m3/fIJ9jMbP8yH8CsDTpp9UdkV5BlDXADoFyARgUwBPAF20zimC39X8ezULA4ljUz9+8ClA9j6FXwHjGdbNgfhQG4FqOY/GRHsSY5+nExaW1E8hCAqZR0GtQp1T3P/54eGPKySKING/70omBbUKk+uKIUhsLokeg4SKCOZFBAkKl0chr1HcGg/guSyUNzHLdXcsxQGZJcOvktzsTmYDACpJQOYuxY3CQsdFjeFRLgnV1UBnO0R1lBtoSJeyOxNQrQlsZmSoes4mIeOC4ziUT0N2l8w2B2Q1XpLszj11OOd8rr77j6bkCDBLTTF6fySo58F3ax1qcFwL4Zw/rPxbLl6mx2PD8EacVc/DU0L0oXuTOW+Lh2+C6kP3VufwLIE+NNlAeB+aanx9C+k7Gwx9W/WFmop0X+jIyLXh46zezFaLbeVNL+ViU4Wh/6p6Pe8yM+R/OCI/rBarNXGwP40X7Dn8PqW8RaW51dYqrrmx8gCYHcrrry9/zx4n07MPAq+9en1dbeqmOlI/eiIhUHgS/4coEF3wsSbGE4HHTwP504V2/FZwROkQrQGnOST8Xz5Npg9eYcLob9y2T2/5tlh0GsYajgoUKs7RhQ/vYRqQpSEtWCG19C6C0kM1RI4GaCssSI2+xSmdbnavhszQ0Nr5cCln0GqUONgPlaEhjQOhudPOgRMyzaleDZ2hAaCN8NuunUAl1eBYmQwNRASrFAejUEo9OHdtTqx8fFArv+ehbMTg3MWcvOLc+vIzSjqp0AzWcDn7IbSzwlc5l9pwN3g/IKfQJRfg3/9onOQ8I3lhUKWHTr7clot6frR1Hd2fSKrn5qCUHl8SS4ftOn+4Dap+UjO/Jpbo5qh7aVATP0bjPbdBFxcx76fbpb3HBftRNuvaYxkLb7EPSz+hWb9VbXqpMx6VGI9Kjkd1cTF2O9XFFdrtVGY8qot7u9upcDwqN2KKjpnuv5XvT23b/g+mb7wl' );
  await addStaticPuzzle( 'annotated-simple-11', classicStyle, 'eJytWF1v2zoM/S969oOoTypva5MBxYYNWO72MvTBa9zNQJYUiZu7osh/n5TESaTQqJUZBYpYPD5HpEha0ivbVKt1vVywERTsx7JczdjolTUvTxUbsZtyXd3sxoqAa+qHas1G31/ZHzbiBXvZ/d/sHzbhaVuc2WBvA8omIhtENhlxxja1twmKU0e2+D2zt0nqPRvZ4vcwmqeIbC6aZ2wDHk0mMUKkmBjj0MjYGMcmMcbBSYw60kyMJtJUsdFGmokRI83E6CJNtb0v2GNJ5tApuXgBhSjk/YEJCAgUqtCFaCGCgKjCFLbQLUQSEOllsHAtRBEQ4WX8SmKL0QRGex2/oMBbkCFAziv5hYWjW5YAYdDyiwhHz5Bynu/k/MRUC3MUTO4ETQH2GEoq3AHkJb22OeLImKudpvPQ+61HsnVTNtVZr7hd/n6aV001LpuS7df5Wzl/3j+fYO+j8fN8CL8C8LToJ5VdUZ4B1FsAnQJkArApgCeANlrnFMHvavazmoaBxLGJHz/4FCB7n8KvgPEMq+ZAfOKtFrNoDLYnMXbz8d3tBxYm1U0CBIk4J/kyGb9BIQgKmUdBuSKHcEXlkiiCRP97PDIpqFmYXFcMQWJzSfQQJFREMC8iSFC4PAr5FsW18QCey0J5E7O87Y6lOCCPA8gekt1ESHcyuwhQSQLZTcANwkLHRQ3hUS4J1dVAZztEdZQraEiXsjsTUK0JbGZkqHrOJiHjgsM4lE9DdpfMNgdkNV6S7HZgddhxfal++uNbshmZpqYYvd+c1LPgu7UONTiuhXDOb5t+lfPHyXED0+9DHZpfzs4gp8Fn9Yn+qSa60J1Fkpc6/RdXdaE7q75/9kEXmmxMXctINtSuiXTtOfp+BbtCTUW6K3Rk5Lbh+Fmvp8v5pvKmZvVchZH/q3o1axM+lFU4A9wu58sVcXI5jRfsIfw+VZJFpbnV1iquubHyAJgeqvbz1/+md+PJ2YnHay+fnpbruqmO1HeeSAgUnsT/IQpEF1ysifFE4O5TT/50oi2/FRxROkRrwGkOCf/XT+PJrVcYM/oQv+3SWzzP562GsYajAoWKc3ThZqGfBmRpSAtWSC29i6B0Xw2RowHaCgtSo++cSqeL3akhMzS0dj5cyhm0GiX29kNlaEjjQGjutHPghExzqlNDZ2gAaCP8smsnUEnVO1YmQwMRwSrFwSiUUvfOXZsTKx8f1MqveSgb0Tt3MSevOLe+/IySTio0vTVcznoI7azwVc6lNtz1Xg/IKXTJBfhtBRonOc9IXuhV6aGRLzblvJ4dbWz0WM7XVdgWVQ/NQSndFSWWFtt2/nDdVf2h3vyWWKKrsfajQb34PhrvuO66uGl6PV2f7T0u2O+yWdUey1j4iL1bvBy+YOmt1XBUYjgqORzVxc3f9VQXd4TXU5nhqC4uJq+nwuGo3IApOmS6/1O+32+3279xSv0c' );

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

  const singleSquareBoard = standardSquareBoardGenerations[ 0 ][ 0 ];
  const diagonalSquareBoard = standardSquareBoardGenerations[ 1 ][ 0 ];
  const fourVertexBoard = vertexNonExit4PatternBoard;

  const onlyOneAcrossTwoRule = new PatternRule(
    singleSquareBoard,
    FeatureSet.fromFeatures( singleSquareBoard, [
      new FaceFeature( singleSquareBoard.faces[ 0 ], 2 ),
      new SectorOnlyOneFeature( singleSquareBoard.sectors[ 0 ] ),
    ] ),
    FeatureSet.fromFeatures( singleSquareBoard, [
      new FaceFeature( singleSquareBoard.faces[ 0 ], 2 ),
      new SectorOnlyOneFeature( singleSquareBoard.sectors[ 0 ] ),
      new SectorOnlyOneFeature( singleSquareBoard.sectors[ 2 ] ),
    ] ),
    false,
  );

  await addStaticRule( 'only-one-across-two', classicWithSectorsStyle, DisplayTiling.SQUARE, onlyOneAcrossTwoRule.getBinaryIdentifier() );

  const onlyOneCrossing = new PatternRule(
    fourVertexBoard,
    FeatureSet.fromFeatures( fourVertexBoard, [
      new SectorOnlyOneFeature( fourVertexBoard.sectors[ 0 ] ),
    ] ),
    FeatureSet.fromFeatures( fourVertexBoard, [
      new SectorOnlyOneFeature( fourVertexBoard.sectors[ 0 ] ),
      new SectorOnlyOneFeature( fourVertexBoard.sectors[ 2 ] ),
    ] ),
    false,
  );

  await addStaticRule( 'only-one-crossing', classicWithSectorsStyle, DisplayTiling.SQUARE, onlyOneCrossing.getBinaryIdentifier() );

  // Creation of incidence
  {
    const oneIncident = new PatternRule(
      diagonalSquareBoard,
      FeatureSet.fromFeatures( diagonalSquareBoard, [
        new FaceFeature( diagonalSquareBoard.faces[ 0 ], 1 ),
        new RedEdgeFeature( diagonalSquareBoard.edges[ 1 ] ),
        new RedEdgeFeature( diagonalSquareBoard.edges[ 2 ] ),
      ] ),
      FeatureSet.fromFeatures( diagonalSquareBoard, [
        new FaceFeature( diagonalSquareBoard.faces[ 0 ], 1 ),
        new RedEdgeFeature( diagonalSquareBoard.edges[ 1 ] ),
        new RedEdgeFeature( diagonalSquareBoard.edges[ 2 ] ),
        new SectorOnlyOneFeature( diagonalSquareBoard.sectors[ 3 ] ),
        new SectorOnlyOneFeature( diagonalSquareBoard.sectors[ 5 ] ),
      ] ),
      false,
    );

    await addStaticRule( 'one-incident-sector', classicWithSectorsStyle, DisplayTiling.SQUARE, oneIncident.getBinaryIdentifier() );

    const twoIncident = new PatternRule(
      diagonalSquareBoard,
      FeatureSet.fromFeatures( diagonalSquareBoard, [
        new FaceFeature( diagonalSquareBoard.faces[ 0 ], 2 ),
        new BlackEdgeFeature( diagonalSquareBoard.edges[ 1 ] ),
        new RedEdgeFeature( diagonalSquareBoard.edges[ 2 ] ),
      ] ),
      FeatureSet.fromFeatures( diagonalSquareBoard, [
        new FaceFeature( diagonalSquareBoard.faces[ 0 ], 2 ),
        new BlackEdgeFeature( diagonalSquareBoard.edges[ 1 ] ),
        new RedEdgeFeature( diagonalSquareBoard.edges[ 2 ] ),
        new SectorOnlyOneFeature( diagonalSquareBoard.sectors[ 3 ] ),
        new SectorOnlyOneFeature( diagonalSquareBoard.sectors[ 5 ] ),
      ] ),
      false,
    );

    await addStaticRule( 'two-incident-sector', classicWithSectorsStyle, DisplayTiling.SQUARE, twoIncident.getBinaryIdentifier() );

    const threeIncident = new PatternRule(
      diagonalSquareBoard,
      FeatureSet.fromFeatures( diagonalSquareBoard, [
        new FaceFeature( diagonalSquareBoard.faces[ 0 ], 3 ),
        new BlackEdgeFeature( diagonalSquareBoard.edges[ 1 ] ),
        new BlackEdgeFeature( diagonalSquareBoard.edges[ 2 ] ),
        new RedEdgeFeature( diagonalSquareBoard.edges[ 10 ] ),
      ] ),
      FeatureSet.fromFeatures( diagonalSquareBoard, [
        new FaceFeature( diagonalSquareBoard.faces[ 0 ], 3 ),
        new BlackEdgeFeature( diagonalSquareBoard.edges[ 1 ] ),
        new BlackEdgeFeature( diagonalSquareBoard.edges[ 2 ] ),
        new SectorOnlyOneFeature( diagonalSquareBoard.sectors[ 3 ] ),
        new SectorOnlyOneFeature( diagonalSquareBoard.sectors[ 5 ] ),
        new RedEdgeFeature( diagonalSquareBoard.edges[ 10 ] ),
      ] ),
      false,
    );

    await addStaticRule( 'three-incident-sector', classicWithSectorsStyle, DisplayTiling.SQUARE, threeIncident.getBinaryIdentifier() );

    const simpleIncident = new PatternRule(
      diagonalSquareBoard,
      FeatureSet.fromFeatures( diagonalSquareBoard, [
        new BlackEdgeFeature( diagonalSquareBoard.edges[ 0 ] ),
        new RedEdgeFeature( diagonalSquareBoard.edges[ 3 ] ),
      ] ),
      FeatureSet.fromFeatures( diagonalSquareBoard, [
        new BlackEdgeFeature( diagonalSquareBoard.edges[ 0 ] ),
        new RedEdgeFeature( diagonalSquareBoard.edges[ 3 ] ),
        new SectorOnlyOneFeature( diagonalSquareBoard.sectors[ 5 ] ),
      ] ),
      false,
    );

    await addStaticRule( 'simple-incident-sector', classicWithSectorsStyle, DisplayTiling.SQUARE, simpleIncident.getBinaryIdentifier() );
  }

  // Use of incidence
  {
    const oneIncidentReverse = new PatternRule(
      diagonalSquareBoard,
      FeatureSet.fromFeatures( diagonalSquareBoard, [
        new FaceFeature( diagonalSquareBoard.faces[ 0 ], 1 ),
        new SectorOnlyOneFeature( diagonalSquareBoard.sectors[ 3 ] ),
        new SectorOnlyOneFeature( diagonalSquareBoard.sectors[ 5 ] ),
      ] ),
      FeatureSet.fromFeatures( diagonalSquareBoard, [
        new FaceFeature( diagonalSquareBoard.faces[ 0 ], 1 ),
        new RedEdgeFeature( diagonalSquareBoard.edges[ 1 ] ),
        new RedEdgeFeature( diagonalSquareBoard.edges[ 2 ] ),
        new SectorOnlyOneFeature( diagonalSquareBoard.sectors[ 3 ] ),
        new SectorOnlyOneFeature( diagonalSquareBoard.sectors[ 5 ] ),
      ] ),
      false,
    );

    await addStaticRule( 'one-incident-reverse-sector', classicWithSectorsStyle, DisplayTiling.SQUARE, oneIncidentReverse.getBinaryIdentifier() );

    const twoIncidentReverseA = new PatternRule(
      diagonalSquareBoard,
      FeatureSet.fromFeatures( diagonalSquareBoard, [
        new FaceFeature( diagonalSquareBoard.faces[ 0 ], 2 ),
        new RedEdgeFeature( diagonalSquareBoard.edges[ 2 ] ),
        new SectorOnlyOneFeature( diagonalSquareBoard.sectors[ 3 ] ),
        new SectorOnlyOneFeature( diagonalSquareBoard.sectors[ 5 ] ),
      ] ),
      FeatureSet.fromFeatures( diagonalSquareBoard, [
        new FaceFeature( diagonalSquareBoard.faces[ 0 ], 2 ),
        new BlackEdgeFeature( diagonalSquareBoard.edges[ 1 ] ),
        new RedEdgeFeature( diagonalSquareBoard.edges[ 2 ] ),
        new SectorOnlyOneFeature( diagonalSquareBoard.sectors[ 3 ] ),
        new SectorOnlyOneFeature( diagonalSquareBoard.sectors[ 5 ] ),
      ] ),
      false,
    );

    await addStaticRule( 'two-incident-reverse-sector-a', classicWithSectorsStyle, DisplayTiling.SQUARE, twoIncidentReverseA.getBinaryIdentifier() );

    const twoIncidentReverseB = new PatternRule(
      diagonalSquareBoard,
      FeatureSet.fromFeatures( diagonalSquareBoard, [
        new FaceFeature( diagonalSquareBoard.faces[ 0 ], 2 ),
        new BlackEdgeFeature( diagonalSquareBoard.edges[ 1 ] ),
        new SectorOnlyOneFeature( diagonalSquareBoard.sectors[ 3 ] ),
        new SectorOnlyOneFeature( diagonalSquareBoard.sectors[ 5 ] ),
      ] ),
      FeatureSet.fromFeatures( diagonalSquareBoard, [
        new FaceFeature( diagonalSquareBoard.faces[ 0 ], 2 ),
        new BlackEdgeFeature( diagonalSquareBoard.edges[ 1 ] ),
        new RedEdgeFeature( diagonalSquareBoard.edges[ 2 ] ),
        new SectorOnlyOneFeature( diagonalSquareBoard.sectors[ 3 ] ),
        new SectorOnlyOneFeature( diagonalSquareBoard.sectors[ 5 ] ),
      ] ),
      false,
    );

    await addStaticRule( 'two-incident-reverse-sector-b', classicWithSectorsStyle, DisplayTiling.SQUARE, twoIncidentReverseB.getBinaryIdentifier() );

    const threeIncidentReverse = new PatternRule(
      diagonalSquareBoard,
      FeatureSet.fromFeatures( diagonalSquareBoard, [
        new FaceFeature( diagonalSquareBoard.faces[ 0 ], 3 ),
        new SectorOnlyOneFeature( diagonalSquareBoard.sectors[ 3 ] ),
        new SectorOnlyOneFeature( diagonalSquareBoard.sectors[ 5 ] ),
      ] ),
      FeatureSet.fromFeatures( diagonalSquareBoard, [
        new FaceFeature( diagonalSquareBoard.faces[ 0 ], 3 ),
        new BlackEdgeFeature( diagonalSquareBoard.edges[ 1 ] ),
        new BlackEdgeFeature( diagonalSquareBoard.edges[ 2 ] ),
        new SectorOnlyOneFeature( diagonalSquareBoard.sectors[ 3 ] ),
        new SectorOnlyOneFeature( diagonalSquareBoard.sectors[ 5 ] ),
        new RedEdgeFeature( diagonalSquareBoard.edges[ 10 ] ),
      ] ),
      false,
    );

    await addStaticRule( 'three-incident-reverse-sector', classicWithSectorsStyle, DisplayTiling.SQUARE, threeIncidentReverse.getBinaryIdentifier() );

    const simpleIncidentReverseA = new PatternRule(
      diagonalSquareBoard,
      FeatureSet.fromFeatures( diagonalSquareBoard, [
        new RedEdgeFeature( diagonalSquareBoard.edges[ 3 ] ),
        new SectorOnlyOneFeature( diagonalSquareBoard.sectors[ 5 ] ),
      ] ),
      FeatureSet.fromFeatures( diagonalSquareBoard, [
        new BlackEdgeFeature( diagonalSquareBoard.edges[ 0 ] ),
        new RedEdgeFeature( diagonalSquareBoard.edges[ 3 ] ),
        new SectorOnlyOneFeature( diagonalSquareBoard.sectors[ 5 ] ),
      ] ),
      false,
    );

    await addStaticRule( 'simple-incident-reverse-sector-a', classicWithSectorsStyle, DisplayTiling.SQUARE, simpleIncidentReverseA.getBinaryIdentifier() );

    const simpleIncidentReverseB = new PatternRule(
      diagonalSquareBoard,
      FeatureSet.fromFeatures( diagonalSquareBoard, [
        new BlackEdgeFeature( diagonalSquareBoard.edges[ 0 ] ),
        new SectorOnlyOneFeature( diagonalSquareBoard.sectors[ 5 ] ),
      ] ),
      FeatureSet.fromFeatures( diagonalSquareBoard, [
        new BlackEdgeFeature( diagonalSquareBoard.edges[ 0 ] ),
        new RedEdgeFeature( diagonalSquareBoard.edges[ 3 ] ),
        new SectorOnlyOneFeature( diagonalSquareBoard.sectors[ 5 ] ),
      ] ),
      false,
    );

    await addStaticRule( 'simple-incident-reverse-sector-b', classicWithSectorsStyle, DisplayTiling.SQUARE, simpleIncidentReverseB.getBinaryIdentifier() );
  }

  await addStaticRule( 'only-one-example-a', classicStyle, DisplayTiling.SQUARE, 'square-1-0/AAEIFBb/GyEiJv8=' );
  await addStaticRule( 'only-one-example-b', classicStyle, DisplayTiling.SQUARE, 'square-1-0/AAEIGyEiJv8UFv8=' );
  await addStaticRule( 'only-one-example-c', classicStyle, DisplayTiling.SQUARE, 'square-2-3/AAILJi0v/yczNf8=' );

  await addStaticRule( 'two-spike-sector', classicWithSectorsStyle, DisplayTiling.SQUARE, 'square-0-0/AAIR/xoiGCD/' );
  await addStaticRule( 'not-one-propagation', classicWithSectorsStyle, DisplayTiling.SQUARE, 'vertex-4-exit-two-opposite/AA4Q/xT/' );
  await addStaticRule( 'two-spike-from-sector', classicWithSectorsStyle, DisplayTiling.SQUARE, 'square-0-0/AAIW/x4cJP8=' );

  await addStaticRule( 'one-not-two', classicWithSectorsStyle, DisplayTiling.SQUARE, 'square-0-0/AAH/FxsfI/8=' );
  await addStaticRule( 'three-not-zero', classicWithSectorsStyle, DisplayTiling.SQUARE, 'square-0-0/AAP/FRkdIf8=' );
  await addStaticRule( 'not-zero-not-two-propagation', classicWithSectorsStyle, DisplayTiling.SQUARE, 'vertex-4-exit-two-opposite/AA//Ff8=' );

  await addStaticRule( 'second-diagonal-three', classicWithSectorsStyle, DisplayTiling.SQUARE, 'square-1-0/AAMI/xUXGyEiJCb/' );

  await addStaticRule( 'line-not-two', classicWithSectorsStyle, DisplayTiling.SQUARE, 'vertex-3-exit-two-adjacent/AAX/Ef8=' );
  await addStaticRule( 'adjacent-not-one', classicWithSectorsStyle, DisplayTiling.SQUARE, 'vertex-3-exit-two-adjacent/AAz/Ef8=' );
  await addStaticRule( 'not-zero-three-edge', classicWithSectorsStyle, DisplayTiling.SQUARE, 'vertex-3-exit-two-adjacent/AAoL/w//' );
  await addStaticRule( 'not-two-double', classicWithSectorsStyle, DisplayTiling.SQUARE, 'vertex-3-exit-two-adjacent/AAoNEf8G/w==' );
  await addStaticRule( 'adjacent-propagation', classicWithSectorsStyle, DisplayTiling.SQUARE, 'vertex-4-exit-three-adjacent/AA0SEP8W/w==' );
  await addStaticRule( 'two-partial-sector-a', classicWithSectorsStyle, DisplayTiling.SQUARE, 'square-0-0/AAIJ/xkd/w==' );
  await addStaticRule( 'two-partial-sector-b', classicWithSectorsStyle, DisplayTiling.SQUARE, 'square-0-0/AAIK/xsf/w==' );
  await addStaticRule( 'no-sector-loop', classicWithSectorsStyle, DisplayTiling.SQUARE, 'square-0-0/AAoM/xIf/w==' );
  await addStaticRule( 'two-sector-prop-a', classicWithSectorsStyle, DisplayTiling.SQUARE, 'square-0-0/AAIX/x3/' );
  await addStaticRule( 'two-sector-prop-b', classicWithSectorsStyle, DisplayTiling.SQUARE, 'square-0-0/AAIV/x//' );

  await addStaticRule( 'sector-parity-a', classicWithSectorsStyle, DisplayTiling.SQUARE, 'square-0-0/ABkXH/8j/w==' );
  await addStaticRule( 'sector-parity-b', classicWithSectorsStyle, DisplayTiling.SQUARE, 'square-0-0/ABUdG/8h/w==' );
  await addStaticRule( 'sector-parity-c', classicWithSectorsStyle, DisplayTiling.SQUARE, 'square-0-0/ABYe/xsj/w==' );
  await addStaticRule( 'sector-parity-d', classicWithSectorsStyle, DisplayTiling.SQUARE, 'square-0-0/ABYa/x8j/w==' );
  await addStaticRule( 'sector-parity-e', classicWithSectorsStyle, DisplayTiling.SQUARE, 'square-0-0/AA4W/yP/' );

  const unclearPuzzleString = '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';

  await addStaticPuzzle( 'unclear-classic', classicStyle, unclearPuzzleString );
  await addStaticPuzzle( 'unclear-colors', basicColorStyle, unclearPuzzleString, new Path(
    new Shape().moveTo( 2, 3 ).quadraticCurveTo( 2.5, 4, 2, 5 ),
    { stroke: 'red', lineWidth: 0.1, lineCap: 'round' }
  ) );

  await addStaticPuzzle( 'unclear-visible-red', redLinesVisibleColorsStyle, unclearPuzzleString );

  await addStaticPuzzle( 'rhombille-puzzle', redLinesVisibleColorsStyle, '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' );
  await addStaticPuzzle( 'hexagonal-puzzle', basicColorStyle, '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' );
  await addStaticPuzzle( 'cairo-puzzle', basicColorStyle, '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' );
  await addStaticPuzzle( 'floret-puzzle', basicColorStyle, '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' );
  await addStaticPuzzle( 'rhombitrihexagonal-puzzle', basicColorStyle, 'eJytWE1v20gM/S86q8aQnM/ctk0K9NIFNtteFj14E7Uw4MZB7HZbBPnv+8aRZEueaCRHARI40iM5JB/JoR+Ln9XDdrW5Ky6oLP7dLB9ui4vHYvf7viouirfLbfV2/6yMuN3qptoWF/88Fr+KC1UWv/d/f+KfN7zwYpw24jUbY51jvMD7N2rhTMA76401ZAKHp/JInlp5BZwKNnirtPLG1PL9F1Z35DlnXxYSCAdwRHhunHcdeanl9UKM0WSdwY/3VsaJ61rcLPCeDWtNTEobN+70JmM9Ezxbi9PCULCOcEpRQr41rxdkyFOQ4Fh5ctwRd7X4qZX29N2gdq37nDgthKxyWhEHhCaw78iHzOlVlyg5puWIRsOxzonXRDszVlTz7MxMkc5YNwttnQ+iSSHk1pquuMmlKiNfE63vox9XJOQa8V4xjCsS8hnnMzyjkGFO5vh8YF66R+VaVMO8F5pETpyHiZs7vWRyn4ke64z8MPHZZKp8mPhsh3OfO7wbLrtui2E/TPNMi+AwKJ6RFjVYJBmSCA3HaThJUlPszDEkNcXOHIKih63nJrgZFM+dPUOw4cYoGX4Nk1tyEzRjfJhvuZuLGgxbTpoGU57I+Jey+LpMXh8P90pT6lJKLqlUX2pzlIA5ALi0DYQTEA+IawCSAIRSAeIbiE5AcONQZWgQJoWg0kQ97Wlt8rS2xADGCMclgLiBupQ+eMZ7WOucT8H8Htb6F5IBeNbVekipgGO2YDrBDbzFmKPWW0rFHaMkgo6CQqnYY2IAxtKCUvHHXMBcjjjd4lJJgM1Qwl9fopdzGxZKpYP3oBidNjSUygjKKyo7hCaVC/RjDJ+IO3ibSgY6L3ByIGwqGzEkssdRy9pkPuLZkf0SPRFdVVq2cDIf8MMDVIppcamEoM8g3DgDzoqOJYfKSWUGbSWC6MgnTmUm4hAj/EXZUqmBBr7Y7pa76miFfLf5fr+udtXlcrcsnnvA5+X6x/P/B9j7zvPjXhE/ReChZxysSDzgEYD7AOoBJAcIOUBTGS8fgk6McB9hsjpsH6H6rp5YkX38q9tv1XV80AvwFZ7XsY2QGNt9ulYxPX9V31abu57Edf9VF73XUBb/VauH26sjjfGM7zbrzUMiw4fnZXETPz+neHWLfkjsRDsVAmnW8eK2B1w/+1b8+env6w+XV0fMgO3N/f1mu9pVreoPUOQthi2T146c8no/M1eJ5z0DHz6O1N8/aKPfekxpwqwzgXAFkJ7+Tx8vr97BwmWRHoRPL9m7+7FeNzYcLrhBiWHR2unQD9KLNmiKDYWbRhDrtVbKjzbBE0xYcWKUtnEFs4HGmpAJJsQhP8Hh9oW7kYsXqnE29BQ3FPhETsQZr7SMDpWZYIPZK2GllLPsFI32w06wob1lhasaBY1tSo/2w02w4eFE0B732aBZeHR1+Cn5MJ61oDSs0YHG5zxM4RURtPtg4Ie2EypwSpkTFBsTeYVVQo+vQZpS51Z7QqNipF5bfdIPXzYypdJBKZA31jm54NV4I1NqHfsLPFDo7ti9kJjRRqYUu2CTEfGBsCwFP8HIlGp32MNIgcEa6xOZ8eGaUu4CD3z8jZPM+/GeTKl3CnEKKuvZxqV4PIUnFTx7izpXQbyJ6/doI1MqPm7vFgNfGDXpRjcunlLwgpGOOokDl4RpdN55SsFrz/FrBlwgwC5F4z2ZUvAY6FZF6nrGLWVCuCYNd2uIkPqgyVnSo/POowoeL1d3P5fr1W37rrj4ulxvq3hfrm52taX+dbn3psE29+K4OlW/UpKfe286a1ZzpU4Jvu88H7s0PR6WsGePy+L7cvewAraAktX2jzsI7B5+VE/9rWQ+VSeb2vmqThah81Xp+VSdrHjnqzrZBc9X5eZT5edTdbJ0v4Kic9J9Rr7TjIQ//YLhFbpmpPzp1xqv0DUj6WlG1tOMtKcZec8z8p7n7PMz8v70K69X6HoV7788PT39D/QH8gQ=' );

  await addStaticRule( 'hex-five-five', basicColorStyle, DisplayTiling.HEXAGONAL, 'hexagonal-1-0/AAUM/xkdHyElJy0uLzEyNDX/' );
  await addStaticRule( 'hex-five-four-five', basicColorStyle, DisplayTiling.HEXAGONAL, 'hexagonal-2-2/AAQME/8wMjg8PkBDREZHSUpOT/8=' );

  await addStaticRule( 'general-rule-square', basicColorStyle, DisplayTiling.SQUARE, 'square-1-0/AAEIFBb/GyEiJv8=' );
  await addStaticRule( 'general-rule-rhombille', basicColorStyle, DisplayTiling.RHOMBILLE, 'square-1-0/AAEIFBb/GyEiJv8=' );
  await addStaticRule( 'general-rule-snub-square', basicColorStyle, DisplayTiling.SNUB_SQUARE, 'square-1-0/AAEIFBb/GyEiJv8=' );
  await addStaticRule( 'general-rule-deltoidal-trihexagonal', basicColorStyle, DisplayTiling.DELTOIDAL_TRIHEXAGONAL, 'square-1-0/AAEIFBb/GyEiJv8=' );
  await addStaticRule( 'general-rule-rhombitrihexagonal', basicColorStyle, DisplayTiling.RHOMBITRIHEXAGONAL, 'square-1-0/AAEIFBb/GyEiJv8=' );

  await addStaticPatternRule( 'general-rule-generic', 'square-1-0/AAEIFBb/GyEiJv8=' );

  await addStaticPuzzle( 'solved-puzzle', basicColorStyle, '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' );
  await addStaticPuzzle( 'partial-inside-outside-puzzle', basicLineStyle, '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' );

  const coloringPairsString = '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';
  await addStaticPuzzle( 'coloring-pairs-puzzle', basicColorStyle, coloringPairsString );
  await addStaticPuzzle( 'pure-coloring-pairs-puzzle', pureColorStyle, coloringPairsString );

  await addStaticRule( 'same-face-to-red-edge', basicColorStyle, DisplayTiling.SQUARE, serializedToBinary( `{"patternBoard":"single-edge","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,1],"secondaryFaces":[],"sameColorPaths":[[0]],"oppositeColorPaths":[]}]},"output":{"redEdges":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,1],"secondaryFaces":[],"sameColorPaths":[[0]],"oppositeColorPaths":[]}]}}` ) );
  await addStaticRule( 'opposite-face-to-black-edge', basicColorStyle, DisplayTiling.SQUARE, serializedToBinary( `{"patternBoard":"single-edge","input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[1],"sameColorPaths":[],"oppositeColorPaths":[[0]]}]},"output":{"blackEdges":[0],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[1],"sameColorPaths":[],"oppositeColorPaths":[[0]]}]}}` ) );

  await addStaticRule( 'color-no-checker', pureColorStyle, DisplayTiling.SQUARE, 'vertex-3-exit-two-adjacent/AP4AA4L//gADAYL/' );
  await addStaticRule( 'color-two-lines', pureColorStyle, DisplayTiling.SQUARE, 'vertex-3-exit-two-adjacent/AP4Agv4Bg//+AQCDgv8=' );
  await addStaticRule( 'color-no-checker-same', pureColorStyle, DisplayTiling.SQUARE, 'vertex-3-exit-two-adjacent/AP4AA/4BAv/+AQIAA/8=' );

  await addStaticRule( 'color-one-same-a', pureColorStyle, DisplayTiling.SQUARE, 'square-0-0/AAH+AQL//gOE/gECAP8=' );
  await addStaticRule( 'color-one-same-b', pureColorStyle, DisplayTiling.SQUARE, 'square-0-0/AAH+AQP//gKE/gEDAP8=' );
  await addStaticRule( 'color-one-opposite-a', pureColorStyle, DisplayTiling.SQUARE, 'square-0-0/AAH+AYL//gMEAP8=' );
  await addStaticRule( 'color-one-opposite-b', pureColorStyle, DisplayTiling.SQUARE, 'square-0-0/AAH+AYP//gIEAP8=' );
  await addStaticRule( 'color-two-same-a', pureColorStyle, DisplayTiling.SQUARE, 'square-0-0/AAL+AQL//gECg4T/' );
  await addStaticRule( 'color-two-same-b', pureColorStyle, DisplayTiling.SQUARE, 'square-0-0/AAL+AQP//gEDhIL/' );
  await addStaticRule( 'color-two-opposite-a', pureColorStyle, DisplayTiling.SQUARE, 'square-0-0/AAL+AQL//gECg4T/' );
  await addStaticRule( 'color-two-opposite-b', pureColorStyle, DisplayTiling.SQUARE, 'square-0-0/AAL+AYP//gKE/w==' );
  await addStaticRule( 'color-three-same-a', pureColorStyle, DisplayTiling.SQUARE, 'square-0-0/AAP+AQL//gOE/gECgP8=' );
  await addStaticRule( 'color-three-same-b', pureColorStyle, DisplayTiling.SQUARE, 'square-0-0/AAP+AQP//gKE/gEDgP8=' );
  await addStaticRule( 'color-three-opposite-a', pureColorStyle, DisplayTiling.SQUARE, 'square-0-0/AAP+AYL//gMEgP8=' );
  await addStaticRule( 'color-three-opposite-b', pureColorStyle, DisplayTiling.SQUARE, 'square-0-0/AAP+AYP//gIEgP8=' );
  await addStaticRule( 'color-three-adjacent', pureColorStyle, DisplayTiling.SQUARE, 'square-1-1/AAMI//4DAYWA/gYCh4T/' );
  await addStaticRule( 'color-no-loop', pureColorStyle, DisplayTiling.SQUARE, 'square-0-0/AP4DBAIB//4DBAIBAP8=' );

  await addStaticRule( 'color-opposite-to-only-one', sectorColorStyle, DisplayTiling.SQUARE, 'vertex-2-exit-one/AP4Bgv8L/w==' );
  await addStaticRule( 'color-same-to-not-one', sectorColorStyle, DisplayTiling.SQUARE, 'vertex-2-exit-one/AP4BAv8J/w==' );
  await addStaticRule( 'only-one-to-color', sectorColorStyle, DisplayTiling.SQUARE, 'vertex-2-exit-one/AAv//gGC/w==' );
  await addStaticRule( 'not-one-to-color', sectorColorStyle, DisplayTiling.SQUARE, 'vertex-2-exit-one/AAn//gEC/w==' );

  await addStaticRule( 'highlander-two', classicStyle, DisplayTiling.SQUARE, 'square-1-0/AQcODxARIib/ExkbIRwe/w==' );

  const circlesNode = new Node( {
    children: [
      new Circle( 0.2, {
        x: 1.5,
        y: 4,
        stroke: 'red',
        lineWidth: 0.1,
      } ),
      new Circle( 0.2, {
        x: 2,
        y: 3.5,
        stroke: 'red',
        lineWidth: 0.1,
      } ),
      new Path( new Shape().moveTo( 2, 5 ).lineTo( 2, 4 ).lineTo( 3, 4 ), { stroke: 'blue', lineWidth: 0.1 } ),
      new Path( new Shape().moveTo( 2, 5 ).lineTo( 3, 5 ).lineTo( 3, 4 ), { stroke: 'green', lineWidth: 0.1 } ),
    ]
  } );

  const firstHighlanderPuzzle = 'eJy1WE1v2zgQ/S8688CZ4adv2zgFcukCzbaXRQ7eRC0MuHFgO9kWgf/7Dv0hZyimFhPtoamt9/T45osW9dw8tav1fHnfTEA1/yxnq7tm8txsfj20zaT5MFu3H3bXVOJt5rftupn8/dz8bCZaNb92f5/2X57St616gcEegxKGAgOBkdCUmNljWNK0ApP3uT1Gpfu8wOR9YY+Z0n1RYPI+OCTGFhMDAszulKlBCcrcZKBMTgZaEWUGOhFKBnrhNgODcEsSjMKtBFELtxkIwm0GonCbgSTcZqARbo0ErXCbgU64zUDZQRkoWygDo3ArQdLCrZUgCLcZiMJtBpJwm4FGuM1AK9za7Y1qvs2Ke8Jps9AKFCq6OShBgQLKKKvwSMECxSinvLJHChUoTgUVlT9STIESFM8lT188kmyBRGyXhxA6y65AQjbM8wadaV8gWbYMiXckhQLJs2meP+hiiwVSTK55EMF1eSzlmreH5JzD7CKEYsIxmecJhNDxSllPEXJhuIC645VSn4J0iucSoeOV8p/i9IpHFLu8QakEvHFwEDyt2GUFSlVIJK14NrFLMZQKkUgcBC99yl+pFonEQbBq10ZQKkcicRCRqV3TlurBWwoHwXNMXV6wVI8UqVM8tdTlGUv1SJF6xQNMp2Ep1SNFGhTPMnVNjKV6pEij4rEmzh8zm/VmtmlfPABcLH88LNpNO51tZs1+2L/OFo/77yfaR3H95aaQPiXiafJPq+x+SV4Q8BzB5ATICPacgs8JOiPAWRNw1sWxtV5nHJvlxKCccdYH9nzoXQnbu+/tdbqQ1eiSrx/Kkyj78qRPicMKq81B+PAwlaTu78Q1vz0t1ny+nDbJUp0EmDoNX9KwdRq85vtFkAoiGCtFwv8lQpV5pVI4tSLsvCBSmVgqVacgstue5mk7+tx+5wNL1t7XOSTZqd35aeXfdr66uzy0f1JMA3WxXCxXhR3tdF01t+nzfmbmbNWijyGg1sZoF40/EK4Phv/88tf11fSyyR6PTiMrflqynTw9VS0fHpbr+abtbFzxos547wxoct4B2d2z2bxwPTNz9Snz8pp+HtRR3zj0gTSQC8ZEk+t/+TS9vOAVpnm4+kw894+LRRcDAWofYgQdvIWhS0DFEh4pakvRoQXtcHAYKKrkxbcgCyqprsJcsJxYY4jIRiDKG+pVc+d65uUaRMFSIB+5UaIdngBTsQYEj+DJxWi5a1KHD1vDVqxh0HOLsrhFQrI0dI1Y04/BuxCMcxiJNA5eA2qa3nrD5XYWIqEzenjX17Q98UDxaBnL/wcdBlcEaloroENyzgdE56wb3L5Q01s2eCBEA5YIjBvcv1DTXMGTDUZ7awM4/jd4kZpp52I7zdXnmhN6Gt5dvqbwNgaEYE3643F4JKFm3p1GzZNotXFa4+Duwpo5AQQbdKRIwVjrB0eCVXPieXPkH7/oeBqjH9zC3ZP6bxdhcH7/NFvM7zqsmXybLdZteqxpbzeHlfKnmgw5co+PL+ks1/4s3fk1Q8S57/jkU7rxo7j+ylmud355Pp0N9xGr5sdss5ozt2GR+fqPe75hs3pst/lpaTyp3pnp7VI0nlTvnPZ2qd759u1Sbjyp3qH67VK9k/PbpeKILTpmu4/Y7/2XFe/QGrHj+69I3qE1Ys/DiE0PI3Z9/4XRO7RG7Pv+a6p3aI25z4/Y9zhi3/dfydVo3Wy32/8AWjnC6A==';
  await addStaticPuzzle( 'highlander-puzzle-0', classicStyle, firstHighlanderPuzzle );
  await addStaticPuzzle( 'highlander-puzzle-1', classicStyle, firstHighlanderPuzzle, circlesNode );
  await addStaticPuzzle( 'highlander-puzzle-2', classicStyle, 'eJytWE1v20YQ/S8872FnZj99S2wHCFqkQNz0UuSgxkwqQLEMSXETGPrvnbVESrMaQ6TNS2LxPb5987VL8rF5aFfr+fKuuQDT/LOcrW6bi8dm8+u+bS6at7N1+/bpmim8zfxLu24u/n5sfjYX1jS/nv592P14KL+25giDHQYahgIDgZHQlJjbYahpeoHJ+8IOI+2+KDB5X9phTrsvC0zeB/vEeDUxIMDqTpkalKDMTQXK5FSgF1FWYBChVGAUbiswCbckwSzcShCtcFuBINxWIAq3FUjCbQU64dZJ0Au3FRiE2wqUHVSBsoUqMAu3EiQr3HoJgnBbgSjcViAJtxXohNsK9MKt3342zdeZuiccNgtrwKChz3slUChgnPEGOwoqFGeCicZ3FFIowSSTTewoTqEkw3PJ05c7kldIxHZ5CKG3HBQSsmGeN+hNR4Xk2TIUXkdKCimyaZ4/6GPLCikX1zyIEPo8arnm7aE45zD7CEFNOBbzPIGQep6W9RIhF4YLaHuelvoSZDA8lwg9T8t/iTMaHlHs8wZaCXjj4CB4WrHPCmhVKCRreDaxTzFohSgkDoKXPuRPq0UhcRCs2rcRaOUoJA4iM7VvWq0evKVwEDzH1OcFtXqUSIPhqaU+z6jVo0QaDQ8wHYZFq0eJNBmeZeqbGLV6lEiz4bEmzh8zm/VmtmmPHgAul9/vF+2mvZptZs1u2P+aLX7sfh9o78T1402h/FWIh8k/rPJ0khwR8BzB1QSoCP6cQqwJtiLAWRNw1kXXWs8zumY5MKhmnPWBJz7sUwnb22/tTblQ1eiar+/LUyi78pS/CocVVpu98P5hqkjd3YprcXtYrPl4fdUUS+MkwI3TiJqGH6fBa75eBK0iguFY5O3vby5/OyejeXmBTNBkRtYHSRPJI0XSFCJaOITjREirkBQZlFqt5YjGyvDCU8io6aWRQ0RaoceKcE0VkZFTRFr7KyJPZ9G8nD0f22/8dlrtZTc1JNm7vW1+W3rChUwBMzqHtjz5/jtbfL3u978xAzp8Du22PBnP1zfLxUPL2NfZYt0WgWIpWvbkwaWccyQ3xNKzHTm82PgcW21TPQC+9F87X912XkuRyoF0uVwsV8oTweG6ab6Uvw918RhzSsipcDZkF/eEm30P/PHpz5v3V9dN9XpxOPLEo1n1JFQ9MBbby/v75Xq+aXtX79lDcDEGB5ZCDEDedwWqr1fe3n/QrEGUXlD+hDNe6nx0XlzAmMgCheRcdrWXTx+uri/ZzVVtx55Z7+7HYtHHS4A2cjuCTdHD0CXOhXS8RETK1lMO6MEGHByGzKJMcZLVltRztT82lzwn1jki8hmI6l581hyNWIMoeUoUeS+K2Q9PgBuxBqSIECnk7LlrynAMW8OPWMNh5BZlcY+E5GnoGnlMP6YYUnKBd20ii4PXgDFN76PjcvM+nAmDs8O7fkzbEw8Uj5bz/H+yaXBFYExrJQxIIcSEGIIPg9sXxvSWTxEI0YEnAj6+Bi8yprm4IAkheVf+iTi8JmnMlASLlvvX8ylsLQ6uCQ7qrnJq3j3MFvPbHuuP/2bdftnsV6qfZyqk43anbHllb39qd/5VIeL1vjugtRvfievPvLKfvKY+Hj4B7CI2zffZZjVnbtOUJ4Y3d3zDZvWj3dYvxdNJnbwav1yKppM6eR1/udTJZ4yXS4XppE6+nbxc6uQDycul8oQtOmW7T9jvp9+kXqE1Yceffgl7hdaEPQ8TNj1M2PWn3wVfoTVh359+jXyF1pT7/IR9jxP2/emX1zFan7fb7f8YY0jW' );

  await addStaticRule( 'highlander-a', classicStyle, DisplayTiling.SQUARE, 'square-0-0/AQQFBgcIERL/CQsND/8=' );
  await addStaticRule( 'highlander-b', classicStyle, DisplayTiling.SQUARE, 'square-0-0/AQQFBgcIERP/CQsND/8=' );
  await addStaticRule( 'highlander-c', classicStyle, DisplayTiling.SQUARE, 'square-1-1/AQQJCgsMDQ4PExcZ/xD/' );
  await addStaticRule( 'highlander-d', classicStyle, DisplayTiling.SQUARE, 'square-2-0/AQQJDBUWLDD/GiD/' );
  await addStaticRule( 'highlander-e', classicStyle, DisplayTiling.SQUARE, 'square-2-4/AQIJDg8QKy3/JCb/' );
  await addStaticRule( 'highlander-f', classicStyle, DisplayTiling.SQUARE, 'square-1-0/AQkODxARHSIm/x7/' );
  await addStaticRule( 'highlander-g', classicStyle, DisplayTiling.SQUARE, 'square-1-0/AQkODxARHyIn/xoc/w==' );
  await addStaticRule( 'highlander-h', classicStyle, DisplayTiling.SQUARE, 'square-1-1/AQQJDQ4PER4i/xcYHP8=' );
  await addStaticRule( 'highlander-i', classicStyle, DisplayTiling.SQUARE, 'square-2-2/AQIGDg8QES8x/y4hJ/8=' );

} )();
