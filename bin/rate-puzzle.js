import { browserEvaluate, disposeBrowser, getBrowser, sleep } from './puppeteer-tools.js';
import fs from 'fs';
import os from 'os';
import lockfile from 'proper-lockfile';

const boardType = process.argv[2];

if (boardType !== 'square-10x10') {
  throw new Error('unknown board type ' + boardType);
}

const lockfileOptions = {
  stale: 60000,
};

os.setPriority(os.constants.priority.PRIORITY_LOW);

(async () => {
  const browser = await getBrowser();

  const evaluateHooks = async (evaluate) => {
    return browserEvaluate(browser, 'http://localhost/slither/dist/hooks.html', evaluate);
  };

  const puzzleFilename = `./data/puzzles/minimized-puzzles.json`;

  const readPuzzles = () => {
    return JSON.parse(fs.readFileSync(puzzleFilename, 'utf8'));
  };

  const savePuzzles = (puzzles) => {
    fs.writeFileSync(puzzleFilename, JSON.stringify(puzzles));
    console.log('saved');
  };

  if (!fs.existsSync(puzzleFilename)) {
    const emptyPuzzles = [];
    savePuzzles(emptyPuzzles);
    console.log('wrote empty');
  }

  // TODO: factor out locking?

  const waitForLockCheck = async () => {
    let isLocked = true;
    while (isLocked) {
      isLocked = await lockfile.check(puzzleFilename, lockfileOptions);

      if (isLocked) {
        console.log('locked, waiting');
        await sleep(10000);
      }
    }
  };

  const getLock = async () => {
    // console.log( 'locking' );
    await waitForLockCheck();

    let release;

    while (true) {
      try {
        release = await lockfile.lock(puzzleFilename, lockfileOptions);
        break;
      } catch (e) {
        await waitForLockCheck();
      }
    }
    // console.log( 'locked' );

    return release;
  };

  const releaseLock = async (release) => {
    // console.log( 'unlocking' );
    await release();
    // console.log( 'unlocked' );
  };

  const cleanup = async () => {
    await disposeBrowser(browser);
  };

  // Loop until abort
  while (true) {
    let puzzles;
    {
      const minimizedRatedPuzzle = await evaluateHooks(`getMinimizedRatedPuzzle( ${JSON.stringify(boardType)} )`);

      const release = await getLock();

      puzzles = readPuzzles();
      puzzles.push(minimizedRatedPuzzle);
      savePuzzles(puzzles);

      await releaseLock(release);
    }
  }

  await cleanup();
})();
