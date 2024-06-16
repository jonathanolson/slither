import { browserEvaluate, disposeBrowser, getBrowser } from './puppeteer-tools.js';
import fs from 'fs';
import os from 'os';

const name = process.argv[2];

const WRITE_FALLBACK = false;

os.setPriority(os.constants.priority.PRIORITY_LOW);

(async () => {
  const browser = await getBrowser();

  const evaluateHooks = async (evaluate) => {
    return browserEvaluate(browser, 'http://localhost/slither/dist/hooks.html', evaluate);
  };

  const loadCollectionFromSequence = (name) => {
    const sequence = JSON.parse(fs.readFileSync(`./data-sequences/${name}.json`, 'utf8'));
    return sequence.collection;
  };

  const withCollection = async (name, a, b) => {
    console.log(name);
    return evaluateHooks(`withCollection( ${JSON.stringify(a)}, ${JSON.stringify(b)} )`);
  };

  const withCollectionNonequal = async (name, a, b) => {
    console.log(name);
    return evaluateHooks(`withCollectionNonequal( ${JSON.stringify(a)}, ${JSON.stringify(b)} )`);
  };

  const withCollectionNonredundant = async (name, a, b) => {
    console.log(name);
    return evaluateHooks(`withCollectionNonredundant( ${JSON.stringify(a)}, ${JSON.stringify(b)} )`);
  };

  const withoutCollectionNonequal = async (name, a, b) => {
    console.log(name);
    return evaluateHooks(`withoutCollectionNonequal( ${JSON.stringify(a)}, ${JSON.stringify(b)} )`);
  };

  const withoutCollectionNonredundant = async (name, a, b) => {
    console.log(name);
    return evaluateHooks(`withoutCollectionNonredundant( ${JSON.stringify(a)}, ${JSON.stringify(b)} )`);
  };

  const arrayCombine = async (name, f, array) => {
    let result = array[0];

    for (let i = 1; i < array.length; i++) {
      result = await f(`${name} ${i}`, result, array[i]);
    }

    return result;
  };

  const writeToFile = (name, collection) => {
    console.log(`writing ${name}`);
    fs.writeFileSync(`./data/collections/${name}.json`, JSON.stringify(collection), 'utf8');
  };

  const writeWith = async (
    name,
    unrestrictedFullNames,
    unrestrictedFallbackNames,
    highlanderFullNames,
    highlanderFallbackNames,
  ) => {
    // non-redundant combine of all "unrestricted full"
    const unrestrictedFullCollection = await arrayCombine(
      `${name} unrestricted full`,
      withCollectionNonredundant,
      unrestrictedFullNames.map(loadCollectionFromSequence),
    );
    writeToFile(`${name}`, unrestrictedFullCollection);

    let unrestrictedCollection;
    if (WRITE_FALLBACK && unrestrictedFallbackNames.length) {
      // non-redundant combine all "unrestricted" (so we will filter out ANYTHING that can be derived IN ORDER)
      // NOTE: doing this combination so PARTS of the fallbacks get considered for redundancy when computing next things
      unrestrictedCollection = await arrayCombine(`${name} unrestricted fallback combine`, withCollectionNonredundant, [
        unrestrictedFullCollection,
        ...unrestrictedFallbackNames.map(loadCollectionFromSequence),
      ]);

      // Now, just filter out the DIRECT/EXACT rules from the "full"
      const unrestrictedFallbackCollection = await withoutCollectionNonequal(
        `${name} unrestricted fallback filter`,
        unrestrictedCollection,
        unrestrictedFullCollection,
      );
      writeToFile(`${name}-fallback`, unrestrictedFallbackCollection);
    } else {
      unrestrictedCollection = unrestrictedFullCollection;
    }

    if (highlanderFullNames.length) {
      // non-equal combine all "highlander full"
      const combinedHighlanderFullCollection = await arrayCombine(
        `${name} highlander full`,
        withCollectionNonequal,
        highlanderFullNames.map(loadCollectionFromSequence),
      );

      // non-redundant filter based on unrestricted
      const highlanderFullCollection = await withoutCollectionNonredundant(
        `${name} highlander full filter`,
        combinedHighlanderFullCollection,
        unrestrictedCollection,
      );
      writeToFile(`${name}-highlander`, highlanderFullCollection);

      if (WRITE_FALLBACK && highlanderFallbackNames.length) {
        // non-equal combine all "highlander fallback"
        const combinedHighlanderFallbackCollection = await arrayCombine(
          `${name} highlander fallback initial`,
          withCollectionNonequal,
          highlanderFallbackNames.map(loadCollectionFromSequence),
        );

        // non-equal filter (ignore the full-highlander rules)
        // TODO: in the future, we should filter out DOMINATING rules? IS THAT SAFE?
        const initialFilteredCollection = await withoutCollectionNonequal(
          `${name} highlander fallback initial non-equal filter`,
          combinedHighlanderFallbackCollection,
          combinedHighlanderFullCollection,
        );

        // non-redundant filter based on unrestricted
        const highlanderFallbackCollection = await withoutCollectionNonredundant(
          `${name} highlander fallback main filter`,
          initialFilteredCollection,
          unrestrictedCollection,
        );
        writeToFile(`${name}-highlander-fallback`, highlanderFallbackCollection);
      }
    }
  };

  if (name === 'general-edge') {
    await writeWith(
      'general-edge',
      ['general-edge-unrestricted', 'square-only-edge-unrestricted'],
      [],
      ['general-edge', 'square-only-edge'],
      [],
    );
  } else if (name === 'general-color') {
    await writeWith(
      'general-color',
      ['general-color-unrestricted', 'square-only-color-unrestricted'],
      [],
      [
        // 'general-color', TODO: nope, BAD!
      ],
      [
        // 'square-only-color', TODO: nope, BAD!
      ],
    );
  } else if (name === 'general-edge-color') {
    await writeWith(
      'general-edge-color',
      ['general-edge-color-unrestricted', 'square-only-edge-color-unrestricted'],
      [
        'general-color-unrestricted',
        'square-only-color-unrestricted',
        'general-edge-unrestricted',
        'square-only-edge-unrestricted',
      ],
      ['general-edge-color', 'square-only-edge-color'],
      [
        // 'general-color',
        'general-edge',
        // 'square-only-color',
        'square-only-edge',
      ],
    );
  } else if (name === 'general-edge-sector') {
    await writeWith(
      'general-edge-sector',
      ['general-edge-sector-unrestricted', 'square-only-edge-sector-unrestricted'],
      ['general-edge-unrestricted', 'square-only-edge-unrestricted'],
      ['general-edge-sector', 'square-only-edge-sector'],
      ['general-edge', 'square-only-edge'],
    );
  } else if (name === 'general-all') {
    await writeWith(
      'general-all',
      ['general-all-unrestricted', 'square-only-all-unrestricted'],
      [
        'general-edge-color-unrestricted',
        'square-only-edge-color-unrestricted',
        'general-color-unrestricted',
        'square-only-color-unrestricted',
        'general-edge-sector-unrestricted',
        'square-only-edge-sector-unrestricted',
        'general-edge-unrestricted',
        'square-only-edge-unrestricted',
      ],
      ['general-all', 'square-only-all'],
      [
        'general-edge-color',
        'square-only-edge-color',
        'general-edge-sector',
        'square-only-edge-sector',
        'general-edge',
        'square-only-edge',
      ],
    );
  } else {
    throw new Error('unknown name', name);
  }

  await disposeBrowser(browser);
})();
