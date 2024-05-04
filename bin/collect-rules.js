import fs from 'fs';
import os from 'os';
import { browserEvaluate, disposeBrowser, getBrowser } from './puppeteer-tools.js';

if ( process.argv.length !== 4 ) {
  throw new Error( `command line arguments required, ${process.argv.length} provided: ${process.argv.join( ' ' )}` );
}

const type = process.argv[ 2 ];
const maxScore = process.argv[ 3 ];

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
    console.log( `| ADDING ${dir}/${filename}` );

    const ruleSetJSON = fs.readFileSync( `./data/${dir}/${filename}`, 'utf8' );
    collection = await browserEvaluate( browser, 'http://localhost/slither/dist/hooks.html', `addRuleSetToCollection( ${JSON.stringify( collection )}, ${ruleSetJSON}, ${maxScore} )` );

    if ( !collection.rules ) {
      console.log( collection );
    }
    console.log( `  bytes: ${collection.rules.length}` );
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

  const addAllForGeneration = async ( dirs, generation ) => {
    for ( const dir of dirs ) {
      await addRuleSetGeneration( dir, generation );
    }
  };

  // TODO: bump up in the future if we need
  const maxGeneration = 6;

  const addAllGenerations = async dirs => {
    for ( let i = 0; i < maxGeneration; i++ ) {
      await addAllForGeneration( dirs, i );
    }
  };

  if ( type === 'edge' ) {
    await addFullRuleSetDir( 'basic-edge' );
    await addAllGenerations( [
      'general-implied',
      'square-edge-only-implied',
      'hexagonal-edge-only-implied',
    ] );
  }
  else if ( type === 'edge-highlander' ) {
    await addFullRuleSetDir( 'basic-edge' );
    await addAllGenerations( [
      'general-edge-highlander-implied',
      'general-implied',
      'square-edge-highlander-only-implied',
      'square-edge-only-implied',
      'hexagonal-edge-highlander-only-implied',
      'hexagonal-edge-only-implied',
    ] );
  }
  else if ( type === 'color' ) {
    await addFullRuleSetDir( 'basic-color-only' );
    await addFullRuleSetDir( 'basic-color' );
    await addAllGenerations( [
      'general-color-implied',
      'square-color-implied',
      'hexagonal-color-implied',
    ] );
  }
  else if ( type === 'all' ) {
    await addFullRuleSetDir( 'basic-edge' );
    await addFullRuleSetDir( 'basic-sector-implied' );
    await addFullRuleSetDir( 'basic-color-only' );
    await addFullRuleSetDir( 'basic-color' );
    await addFullRuleSetDir( 'basic-all' );
    await addFullRuleSetDir( 'dual-edge-color' );
    await addAllGenerations( [
      'general-implied',
      'general-sector-implied',
      'general-color-implied',
      'general-all-implied',
      'square-edge-only-implied',
      'square-sector-only-implied',
      'square-color-implied',
      'square-all-only-implied',
      'hexagonal-edge-only-implied',
      'hexagonal-sector-only-implied',
      'hexagonal-color-implied',
      'hexagonal-all-only-implied',
    ] );
  }
  else if ( type === 'all-highlander' ) {
    await addFullRuleSetDir( 'basic-edge' );
    await addFullRuleSetDir( 'basic-sector-implied' );
    await addFullRuleSetDir( 'basic-color-only' );
    await addFullRuleSetDir( 'basic-color' );
    await addFullRuleSetDir( 'basic-all' );
    await addFullRuleSetDir( 'dual-edge-color' );
    await addAllGenerations( [
      'general-edge-highlander-implied',
      'general-implied',
      'general-sector-highlander-implied',
      'general-sector-implied',
      'general-color-implied',
      'general-all-highlander-implied',
      'general-all-implied',
      'square-edge-highlander-only-implied',
      'square-edge-only-implied',
      'square-sector-highlander-only-implied',
      'square-sector-only-implied',
      'square-color-implied',
      'square-all-highlander-only-implied',
      'square-all-only-implied',
      'hexagonal-edge-highlander-only-implied',
      'hexagonal-edge-only-implied',
      'hexagonal-sector-highlander-only-implied',
      'hexagonal-sector-only-implied',
      'hexagonal-color-implied',
      'hexagonal-all-highlander-only-implied',
      'hexagonal-all-only-implied',
    ] );
  }
  else {
    throw new Error( 'unknown type', type );
  }

  fs.writeFileSync( `./data-collections/${type}-${maxScore}.json`, JSON.stringify( collection ), 'utf8' );

  console.log( collection );

  await disposeBrowser( browser );
} )();
