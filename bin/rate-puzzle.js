import { browserEvaluate, disposeBrowser, getBrowser, sleep } from './puppeteer-tools.js';
import fs from 'fs';
import os from 'os';
import lockfile from 'proper-lockfile';

const lockfileOptions = {
  stale: 60000,
};

os.setPriority(os.constants.priority.PRIORITY_LOW);

const difficulty = process.argv[2];

if (!difficulty) {
  throw new Error('difficulty required');
}

(async () => {
  const browser = await getBrowser();

  const evaluateHooks = async (evaluate) => {
    return browserEvaluate(browser, 'http://localhost/slither/dist/hooks.html', evaluate);
  };

  // TODO: factor out locking?

  // Loop until abort
  while (true) {
    const boardShortNames = [
      'square-7x7',
      'square-10x10',
      'square-15x15',
      'square-20x20',
      'square-30x30',
      'rhombille-6x8',
      'rhombille-12x12',
      'rhombille-18x18',
      'hexagonal-3',
      'hexagonal-5',
      'hexagonal-8',
      'cairo-pentagonal-8x8',
      'cairo-pentagonal-12x12',
      'cairo-pentagonal-21x22',
      'snub-square-sq-5x6',
      'snub-square-sq-8x8',
      'snub-square-sq-16x16',
      'triangular-6x5',
      'triangular-10x10',
      'triangular-19x19',
      'trihexagonal-9x9',
      'trihexagonal-16x16',
      'snub-hexagonal-9x9',
      'snub-hexagonal-18x17',
      'floret-pentagonal-7x8',
      'floret-pentagonal-12x12',
      'floret-pentagonal-16x16',
      'deltoidal-trihexagonal-10x10',
      'deltoidal-trihexagonal-16x16',
      'deltoidal-trihexagonal-20x20',
      'portugal-10x10',
      'portugal-14x14',
      'portugal-20x19',
      'truncated-square-10x10',
      'truncated-square-16x16',
      'truncated-square-23x23',
      'rhombitrihexagonal-9x9',
      'rhombitrihexagonal-14x14',
      'rhombitrihexagonal-18x18',
      'great-rhombitrihexagonal-10x10',
      'great-rhombitrihexagonal-19x19',
      'prismatic-pentagonal-10x10',
      'prismatic-pentagonal-16x15',
      'prismatic-pentagonal-20x19',
      'elongated-triangular-sq-6x8',
      'elongated-triangular-sq-19x18',
      'penrose-6',
      'penrose-11',
      'penrose-14',
      'penrose-20',
    ];
    const selectedBoardNames =
      Math.random() < 0.5 ? boardShortNames : boardShortNames.filter((name) => name.startsWith('square'));

    const shortName = selectedBoardNames[Math.floor(Math.random() * selectedBoardNames.length)];
    console.log('shortName', shortName);

    const puzzleFilename = `./data/puzzles/${shortName}.json`;

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
      if (!fs.existsSync(puzzleFilename)) {
        console.log('does not exist');
        const emptyPuzzles = [];
        savePuzzles(emptyPuzzles);
        console.log('wrote empty');
      }

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

    const savePuzzles = (puzzles) => {
      console.log('saving');
      fs.writeFileSync(puzzleFilename, JSON.stringify(puzzles));
      console.log('saved');
    };

    const readPuzzles = () => {
      console.log('reading');
      return JSON.parse(fs.readFileSync(puzzleFilename, 'utf8'));
    };

    const minimizedRatedPuzzle = await evaluateHooks(
      `getMinimizedRatedPuzzle( ${JSON.stringify(shortName)}, ${JSON.stringify(difficulty)} )`,
    );

    if (minimizedRatedPuzzle !== null) {
      const release = await getLock();

      const puzzles = readPuzzles();
      puzzles.push(minimizedRatedPuzzle);
      savePuzzles(puzzles);

      await releaseLock(release);
    }
  }

  await disposeBrowser(browser);
})();
