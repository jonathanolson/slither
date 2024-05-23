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
    return evaluateHooks( `getCombinedBinaryCollection( ${JSON.stringify( a )}, ${JSON.stringify( b )} )` )
  };

  const combineNonredundant = async ( name, a, b ) => {
    console.log( name );
    return evaluateHooks( `getCombinedNonredundantBinaryCollection( ${JSON.stringify( a )}, ${JSON.stringify( b )} )` )
  };

  const combineNonredundantFromFirst = async ( name, a, b ) => {
    console.log( name );
    return evaluateHooks( `getCombinedNonredundantFromFirstBinaryCollection( ${JSON.stringify( a )}, ${JSON.stringify( b )} )` )
  };

  const combineWith = async ( name, unrestrictedCollectionNames, highlanderCollectionNames ) => {
    let unrestrictedCollection = loadCollectionFromSequence( unrestrictedCollectionNames[ 0 ] );

    for ( let i = 1; i < unrestrictedCollectionNames.length; i++ ) {
      unrestrictedCollection = await combineNonredundant( `${name} unrestricted ${i}`, unrestrictedCollection, loadCollectionFromSequence( unrestrictedCollectionNames[ i ] ) );
    }

    if ( highlanderCollectionNames.length ) {
      let highlanderCollection = loadCollectionFromSequence( highlanderCollectionNames[ 0 ] );

      for ( let i = 1; i < highlanderCollectionNames.length; i++ ) {
        highlanderCollection = await combine( `${name} highlander ${i}`, highlanderCollection, loadCollectionFromSequence( highlanderCollectionNames[ i ] ) );
      }

      return await combineNonredundantFromFirst( `${name} final`, unrestrictedCollection, highlanderCollection );
    }
    else {
      return unrestrictedCollection;
    }
  };

  const writeCollection = ( name, collection ) => {
    console.log( `writing ${name}` );
    fs.writeFileSync( `./data-collections/snapshot-${name}.json`, JSON.stringify( collection ), 'utf8' );
  };

  const writeWith = async ( name, unrestrictedCollectionNames, highlanderCollectionNames ) => {
    const collection = await combineWith( name, unrestrictedCollectionNames, highlanderCollectionNames );
    writeCollection( name, collection );
  };

  // TODO: find a better way than ignoring square-only / general color? do we just get color from ... general? Really want more



  // TODO: EEEEK highlander has ISSUES


  await writeWith( 'square-only-edge',
    [
      'square-only-edge-unrestricted',
    ],
    [
      'square-only-edge',
    ]
  );

  await writeWith( 'square-only-color',
    [
      'square-only-color-unrestricted',
    ],
    [
      // 'square-only-color', TODO: nope, BAD!
    ]
  );

  await writeWith( 'square-only-edge-sector',
    [
      'square-only-edge-sector-unrestricted',
      'square-only-edge-unrestricted',
    ],
    [
      'square-only-edge-sector',
      'square-only-edge',
    ]
  );

  await writeWith( 'square-only-all',
    [
      'square-only-all-unrestricted',
      'square-only-color-unrestricted',
      'square-only-edge-sector-unrestricted',
      'square-only-edge-unrestricted',
    ],
    [
      'square-only-all',
      'square-only-edge-sector',
      'square-only-edge',
    ]
  );

  await writeWith( 'general-edge',
    [
      'general-edge-unrestricted',
      'square-only-edge-unrestricted',
    ],
    [
      'general-edge',
      'square-only-edge',
    ]
  );

  await writeWith( 'general-color',
    [
      'general-color-unrestricted',
      'square-only-color-unrestricted',
    ],
    [
      // 'general-color', TODO: nope, BAD!
      // 'square-only-color', TODO: nope, BAD!
    ]
  );

  await writeWith( 'general-edge-sector',
    [
      'general-edge-sector-unrestricted',
      'general-edge-unrestricted',
      'square-only-edge-sector-unrestricted',
      'square-only-edge-unrestricted',
    ],
    [
      'general-edge-sector',
      'general-edge',
      'square-only-edge-sector',
      'square-only-edge',
    ]
  );

  await writeWith( 'general-all',
    [
      'general-all-unrestricted',
      'general-color-unrestricted',
      'general-edge-sector-unrestricted',
      'general-edge-unrestricted',
      'square-only-all-unrestricted',
      'square-only-color-unrestricted',
      'square-only-edge-sector-unrestricted',
      'square-only-edge-unrestricted',
    ],
    [
      'general-all',
      'general-edge-sector',
      'general-edge',
      'square-only-all',
      'square-only-edge-sector',
      'square-only-edge',
    ]
  );

  await disposeBrowser( browser );
} )();
