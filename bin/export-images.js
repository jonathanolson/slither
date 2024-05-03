import puppeteer from 'puppeteer';
import fs from 'fs';
import svgo from 'svgo';

// `node bin/export-images.js --max_old_space_size=8192 --stack-size=1024` to run this script with more memory
// TODO: it seems svgo can crash fairly easily, perhaps we should be more careful about how we're using it?

const IGNORE_TIMESTAMPS = false;

const sleep = async function( milliseconds ) {
  return new Promise( ( resolve, reject ) => {
    setTimeout( resolve, milliseconds );
  } );
};

// Get a list of all files recursively under the data directory, e.g. data/basic-color/basic-color-exit-5-4.json
let files = [];
const walkSync = function( dir ) {
  fs.readdirSync( dir, { withFileTypes: true } ).forEach( dirent => {
    if ( dirent.isDirectory() ) {
      walkSync( `${dir}/${dirent.name}` );
    }
    else {
      files.push( `${dir}/${dirent.name}` );
    }
  } );
};
walkSync( './data' );

// TODO: deduplicate these between our puppeteer tasks
// Look up executable paths so we can have specific hardcoded paths for the Chrome version we want to use.
// We see an INSANE amount of speedup between chrome 100 and chrome 124. Probably bigint bitwise operations?
// `npx @puppeteer/browsers install chrome@124.0.6367.78`.
// see https://pptr.dev/supported-browsers for browser versions
const executablePath = [
  '/Users/jon/puppeteer/chrome/mac_arm-124.0.6367.78/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  'C:\\Users\\olson\\puppeteer\\chrome\\win64-124.0.6367.78\\chrome-win64\\chrome.exe'
].find( path => fs.existsSync( path ) );

( async () => {
  const remainingFiles = files.slice();

  const browser = await puppeteer.launch( {
    executablePath: executablePath,
    timeout: 0,
    protocolTimeout: 0,
    args: [
      '--disable-gpu',
      '--max-old-space-size=4096'
    ]
  } );

  const next = async () => {
    if ( remainingFiles ) {
      const file = remainingFiles.shift();

      console.log( `checking ${file}` );
      const json = fs.readFileSync( file, 'utf8' );
      const data = JSON.parse( json );
      if ( data.rules.length > 5000 ) {
        console.log( `skipping ${file} due to ${data.rules.length} rules` );
        // Lazy skip?
        await next();
        return;
      }

      const outputPath = file.replace( '.json', '.svg' ).replace( '/data', '/images');

      // does outputPath exist, and if so, does it have a newer timestamp than our file?
      if ( !IGNORE_TIMESTAMPS && fs.existsSync( outputPath ) ) {
        const stat = fs.statSync( outputPath );
        if ( stat.mtimeMs > fs.statSync( file ).mtimeMs ) {
          await next();
          return;
        }
      }

      console.log( file );

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

        const expression = `serializedRuleSetToSVG( ${json} )`;

        // const serialized = await page.evaluate( () => {
        //   return getOnlyImpliedSquareBoardRules( 1, 0 ).serialize();
        // } );

        const svg = await page.evaluate( expression );

        // Ensure that the directories to outputPath exists with fs.mkdirSync / recursive:true
        const directory = outputPath.split( '/' ).slice( 0, -1 ).join( '/' );
        fs.mkdirSync( directory, { recursive: true } );

        let optimizedSVG = svg;

        try {
          optimizedSVG = svgo.optimize( svg, {
            multipass: true,
            plugins: [
              {
                name: 'preset-default',
                params: {
                  overrides: {
                    // We can't scale things and get the right bounds if the view box is removed.
                    removeViewBox: false
                  }
                }
              }
            ]
          } ).data;
        }
        catch ( e ) {
          console.log( 'PROBABLY A SVGO CRASH', e );
        }

        const moreMinifiedSVG = optimizedSVG
          .replace( /;stroke-miterlimit:10/g, '' )
          .replace( /;stroke:none/g, '' )

        fs.writeFileSync( outputPath, moreMinifiedSVG, 'utf8' );

        !page.isClosed() && await page.close();

        // Stack is probably fine, for our reasonable number of files?
        await next();
      } );

      await page.goto( 'http://localhost/slither/dist/export-ruleset-image.html', {
        timeout: 200000
      } );
    }
    else {
      await browser.close();
    }
  };

  await next();
} )();

