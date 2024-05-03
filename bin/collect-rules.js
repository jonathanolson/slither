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
    const ruleSetJSON = fs.readFileSync( `./data/${dir}/${filename}`, 'utf8' );
    collection = await browserEvaluate( browser, 'http://localhost/slither/dist/hooks.html', `addRuleSetToCollection( ${JSON.stringify( collection )}, ${ruleSetJSON} )` );
  };

  console.log( getRuleSetFiles( 'square-edge-only-implied' ) );
  console.log( getGenerationRuleSetFiles( 'square-edge-only-implied', 2 ) );

  const test = await browserEvaluate( browser, 'http://localhost/slither/dist/hooks.html', '1 + 2' );
  console.log( test );

  await addRuleSet( 'basic-edge', 'basic-edge.json' );

  console.log( collection );

  await disposeBrowser( browser );
} )();
