import fs from 'fs';
import os from 'os';
import { browserEvaluate, disposeBrowser, getBrowser } from './puppeteer-tools.js';

os.setPriority( os.constants.priority.PRIORITY_LOW );

( async () => {
  const browser = await getBrowser();

  const evaluateHooks = async evaluate => {
    return browserEvaluate( browser, 'http://localhost/slither/dist/hooks.html', evaluate );
  };

  for ( const mainName of [ 'general-edge', 'general-color', 'general-edge-color', 'general-edge-sector', 'general-all' ] ) {

    const loadCollection = suffix => {
      const filename = `./data/collections/${mainName}${suffix}.json`;

      if ( fs.existsSync( filename ) ) {
        return JSON.parse( fs.readFileSync( filename, 'utf8' ) );
      }
      else {
        return null;
      }
    };

    const mainCollection = loadCollection( '' );
    const fallbackCollection = loadCollection( '-fallback' );
    const highlanderCollection = loadCollection( '-highlander' );
    const highlanderFallbackCollection = loadCollection( '-highlander-fallback' );

    console.log( mainName );
    const mixedGroup = await evaluateHooks( `collectionsToSortedMixedGroup( ${JSON.stringify( mainCollection )}, ${JSON.stringify( fallbackCollection )}, ${JSON.stringify( highlanderCollection )}, ${JSON.stringify( highlanderFallbackCollection )},  )` );

    fs.writeFileSync( `./data/mixed-groups/${mainName}.json`, JSON.stringify( mixedGroup ), 'utf8' );
  }

  await disposeBrowser( browser );
} )();
