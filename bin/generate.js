import puppeteer from 'puppeteer';
import fs from 'fs';
import os from 'os';

// TODO: try to get in the habit of `nice -n 7 node bin/generate.js` -- but see what the command line arguments are

const sleep = async function( milliseconds ) {
  return new Promise( ( resolve, reject ) => {
    setTimeout( resolve, milliseconds );
  } );
};

os.setPriority( os.constants.priority.PRIORITY_LOW );

if ( process.argv.length !== 5 ) {
  throw new Error( `command line arguments required, ${process.argv.length} provided: ${process.argv.join( ' ' )}` );
}

const method = process.argv[ 2 ];
const generationIndex = parseInt( process.argv[ 3 ] );
const boardIndex = parseInt( process.argv[ 4 ] );

const name = {
  getOnlyImpliedSquareBoardRules: 'square-edge-only-implied',
  getOnlyImpliedSectorSquareBoardRules: 'square-sector-only-implied',
  getImpliedColorSquareBoardRules: 'square-color-implied',

  getOnlyImpliedHexBoardRules: 'hexagonal-edge-only-implied',
  getOnlyImpliedSectorHexBoardRules: 'hexagonal-sector-only-implied',
  getImpliedColorHexBoardRules: 'hexagonal-color-implied',

  getImpliedGeneralBoardRules: 'general-implied',
  getImpliedSectorGeneralBoardRules: 'general-sector-implied',
  getImpliedColorGeneralBoardRules: 'general-color-implied',

  getExisting_squareOnlyImpliedEdgeGeneration2RuleSets: 'square-edge-only-implied',
  getExisting_squareOnlyImpliedEdgeGeneration3RuleSets: 'square-edge-only-implied',
  getExisting_squareOnlyImpliedEdgeGeneration4RuleSets: 'square-edge-only-implied',
}[ method ];
if ( !name ) {
  throw new Error( `missing name for ${method}` );
}

const filename = `${name}-${generationIndex}-${boardIndex}.json`;
console.log( `starting ${method} ${generationIndex} ${boardIndex} into ${filename}` );

// TODO: potentially SKIP things that already exist? Or require regen confirmation

fs.mkdirSync( `./data/${name}`, { recursive: true } );

// Look up executable paths so we can have specific hardcoded paths for the Chrome version we want to use.
// We see an INSANE amount of speedup between chrome 100 and chrome 124. Probably bigint bitwise operations?
// `npx @puppeteer/browsers install chrome@124.0.6367.78`.
const executablePath = [
  '/Users/jon/puppeteer/chrome/mac_arm-124.0.6367.78/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  'C:\\Users\\olson\\puppeteer\\chrome\\win64-124.0.6367.78\\chrome-win64\\chrome.exe'
].find( path => fs.existsSync( path ) );

( async () => {
  const browser = await puppeteer.launch( {
    executablePath: executablePath,
    timeout: 0,
    protocolTimeout: 0,
    args: [
      '--disable-gpu'
    ]
  } );

  console.log( `browser version ${await browser.version()}` );

  const page = await browser.newPage();

  await page.setDefaultNavigationTimeout( 200000 );
  await page.setDefaultTimeout( 200000 );

  page.setCacheEnabled && page.setCacheEnabled( false );

  page.on( 'console', msg => {
    console.log( 'console', msg.text() );
  } );

  page.on( 'error', message => {
    throw new Error( message );
  } );
  page.on( 'pageerror', message => {
    throw new Error( message );
  } );

  page.on( 'load', async () => {
    await sleep( 500 );

    const expression = `${method}( ${generationIndex}, ${boardIndex} ).serialize()`;
    console.log( 'executing', expression );

    // const serialized = await page.evaluate( () => {
    //   return getOnlyImpliedSquareBoardRules( 1, 0 ).serialize();
    // } );

    const serialized = await page.evaluate( expression );

    if ( serialized.rules.length ) {
      fs.writeFileSync( `./data/${name}/${filename}`, JSON.stringify( serialized ), 'utf8' );
    }

    !page.isClosed() && await page.close();

    await browser.close();
  } );

  await page.goto( 'http://localhost/slither/dist/rule-gen.html', {
    timeout: 200000
  } );
} )();

