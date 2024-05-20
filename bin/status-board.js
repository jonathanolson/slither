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

  const sequenceFiles = fs.readdirSync( './data-sequences' ).sort();

  for ( const sequenceFile of sequenceFiles ) {
    const sequenceFilename = `./data-sequences/${sequenceFile}`;

    const isLocked = await lockfile.check( sequenceFilename, lockfileOptions );

    if ( isLocked ) {
      console.log( `LOCKED: ${sequenceFile}` );
    }
    else {
      const sequence = JSON.parse( fs.readFileSync( sequenceFilename, 'utf8' ) );

      const status = await evaluateHooks( `getSequenceStatus( ${JSON.stringify( sequence )} )` );

      console.log( status );
    }
  }

  await disposeBrowser( browser );
} )();
