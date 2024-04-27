import puppeteer from 'puppeteer';
import fs from 'fs';

const sleep = async function( milliseconds ) {
  return new Promise( ( resolve, reject ) => {
    setTimeout( resolve, milliseconds );
  } );
};

if ( process.argv.length < 5 ) {
  throw new Error( 'command line arguments required' );
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

( async () => {
  const browser = await puppeteer.launch( {
    args: [
      '--disable-gpu'
    ]
  } );

  const page = await browser.newPage();

  await page.setDefaultNavigationTimeout( 30000 );
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
    timeout: 30000
  } );
} )();

