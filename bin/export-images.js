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

( async () => {
  const remainingFiles = files.slice();

  const browser = await puppeteer.launch( {
    args: [
      '--disable-gpu',
      '--max-old-space-size=4096'
    ]
  } );

  const next = async () => {
    if ( remainingFiles ) {
      const file = remainingFiles.shift();

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

        const json = fs.readFileSync( file, 'utf8' );

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
        timeout: 30000
      } );
    }
    else {
      await browser.close();
    }
  };

  await next();
} )();

