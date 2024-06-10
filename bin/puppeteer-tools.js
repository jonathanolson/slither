import puppeteer from 'puppeteer';
import fs from 'fs';
import os from 'os';

export const sleep = async function( milliseconds ) {
  return new Promise( ( resolve, reject ) => {
    setTimeout( resolve, milliseconds );
  } );
};

// Look up executable paths so we can have specific hardcoded paths for the Chrome version we want to use.
// We see an INSANE amount of speedup between chrome 100 and chrome 124. Probably bigint bitwise operations?
// `npx @puppeteer/browsers install chrome@124.0.6367.78`.
// see https://pptr.dev/supported-browsers for browser versions
const executablePath = [
  '/Users/jon/puppeteer/chrome/mac_arm-124.0.6367.78/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  'C:\\Users\\olson\\puppeteer\\chrome\\win64-124.0.6367.78\\chrome-win64\\chrome.exe',
  '/home/jon/chrome/linux-124.0.6367.78/chrome-linux64/chrome',
].find( path => fs.existsSync( path ) );

export const getBrowser = async () => {
  const browser = await puppeteer.launch( {
    executablePath: executablePath,
    timeout: 0,
    protocolTimeout: 0,
    args: [
      '--disable-gpu'
    ]
  } );

  console.log( `browser version ${await browser.version()}` );

  return browser;
};

export const disposeBrowser = async browser => {
  await browser.close();
};

export const browserEvaluate = async ( browser, url, evaluate ) => {
  return new Promise( async ( resolve, reject ) => {
    const page = await browser.newPage();

    await page.setDefaultNavigationTimeout( 200000 );
    await page.setDefaultTimeout( 200000 );

    page.setCacheEnabled && page.setCacheEnabled( false );

    page.on( 'console', msg => {
      const text = msg.text();

      if ( text.length < 10000 ) {
        console.log( 'console', text );
      }
      else {
        console.log( `console LONG MESSAGE ${text.length} length` );
      }
    } );

    page.on( 'error', message => {
      console.log( message );
      reject( message );
    } );
    page.on( 'pageerror', message => {
      console.log( message );
      reject( message );
    } );

    page.on( 'load', async () => {
      await sleep( 500 );

      try {
        const result = await page.evaluate( evaluate );

        !page.isClosed() && await page.close();

        resolve( result );
      }
      catch ( e ) {
        console.log( e );
        throw e;
      }
    } );

    await page.goto( url, {
      timeout: 200000
    } );
  } );
};
