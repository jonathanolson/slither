import fs from 'fs';
import os from 'os';
import { browserEvaluate, disposeBrowser, getBrowser } from './puppeteer-tools.js';

os.setPriority( os.constants.priority.PRIORITY_LOW );

const getRuleSetFiles = name => {
  return fs.readdirSync( `./data/${name}` );
};

const getGenerationRuleSetFiles = ( name, generation ) => {
  return getRuleSetFiles( name ).filter( file => file.startsWith( `${name}-${generation}-` ) );
};

( async () => {
  const browser = await getBrowser();

  const emptyCollection = { patternBoards: [], rules: `eJyLjgUAARUAuQ==` };

  let collection = emptyCollection;

  const addRuleSet = async ( dir, filename ) => {
    console.log( `adding ${dir}/${filename}` );

    const ruleSetJSON = fs.readFileSync( `./data/${dir}/${filename}`, 'utf8' );
    collection = await browserEvaluate( browser, 'http://localhost/slither/dist/hooks.html', `addRuleSetToCollection( ${JSON.stringify( collection )}, ${ruleSetJSON} )` );
  };

  const addFullRuleSetDir = async dir => {
    const files = getRuleSetFiles( dir );

    for ( const file of files ) {
      await addRuleSet( dir, file );
    }
  };

  const addRuleSetGeneration = async ( dir, generation ) => {
    const files = getGenerationRuleSetFiles( dir, generation );

    for ( const file of files ) {
      await addRuleSet( dir, file );
    }
  };

  await addFullRuleSetDir( 'basic-edge' );
  await addRuleSetGeneration( 'square-edge-only-implied', 0 );
  await addRuleSetGeneration( 'square-edge-only-implied', 1 );

  console.log( collection );

  await disposeBrowser( browser );
} )();
