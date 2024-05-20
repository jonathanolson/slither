import fs from 'fs';
import os from 'os';
import { browserEvaluate, disposeBrowser, getBrowser, sleep } from './puppeteer-tools.js';
import lockfile from 'proper-lockfile';

const boardType = process.argv.find( arg => arg === 'general' || arg === 'square' || arg === 'hexagonal' );
const highlander = !process.argv.includes( 'unrestricted' );
const vertexOrderLimit = process.argv.includes( 'only' ) ? (
  boardType === 'square' ? 4 : ( boardType === 'hexagonal' ? 6 : -1 )
) : null;
let solveEdges = false;
let solveSectors = false;
let solveFaceColors = false;
if ( process.argv.includes( 'all' ) ) {
  solveEdges = true;
  solveSectors = true;
  solveFaceColors = true;
}
else {
  if ( process.argv.includes( 'edge' ) ) {
    solveEdges = true;
  }
  if ( process.argv.includes( 'sector' ) ) {
    solveSectors = true;
  }
  if ( process.argv.includes( 'color' ) ) {
    solveFaceColors = true;
  }
}

if ( !boardType ) {
  throw new Error( `board type required, ${process.argv.length} provided: ${process.argv.join( ' ' )}` );
}
if ( vertexOrderLimit === -1 ) {
  throw new Error( `vertex order limit not supported for ${boardType}` );
}
if ( !solveEdges && !solveSectors && !solveFaceColors ) {
  throw new Error( `at least one of edge, sector, or face color must be specified` );
}

const sequenceSpecifier = {
  boardType,

  solveEdges,
  solveSectors,
  solveFaceColors,

  highlander,
  vertexOrderLimit,
};

const lockfileOptions = {
  stale: 60000,
};

os.setPriority( os.constants.priority.PRIORITY_LOW );

( async () => {
  const browser = await getBrowser();

  const evaluateHooks = async evaluate => {
    return browserEvaluate( browser, 'http://localhost/slither/dist/hooks.html', evaluate );
  };

  const sequenceName = await evaluateHooks( `getSequenceName( ${JSON.stringify( sequenceSpecifier )} )` );
  console.log( sequenceName );

  const sequenceFilename = `./data-sequences/${sequenceName}.json`;

  const readSequence = () => {
    return JSON.parse( fs.readFileSync( sequenceFilename, 'utf8' ) );
  };

  const saveSequence = sequence => {
    fs.writeFileSync( sequenceFilename, JSON.stringify( sequence ) );
    console.log( 'saved' );
  }

  if ( !fs.existsSync( sequenceFilename ) ) {
    const emptySequence = await evaluateHooks( `getEmptySequence( ${JSON.stringify( sequenceSpecifier )} )` );
    saveSequence( emptySequence );
    console.log( 'wrote empty' );
  }

  const waitForLockCheck = async () => {
    let isLocked = true;
    while ( isLocked ) {
      isLocked = await lockfile.check( sequenceFilename, lockfileOptions );

      if ( isLocked ) {
        console.log( 'locked, waiting' );
        await sleep( 10000 );
      }
    }
  };

  const getLock = async () => {
    // console.log( 'locking' );
    await waitForLockCheck();
    const release = await lockfile.lock( sequenceFilename, lockfileOptions );
    // console.log( 'locked' );

    return release;
  };

  const releaseLock = async release => {
    // console.log( 'unlocking' );
    await release();
    // console.log( 'unlocked' );
  };

  // Grab the next board
  let sequenceForNextBoard;
  let nextBoard;
  {
    const release = await getLock();

    sequenceForNextBoard = readSequence();
    nextBoard = await evaluateHooks( `getNextBoardInSequence( ${JSON.stringify( sequenceForNextBoard )} )` );

    if ( nextBoard ) {
      console.log( nextBoard );
      const sequenceWithProcessingNextBoard = await evaluateHooks( `getSequenceWithProcessingBoard( ${JSON.stringify( sequenceForNextBoard )}, ${JSON.stringify( nextBoard )} )` );
      saveSequence( sequenceWithProcessingNextBoard );
    }
    else {
      console.log( 'no next board' );
    }

    await releaseLock( release );
  }

  // TODO: add abort listening (based on a keypress) that will remove the board from the processing list

  const collection = await evaluateHooks( `getCollectionForSequence( ${JSON.stringify( sequenceForNextBoard )}, ${JSON.stringify( nextBoard )} )` );

  {
    const release = await getLock();

    const sequenceWithProcessingNextBoard = readSequence();
    const appendedCollection = await evaluateHooks( `getSequenceWithCollection( ${JSON.stringify( sequenceWithProcessingNextBoard )}, ${JSON.stringify( nextBoard )}, ${JSON.stringify( collection )} )` );
    saveSequence( appendedCollection );

    await releaseLock( release );
  }

  await disposeBrowser( browser );
} )();
