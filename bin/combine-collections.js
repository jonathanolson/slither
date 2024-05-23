import fs from 'fs';
import os from 'os';
import lockfile from 'proper-lockfile';
import { browserEvaluate, disposeBrowser, getBrowser } from './puppeteer-tools.js';

const lockfileOptions = {
  stale: 60000,
};

os.setPriority( os.constants.priority.PRIORITY_LOW );

( async () => {
  const browser = await getBrowser();

  const evaluateHooks = async evaluate => {
    return browserEvaluate( browser, 'http://localhost/slither/dist/hooks.html', evaluate );
  };

  const loadCollectionFromSequence = name => {
    const sequence = JSON.parse( fs.readFileSync( `./data-sequences/${name}.json`, 'utf8' ) );
    return sequence.collection;
  };

  const combine = async ( name, a, b ) => {
    console.log( name );
    return evaluateHooks( `getCombinedNonredundantBinaryCollection( ${JSON.stringify( a )}, ${JSON.stringify( b )} )` )
  };

  const combineArray = async ( name, collections ) => {
    console.log( name, 'composite' );

    let result = collections[ 0 ];

    for ( let i = 1; i < collections.length; i++ ) {
      result = await combine( `${name} ${i}`, result, collections[ i ] );
    }

    return result;
  };

  const writeCollection = async ( name, collection ) => {
    console.log( `writing ${name}` );
    fs.writeFileSync( `./data-collections/snapshot-${name}.json`, JSON.stringify( collection ), 'utf8' );
  };

  // TODO: find a better way than ignoring square-only / general color? do we just get color from ... general? Really want more

  const squareOnlyEdge = await combine( 'squareOnlyEdge', loadCollectionFromSequence( 'square-only-edge' ), loadCollectionFromSequence( 'square-only-edge-unrestricted' ) );
  writeCollection( 'square-only-edge', squareOnlyEdge );

  const squareOnlyColor = loadCollectionFromSequence( 'square-only-color-unrestricted' );
  writeCollection( 'square-only-color', squareOnlyColor );

  const squareOnlyEdgeSector = await combineArray( 'squareOnlyEdgeSector', [
    loadCollectionFromSequence( 'square-only-edge-sector' ),
    loadCollectionFromSequence( 'square-only-edge-sector-unrestricted' ),
    squareOnlyEdge,
  ] );
  writeCollection( 'square-only-edge-sector', squareOnlyEdgeSector );

  const squareOnlyAll = await combineArray( 'squareOnlyAll', [
    loadCollectionFromSequence( 'square-only-all' ),
    loadCollectionFromSequence( 'square-only-all-unrestricted' ),
    squareOnlyColor,
    squareOnlyEdgeSector,
  ] );
  writeCollection( 'square-only-all', squareOnlyAll );

  const generalEdge = await combineArray( 'generalEdge', [
    loadCollectionFromSequence( 'general-edge' ),
    loadCollectionFromSequence( 'general-edge-unrestricted' ),
    squareOnlyEdge
  ] );
  writeCollection( 'general-edge', generalEdge );

  const generalColor = await combineArray( 'generalColor', [
    loadCollectionFromSequence( 'general-color-unrestricted' ),
    squareOnlyColor
  ] );
  writeCollection( 'general-color', generalColor );

  const generalEdgeSector = await combineArray( 'generalEdgeSector', [
    loadCollectionFromSequence( 'general-edge-sector' ),
    loadCollectionFromSequence( 'general-edge-sector-unrestricted' ),
    generalEdge,
    squareOnlyEdgeSector,
  ] );
  writeCollection( 'general-edge-sector', generalEdgeSector );

  const generalAll = await combineArray( 'generalAll', [
    loadCollectionFromSequence( 'general-all' ),
    loadCollectionFromSequence( 'general-all-unrestricted' ),
    generalColor,
    generalEdgeSector,
    squareOnlyAll,
  ] );
  writeCollection( 'general-all', generalAll );

  await disposeBrowser( browser );
} )();
