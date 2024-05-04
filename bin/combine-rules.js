import fs from 'fs';
import os from 'os';
import { browserEvaluate, disposeBrowser, getBrowser } from './puppeteer-tools.js';

if ( process.argv.length !== 5 ) {
  throw new Error( `command line arguments required, ${process.argv.length} provided: ${process.argv.join( ' ' )}` );
}

const a = process.argv[ 2 ];
const b = process.argv[ 3 ];
const output = process.argv[ 4 ];

os.setPriority( os.constants.priority.PRIORITY_LOW );

( async () => {
  const browser = await getBrowser();

  const collectionA = JSON.parse( fs.readFileSync( a, 'utf8' ) );
  const collectionB = JSON.parse( fs.readFileSync( b, 'utf8' ) );

  const collection = await browserEvaluate( browser, 'http://localhost/slither/dist/hooks.html', `combineCollections( ${JSON.stringify( collectionA )}, ${JSON.stringify( collectionB ) } )` );
  fs.writeFileSync( output, JSON.stringify( collection ), 'utf8' );

  console.log( collection );

  await disposeBrowser( browser );
} )();
